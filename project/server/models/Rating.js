const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String
  },
  categories: {
    quality: { type: Number, min: 1, max: 5 },
    onTimeDelivery: { type: Number, min: 1, max: 5 },
    communication: { type: Number, min: 1, max: 5 },
    price: { type: Number, min: 1, max: 5 }
  }
}, {
  timestamps: true
});

// Index
ratingSchema.index({ manufacturerId: 1 });
ratingSchema.index({ rfqId: 1 });

module.exports = mongoose.model('Rating', ratingSchema);

