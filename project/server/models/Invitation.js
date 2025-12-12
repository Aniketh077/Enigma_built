const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  manufacturerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['PENDING', 'ACCEPTED', 'DECLINED'],
    default: 'PENDING'
  },
  message: {
    type: String
  },
  invitedAt: {
    type: Date,
    default: Date.now
  },
  respondedAt: {
    type: Date
  },
  declineReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index
invitationSchema.index({ manufacturerId: 1, status: 1 });
invitationSchema.index({ rfqId: 1 });

module.exports = mongoose.model('Invitation', invitationSchema);

