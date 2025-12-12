const { S3Client, DeleteObjectCommand } = require('@aws-sdk/client-s3');
const { Upload } = require('@aws-sdk/lib-storage');
const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Configure AWS
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
  }
});


// File filter function - supports images, STL files, and documents
const fileFilter = (req, file, cb) => {
  const fileExt = path.extname(file.originalname).toLowerCase();
  const allowedImageTypes = /jpeg|jpg|png|gif|webp/;
  const allowedSTLTypes = /stl/;
  const allowedDocTypes = /pdf|doc|docx/;
  
  const isImage = allowedImageTypes.test(fileExt);
  const isSTL = allowedSTLTypes.test(fileExt);
  const isDoc = allowedDocTypes.test(fileExt);

  if (isImage || isSTL || isDoc) {
    return cb(null, true);
  } else {
    cb(new Error('File type not allowed! Only images, STL files, and documents (PDF, DOC, DOCX) are allowed.'), false);
  }
};

// Configure multer with dynamic file size limits
const createUpload = (maxSize = 5 * 1024 * 1024) => multer({
  storage: multer.memoryStorage(),
  fileFilter: fileFilter,
  limits: {
    fileSize: maxSize
  }
});

// Default upload (5MB for images)
const upload = createUpload(5 * 1024 * 1024);

// Large file upload (150MB for STL files)
const uploadLarge = createUpload(150 * 1024 * 1024);

// Medium file upload (50MB for extra files)
const uploadMedium = createUpload(50 * 1024 * 1024);

// Document upload (10MB for NDA)
const uploadDocument = createUpload(10 * 1024 * 1024);

// Function to upload to S3
const uploadToS3 = async (file, folder) => {
  const key = `${folder}/${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
  
  const upload = new Upload({
    client: s3,
    params: {
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: key,
      Body: file.buffer,
      ContentType: file.mimetype,
    }
  });

  await upload.done();
  return key;
};

// Function to delete file from S3
const deleteFromS3 = async (fileKey) => {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_S3_BUCKET_NAME,
      Key: fileKey
    });
    
    await s3.send(command);
    return true;
  } catch (error) {
    console.error('Error deleting file from S3:', error);
    return false;
  }
};

// Function to get CloudFront URL
const getCloudFrontUrl = (s3Key) => {
  return `${process.env.AWS_CLOUDFRONT_DOMAIN}/${s3Key}`;
};


const extractS3KeyFromUrl = (url) => {
  if (!url) return null;
  
  const cloudfrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
  if (url.startsWith(cloudfrontDomain)) {
    return url.replace(cloudfrontDomain + '/', '');
  }

  return url;
};

module.exports = {
  upload,
  uploadLarge,
  uploadMedium,
  uploadDocument,
  uploadToS3,
  deleteFromS3,
  getCloudFrontUrl,
  extractS3KeyFromUrl,
  s3
};