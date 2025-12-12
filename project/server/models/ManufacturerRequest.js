const mongoose = require('mongoose');

const manufacturerRequestSchema = new mongoose.Schema({
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'WITHDRAWN'],
    default: 'PENDING'
  },
  message: {
    type: String
  },
  proposedLeadTime: {
    type: Number, // days
    required: true
  },
  technologyMatch: {
    type: Boolean,
    default: false
  },
  materialMatch: {
    type: Boolean,
    default: false
  },
  matchScore: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  requestedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  rejectionReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index
manufacturerRequestSchema.index({ rfqId: 1, manufacturerId: 1 });
manufacturerRequestSchema.index({ manufacturerId: 1, status: 1 });

module.exports = mongoose.model('ManufacturerRequest', manufacturerRequestSchema);

