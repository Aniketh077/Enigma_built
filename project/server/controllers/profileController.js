const User = require('../models/User');

// @desc    Get user profile
// @route   GET /api/profile
// @access  Private
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password -emailVerificationToken -passwordResetToken');

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/profile
// @access  Private
const updateProfile = async (req, res) => {
  try {
    const {
      companyName,
      website,
      industryVertical,
      buyerSettings,
      manufacturerSettings,
      primaryMaterials,
      certifications,
      maxDimensions,
      regionsServed,
      languages
    } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update company info
    if (companyName) user.companyName = companyName;
    if (website) user.website = website;
    if (industryVertical) user.industryVertical = industryVertical;

    // Update buyer settings
    if (buyerSettings) {
      user.buyerSettings = { ...user.buyerSettings, ...buyerSettings };
    }

    // Update manufacturer settings
    if (manufacturerSettings) {
      user.manufacturerSettings = { ...user.manufacturerSettings, ...manufacturerSettings };
    }

    // Update manufacturer profile fields
    if (primaryMaterials) user.primaryMaterials = primaryMaterials;
    if (certifications) user.certifications = certifications;
    if (maxDimensions) user.maxDimensions = maxDimensions;

    // Calculate profile completeness
    let completeness = 0;
    const fields = [
      user.companyName,
      user.address,
      user.city,
      user.state,
      user.zipCode,
      user.country
    ];
    completeness += fields.filter(f => f).length * 5;

    if (user.userType === 'BUYER' || user.userType === 'HYBRID') {
      if (user.buyerSettings?.preferredCurrency) completeness += 5;
      if (user.buyerSettings?.defaultCountry) completeness += 5;
    }

    if (user.userType === 'MANUFACTURER' || user.userType === 'HYBRID') {
      if (user.manufacturingTypes?.length > 0) completeness += 10;
      if (user.primaryMaterials?.length > 0) completeness += 10;
      if (user.certifications?.length > 0) completeness += 10;
      if (user.maxDimensions?.length > 0 || user.maxDimensions?.width > 0) completeness += 10;
    }

    user.profileCompleteness = Math.min(completeness, 100);

    await user.save();

    res.json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ message: 'Server error: ' + error.message });
  }
};

module.exports = {
  getProfile,
  updateProfile
};

