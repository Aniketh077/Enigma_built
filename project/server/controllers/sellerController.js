const SellerRequest = require('../models/SellerRequest');

exports.createSellerRequest = async (req, res) => {
  try {
    const { name, email, phoneNumber, companyName } = req.body;

    if (!name || !email || !phoneNumber || !companyName) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const existingRequest = await SellerRequest.findOne({
      $or: [{ email }, { phoneNumber }],
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({
        success: false,
        message: 'A request with this email or phone number is already pending'
      });
    }

    const sellerRequest = await SellerRequest.create({
      name,
      email,
      phoneNumber,
      companyName
    });

    res.status(201).json({
      success: true,
      message: 'Seller request submitted successfully',
      data: sellerRequest
    });
  } catch (error) {
    console.error('Error creating seller request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit seller request',
      error: error.message
    });
  }
};

exports.getAllSellerRequests = async (req, res) => {
  try {
    const { status, search, page = 1, limit = 10 } = req.query;

    const query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { companyName: { $regex: search, $options: 'i' } },
        { phoneNumber: { $regex: search, $options: 'i' } }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const sellerRequests = await SellerRequest.find(query)
      .populate('approvedBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(skip);

    const total = await SellerRequest.countDocuments(query);

    const stats = await SellerRequest.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const statusStats = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      statusStats[stat._id] = stat.count;
    });

    res.status(200).json({
      success: true,
      data: sellerRequests,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      },
      stats: statusStats
    });
  } catch (error) {
    console.error('Error fetching seller requests:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller requests',
      error: error.message
    });
  }
};

exports.getSellerRequestById = async (req, res) => {
  try {
    const sellerRequest = await SellerRequest.findById(req.params.id)
      .populate('approvedBy', 'name email');

    if (!sellerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Seller request not found'
      });
    }

    res.status(200).json({
      success: true,
      data: sellerRequest
    });
  } catch (error) {
    console.error('Error fetching seller request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch seller request',
      error: error.message
    });
  }
};

exports.approveSellerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const sellerRequest = await SellerRequest.findById(id);

    if (!sellerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Seller request not found'
      });
    }

    if (sellerRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${sellerRequest.status}`
      });
    }

    sellerRequest.status = 'approved';
    sellerRequest.approvedBy = req.user._id;
    sellerRequest.approvedAt = new Date();
    if (notes) {
      sellerRequest.notes = notes;
    }

    await sellerRequest.save();

    const populatedRequest = await SellerRequest.findById(id)
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Seller request approved successfully',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Error approving seller request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve seller request',
      error: error.message
    });
  }
};

exports.rejectSellerRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { notes } = req.body;

    const sellerRequest = await SellerRequest.findById(id);

    if (!sellerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Seller request not found'
      });
    }

    if (sellerRequest.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Request has already been ${sellerRequest.status}`
      });
    }

    sellerRequest.status = 'rejected';
    sellerRequest.approvedBy = req.user._id;
    sellerRequest.approvedAt = new Date();
    if (notes) {
      sellerRequest.notes = notes;
    }

    await sellerRequest.save();

    const populatedRequest = await SellerRequest.findById(id)
      .populate('approvedBy', 'name email');

    res.status(200).json({
      success: true,
      message: 'Seller request rejected',
      data: populatedRequest
    });
  } catch (error) {
    console.error('Error rejecting seller request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject seller request',
      error: error.message
    });
  }
};

exports.deleteSellerRequest = async (req, res) => {
  try {
    const sellerRequest = await SellerRequest.findByIdAndDelete(req.params.id);

    if (!sellerRequest) {
      return res.status(404).json({
        success: false,
        message: 'Seller request not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Seller request deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting seller request:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete seller request',
      error: error.message
    });
  }
};
