const mongoose = require('mongoose');

const chatMessageSchema = new mongoose.Schema({
  rfqId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'RFQ',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    type: String // File URLs
  }],
  read: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index
chatMessageSchema.index({ rfqId: 1, createdAt: -1 });
chatMessageSchema.index({ senderId: 1 });

module.exports = mongoose.model('Chat', chatMessageSchema);

