const Setting = require('../models/Setting');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get company settings
// @route   GET /api/settings
// @access  Private
exports.getSettings = async (req, res, next) => {
  try {
    let settings = await Setting.findOne();
    if (!settings) {
      settings = await Setting.create({
        companyName: 'Trishul Global Enterprise',
        theme: 'dark',
        updatedBy: req.user.id,
      });
    }
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Update company settings
// @route   PUT /api/settings
// @access  Private
exports.updateSettings = async (req, res, next) => {
  try {
    const { companyName, logoUrl, theme } = req.body;

    let settings = await Setting.findOne();
    if (!settings) {
      settings = new Setting({ updatedBy: req.user.id });
    }

    if (companyName !== undefined) settings.companyName = companyName;
    if (logoUrl !== undefined) settings.logoUrl = logoUrl;
    if (theme !== undefined) settings.theme = theme;
    settings.updatedBy = req.user.id;
    settings.updatedAt = new Date();

    await settings.save();
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

// @desc    Change user password
// @route   PUT /api/settings/password
// @access  Private
exports.changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ message: 'Both old and new passwords are required.' });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const isMatch = await bcrypt.compare(oldPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect.' });
    }

    const salt = await bcrypt.genSalt(10);
    user.passwordHash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({ message: 'Password updated successfully.' });
  } catch (error) {
    next(error);
  }
};
