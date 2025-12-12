const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  // Basic Information
  title: {
    type: String,
    enum: ['Mr', 'Mrs', 'Ms', 'Dr', ''],
    default: ''
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email']
  },
  password: {
    type: String,
    required: true,
    minlength: 8
  },
  phoneNumber: {
    type: String,
    required: true,
    match: [/^[6-9]\d{9}$/, 'Please add a valid 10-digit Indian mobile number']
  },
  
  // User Role
  userType: {
    type: String,
    enum: ['BUYER', 'MANUFACTURER', 'HYBRID'],
    required: true
  },
  
  // Company Information
  companyName: {
    type: String,
    required: true,
    trim: true
  },
  website: {
    type: String,
    default: ''
  },
  gstNumber: {
    type: String,
    default: ''
  },
  
  // Address
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  zipCode: {
    type: String,
    required: true,
    match: [/^[0-9]{5,6}$/, 'Please add a valid zip code']
  },
  country: {
    type: String,
    default: 'India'
  },
  
  // Manufacturer Specific Fields
  manufacturingTypes: [{
    type: String,
    enum: ['CNC', 'TURNING', 'MILLING', '3D_PRINTING', 'SHEET_METAL', 'DIE_CASTING', 'INJECTION_MOLDING', 'STAMPING', 'WELDING', 'ASSEMBLY', 'OTHER']
  }],
  companySize: {
    type: String,
    default: ''
  },
  yearsInBusiness: {
    type: Number,
    default: 0
  },
  facilityPhotos: [{
    type: String // URLs to S3
  }],
  maxDimensions: {
    height: { type: Number, default: 0 },
    width: { type: Number, default: 0 },
    length: { type: Number, default: 0 }
  },
  primaryMaterials: [{
    type: String
  }],
  certifications: [{
    type: String,
    enum: ['ISO_9001', 'ISO_13485', 'AS9100', 'IATF_16949', 'ROHS', 'OTHER']
  }],
  manufacturerStatus: {
    type: String,
    enum: ['PENDING_REVIEW', 'ACTIVE', 'SUSPENDED'],
    default: 'PENDING_REVIEW'
  },
  profileCompleteness: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  
  // Buyer Specific Fields
  industryVertical: {
    type: String,
    default: ''
  },
  annualSpending: {
    type: String,
    default: ''
  },
  procurementTeamSize: {
    type: String,
    default: ''
  },
  preferredLeadTime: {
    type: String,
    default: ''
  },
  
  // Buyer Settings (Profile defaults)
  buyerSettings: {
    defaultCountry: { type: String, default: '' },
    defaultRegion: { type: String, default: '' },
    preferredCurrency: { type: String, default: 'USD' },
    defaultIncoterms: { type: String, default: 'FOB' },
    communicationLanguage: { type: String, default: 'English' },
    savedShippingAddresses: [{
      name: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
      isDefault: { type: Boolean, default: false }
    }],
    billingInfo: {
      companyName: String,
      taxId: String,
      address: String,
      city: String,
      state: String,
      zipCode: String,
      country: String
    }
  },
  
  // Manufacturer Settings (Profile)
  manufacturerSettings: {
    technologies: [{
      type: String,
      enum: ['CNC', 'TURNING', 'MILLING', '3D_PRINTING', 'SHEET_METAL', 'DIE_CASTING', 'INJECTION_MOLDING', 'STAMPING', 'WELDING', 'ASSEMBLY', 'OTHER']
    }],
    materials: [{
      type: String
    }],
    partTypes: [{
      type: String // Tags
    }],
    machinery: [{
      type: String // Tags
    }],
    regionsServed: [{
      type: String
    }],
    languages: [{
      type: String
    }]
  },
  
  // Saved/Starred Manufacturers (for Buyers)
  savedManufacturers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  
  // Email Verification
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  
  // Password Reset
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  
  // Account Status
  status: {
    type: String,
    enum: ['ACTIVE', 'PENDING_VERIFICATION', 'SUSPENDED'],
    default: 'PENDING_VERIFICATION'
  },
  
  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

userSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

// Indexes for search
userSchema.index({ companyName: 'text', fullName: 'text' }); // Text search
userSchema.index({ userType: 1, manufacturerStatus: 1 });
userSchema.index({ 'manufacturerSettings.technologies': 1 });
userSchema.index({ 'manufacturerSettings.materials': 1 });
userSchema.index({ 'manufacturerSettings.partTypes': 1 });
userSchema.index({ 'manufacturerSettings.machinery': 1 });
userSchema.index({ country: 1, region: 1 });
userSchema.index({ certifications: 1 });
userSchema.index({ companySize: 1 });

module.exports = mongoose.model('User', userSchema);
