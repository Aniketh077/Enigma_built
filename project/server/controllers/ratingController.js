const Rating = require('../models/Rating');
const RFQ = require('../models/RFQ');
const User = require('../models/User');

// @desc    Create rating
// @route   POST /api/ratings
// @access  Private (Buyer only)
const createRating = async (req, res) => {
  try {
    const { rfqId, rating, comment, categories } = req.body;
    const buyerId = req.user._id;

    const rfq = await RFQ.findById(rfqId);
    if (!rfq) {
      return res.status(404).json({ message: 'RFQ not found' });
    }

    if (rfq.buyerId.toString() !== buyerId.toString()) {
      return res.status(403).json({ message: 'Only the buyer can rate' });
    }

    if (rfq.status !== 'DELIVERED' && rfq.status !== 'SHIPPED') {
      return res.status(400).json({ message: 'Can only rate delivered RFQs' });
    }

    // Check if already rated
    const existingRating = await Rating.findOne({ rfqId, buyerId });
    if (existingRating) {
      return res.status(400).json({ message: 'RFQ already rated' });
    }

    const newRating = await Rating.create({
      rfqId,
      buyerId,
      manufacturerId: rfq.selectedManufacturerId,
      rating,
      comment,
      categories
    });

    // Update RFQ status to CLOSED
    rfq.status = 'CLOSED';
    rfq.closedAt = new Date();
    await rfq.save();

    // Update manufacturer's average rating
    await updateManufacturerRating(rfq.selectedManufacturerId);

    res.status(201).json({
      success: true,
      data: newRating
    });
  } catch (error) {
    console.error('Create rating error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get ratings for manufacturer
// @route   GET /api/ratings
// @access  Private
const getRatings = async (req, res) => {
  try {
    const { manufacturerId } = req.query;

    if (!manufacturerId) {
      return res.status(400).json({ message: 'manufacturerId is required' });
    }

    const ratings = await Rating.find({ manufacturerId })
      .populate('buyerId', 'fullName companyName')
      .populate('rfqId', 'title')
      .sort({ createdAt: -1 });

    // Calculate average
    const avgRating = ratings.length > 0
      ? ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length
      : 0;

    res.json({
      success: true,
      data: ratings,
      averageRating: avgRating,
      totalRatings: ratings.length
    });
  } catch (error) {
    console.error('Get ratings error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Get rating by RFQ
// @route   GET /api/ratings/rfq/:rfqId
// @access  Private
const getRatingByRFQ = async (req, res) => {
  try {
    const rating = await Rating.findOne({ rfqId: req.params.rfqId })
      .populate('buyerId', 'fullName companyName')
      .populate('manufacturerId', 'fullName companyName');

    if (!rating) {
      return res.status(404).json({ message: 'Rating not found' });
    }

    res.json({
      success: true,
      data: rating
    });
  } catch (error) {
    console.error('Get rating by RFQ error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// Helper function to update manufacturer rating
const updateManufacturerRating = async (manufacturerId) => {
  try {
    const ratings = await Rating.find({ manufacturerId });
    if (ratings.length === 0) return;

    const avgRating = ratings.reduce((sum, r) => sum + r.rating, 0) / ratings.length;
    
    // Store in user profile (can add rating field to User model if needed)
    // For now, we'll calculate on the fly
  } catch (error) {
    console.error('Update manufacturer rating error:', error);
  }
};

module.exports = {
  createRating,
  getRatings,
  getRatingByRFQ
};

