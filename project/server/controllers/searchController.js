const RFQ = require('../models/RFQ');
const User = require('../models/User');

// @desc    Search RFQs using MongoDB
// @route   GET /api/search/rfqs
// @access  Private
const searchRFQsController = async (req, res) => {
  try {
    const {
      keyword,
      partType,
      technologies,
      country,
      region,
      certifications,
      length,
      diameter,
      height,
      width,
      material,
      quantity,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {
      status: { $in: ['OPEN_FOR_REQUESTS', 'REQUESTS_PENDING'] } // Only show open RFQs
    };

    // Text search on title and description
    if (keyword) {
      query.$or = [
        { title: { $regex: keyword, $options: 'i' } },
        { description: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Part type filter
    if (partType) {
      query['workpieces.partType'] = { $regex: partType, $options: 'i' };
    }

    // Technologies filter
    if (technologies) {
      const techArray = Array.isArray(technologies) ? technologies : [technologies];
      query['workpieces.technology'] = { $in: techArray };
    }

    // Country filter
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    // Region filter
    if (region) {
      query.region = { $regex: region, $options: 'i' };
    }

    // Certifications filter
    if (certifications) {
      const certArray = Array.isArray(certifications) ? certifications : [certifications];
      query.requiredCertificates = { $in: certArray };
    }

    // Dimension filters - use $elemMatch to ensure all conditions match on the same workpiece
    if (length || diameter || height || width) {
      const dimensionQuery = {};
      if (length) dimensionQuery['dimensions.length'] = { $lte: parseFloat(length) };
      if (diameter) dimensionQuery['dimensions.diameter'] = { $lte: parseFloat(diameter) };
      if (height) dimensionQuery['dimensions.height'] = { $lte: parseFloat(height) };
      if (width) dimensionQuery['dimensions.width'] = { $lte: parseFloat(width) };
      
      if (Object.keys(dimensionQuery).length > 0) {
        query['workpieces'] = { $elemMatch: dimensionQuery };
      }
    }

    // Material filter
    if (material) {
      query['workpieces.material'] = { $regex: material, $options: 'i' };
    }

    // Quantity filter
    if (quantity) {
      query['workpieces.quantity'] = { $gte: parseInt(quantity) };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const rfqs = await RFQ.find(query)
      .populate('buyerId', 'companyName country region industry')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await RFQ.countDocuments(query);

    res.json({
      success: true,
      data: rfqs,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in search RFQs controller:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching RFQs', 
      error: error.message 
    });
  }
};

// @desc    Search Manufacturers using MongoDB
// @route   GET /api/search/manufacturers
// @access  Private
const searchManufacturersController = async (req, res) => {
  try {
    const {
      keyword,
      partType,
      technologies,
      country,
      region,
      certifications,
      companySize,
      material,
      machinery,
      page = 1,
      limit = 20
    } = req.query;

    // Build query
    const query = {
      userType: { $in: ['MANUFACTURER', 'HYBRID'] },
      manufacturerStatus: 'ACTIVE'
    };

    // Text search on company name and full name
    if (keyword) {
      query.$or = [
        { companyName: { $regex: keyword, $options: 'i' } },
        { fullName: { $regex: keyword, $options: 'i' } }
      ];
    }

    // Part type filter (in manufacturerSettings.partTypes)
    if (partType) {
      query['manufacturerSettings.partTypes'] = { $regex: partType, $options: 'i' };
    }

    // Technologies filter
    if (technologies) {
      const techArray = Array.isArray(technologies) ? technologies : [technologies];
      query['manufacturerSettings.technologies'] = { $in: techArray };
    }

    // Country filter
    if (country) {
      query.country = { $regex: country, $options: 'i' };
    }

    // Region filter
    if (region) {
      query.region = { $regex: region, $options: 'i' };
    }

    // Certifications filter
    if (certifications) {
      const certArray = Array.isArray(certifications) ? certifications : [certifications];
      query.certifications = { $in: certArray };
    }

    // Company size filter
    if (companySize) {
      query.companySize = { $regex: companySize, $options: 'i' };
    }

    // Material filter
    if (material) {
      query['manufacturerSettings.materials'] = { $regex: material, $options: 'i' };
    }

    // Machinery filter
    if (machinery) {
      query['manufacturerSettings.machinery'] = { $regex: machinery, $options: 'i' };
    }

    // Pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Execute query
    const manufacturers = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .lean();

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: manufacturers,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error in search Manufacturers controller:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error searching Manufacturers', 
      error: error.message 
    });
  }
};

module.exports = {
  searchRFQsController,
  searchManufacturersController
};
