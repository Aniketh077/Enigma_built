const express = require('express');
const router = express.Router();
const { upload, uploadLarge, uploadMedium, uploadDocument, uploadToS3, getCloudFrontUrl } = require('../utils/s3Upload');
const { protect, admin } = require('../middlewares/auth');
const axios = require('axios');

// @desc    Upload single file (image, STL, document)
// @route   POST /api/upload/single
// @access  Private
router.post('/single', protect, async (req, res) => {
  try {
    // Get file type from query or body (after multer processes it)
    const fileType = req.query.type || 'image';
    let uploadMiddleware;

    if (fileType === 'stl') {
      uploadMiddleware = uploadLarge.single('file');
    } else if (fileType === 'document') {
      uploadMiddleware = uploadDocument.single('file');
    } else if (fileType === 'extra') {
      uploadMiddleware = uploadMedium.single('file');
    } else {
      // For images, accept both 'file' and 'image' field names
      uploadMiddleware = upload.fields([
        { name: 'file', maxCount: 1 },
        { name: 'image', maxCount: 1 }
      ]);
    }

    uploadMiddleware(req, res, async (err) => {
      if (err) {
        console.error('Multer error:', err);
        return res.status(400).json({ message: err.message || 'File upload failed' });
      }

      // Handle both single file and fields scenarios
      let file;
      if (req.file) {
        file = req.file;
      } else if (req.files) {
        file = req.files.file ? req.files.file[0] : req.files.image ? req.files.image[0] : null;
      }

      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Store the file in req.file for consistency
      req.file = file;

      // Determine folder based on file type (from query or body after multer)
      const finalFileType = req.body.type || req.query.type || fileType;
      let folder = req.query.folder || req.body.folder;
      if (!folder) {
        if (finalFileType === 'stl') {
          folder = 'stl-files';
        } else if (finalFileType === 'document') {
          folder = 'documents';
        } else {
          folder = 'images';
        }
      }

      try {
        const s3Key = await uploadToS3(req.file, folder);
        const cloudFrontUrl = getCloudFrontUrl(s3Key);

        res.json({
          success: true,
          message: 'File uploaded successfully',
          data: {
            url: cloudFrontUrl,
            key: s3Key,
            size: req.file.size,
            mimetype: req.file.mimetype
          },
          url: cloudFrontUrl // For backward compatibility
        });
      } catch (s3Error) {
        console.error('S3 upload error:', s3Error);
        res.status(500).json({ message: 'Error uploading to S3', error: s3Error.message });
      }
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading file', error: error.message });
  }
});

// @desc    Upload multiple images
// @route   POST /api/upload/multiple
// @access  Private
router.post('/multiple', protect, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const folder = req.query.folder || req.body.folder || 'images';
    const uploadedFiles = [];

    for (const file of req.files) {
      const s3Key = await uploadToS3(file, folder);
      uploadedFiles.push({
        url: getCloudFrontUrl(s3Key),
        key: s3Key,
        size: file.size,
        mimetype: file.mimetype
      });
    }

    res.json({
      message: 'Files uploaded successfully',
      files: uploadedFiles,
      urls: uploadedFiles.map(file => file.url)
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading files', error: error.message });
  }
});

// @desc    Upload product images
// @route   POST /api/upload/product
// @access  Private/Admin
router.post('/product', protect, admin, (req, res, next) => {
  req.uploadFolder = 'products';
  next();
}, upload.array('images', 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: 'No files uploaded' });
    }

    const uploadedImages = req.files.map(file => getCloudFrontUrl(file.key));
    
    res.json({
      message: 'Product images uploaded successfully',
      images: uploadedImages
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading product images' });
  }
});

// @desc    Upload category image
// @route   POST /api/upload/category
// @access  Private/Admin
router.post('/category', protect, admin, (req, res, next) => {
  req.uploadFolder = 'categories';
  next();
}, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const cloudFrontUrl = getCloudFrontUrl(req.file.key);
    
    res.json({
      message: 'Category image uploaded successfully',
      image: cloudFrontUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading category image' });
  }
});

// @desc    Upload type logo
// @route   POST /api/upload/type
// @access  Private/Admin
router.post('/type', protect, admin, (req, res, next) => {
  req.uploadFolder = 'types';
  next();
}, upload.single('logo'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    const cloudFrontUrl = getCloudFrontUrl(req.file.key);

    res.json({
      message: 'type logo uploaded successfully',
      logo: cloudFrontUrl
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Error uploading type logo' });
  }
});

// @desc    Proxy STL files to bypass CORS
// @route   GET /api/upload/proxy-stl
// @access  Public (but should only be used for STL viewing)
router.get('/proxy-stl', async (req, res) => {
  try {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ message: 'URL parameter is required' });
    }

    // Decode URL in case it's double-encoded
    const decodedUrl = decodeURIComponent(url);

    // Validate that the URL is from our CloudFront domain or contains stl-files path
    const cloudFrontDomain = process.env.AWS_CLOUDFRONT_DOMAIN;
    if (cloudFrontDomain && !decodedUrl.startsWith(cloudFrontDomain) && !decodedUrl.includes('stl-files')) {
      console.log('Invalid STL URL:', decodedUrl);
      return res.status(403).json({ message: 'Invalid URL - must be from CloudFront domain' });
    }

    console.log('Proxying STL file from:', decodedUrl);

    // Fetch the file from S3/CloudFront
    const response = await axios.get(decodedUrl, {
      responseType: 'arraybuffer',
      headers: {
        'Accept': 'application/octet-stream, model/stl, */*'
      },
      timeout: 30000
    });

    // Set appropriate headers with CORS support
    res.set({
      'Content-Type': response.headers['content-type'] || 'application/octet-stream',
      'Content-Length': response.headers['content-length'],
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
      'Cache-Control': 'public, max-age=86400',
      'Accept-Ranges': 'bytes'
    });

    // Send the file data
    res.send(Buffer.from(response.data));
  } catch (error) {
    console.error('Proxy STL error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    res.status(500).json({
      message: 'Error proxying STL file',
      error: error.message,
      details: error.response ? `HTTP ${error.response.status}` : 'Network error'
    });
  }
});

// Handle OPTIONS request for CORS preflight
router.options('/proxy-stl', (req, res) => {
  res.set({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, Range',
    'Access-Control-Max-Age': '86400'
  });
  res.status(204).send();
});

module.exports = router;