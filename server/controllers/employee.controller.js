const User = require('../models/User');
const bcrypt = require('bcryptjs');

// @desc    Get all registered employees (Admin Only)
// @route   GET /api/users
// @access  Private (Admin)
exports.list = async (req, res, next) => {
  try {
    const users = await User.find()
      .select('-passwordHash')
      .populate('supervisorId', 'name email role')
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single user by ID
// @route   GET /api/users/:id
// @access  Private (Admin)
exports.getById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash')
      .populate('supervisorId', 'name email');

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new employee user account
// @route   POST /api/users
// @access  Private (Admin)
exports.create = async (req, res, next) => {
  try {
    const { name, email, password, role, supervisorId, department } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'User with this email already exists.' });
    }

    // Generate random secure temporary password if custom password not specified
    const tempPassword = password && password.trim().length >= 6
      ? password.trim()
      : 'Trishul#' + Math.random().toString(36).substring(2, 7) + '!';

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(tempPassword, salt);

    const user = await User.create({
      name,
      email,
      passwordHash,
      role: role || 'user',
      supervisorId: req.user.id,
      department: department || 'Sales',
      mustChangePassword: true,
    });

    const result = await User.findById(user._id).select('-passwordHash').lean();
    res.status(201).json({ ...result, id: result._id, initialPassword: tempPassword });
  } catch (error) {
    next(error);
  }
};

// @desc    Update employee user profile or supervisor assignment
// @route   PUT /api/users/:id
// @access  Private (Admin)
exports.update = async (req, res, next) => {
  try {
    const { name, email, password, role, supervisorId, department } = req.body;

    let user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const updateFields = { name, email, role, supervisorId, department };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.passwordHash = await bcrypt.hash(password, salt);
    }

    user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).select('-passwordHash');

    res.json(user);
  } catch (error) {
    next(error);
  }
};

// @desc    Remove an employee account
// @route   DELETE /api/users/:id
// @access  Private (Admin)
exports.remove = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    // Prevent deleting self
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: 'Cannot delete your own active Admin account.' });
    }

    await user.deleteOne();
    res.json({ message: 'Employee user account deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
