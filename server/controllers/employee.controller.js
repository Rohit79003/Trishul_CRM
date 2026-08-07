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
      supervisorId: supervisorId || null,
      department: department || 'Sales',
      mustChangePassword: true,
    });

    const result = await User.findById(user._id)
      .select('-passwordHash')
      .populate('supervisorId', 'name email role')
      .lean();
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

    const updateFields = {
      name,
      email,
      role,
      supervisorId: supervisorId || null,
      department,
    };

    if (password) {
      const salt = await bcrypt.genSalt(10);
      updateFields.passwordHash = await bcrypt.hash(password, salt);
    }

    user = await User.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    })
      .select('-passwordHash')
      .populate('supervisorId', 'name email role');

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

// @desc    Get team members & aggregated workload stats (Supervisor & Admin)
// @route   GET /api/users/my-team
// @access  Private (Supervisor / Admin)
exports.getMyTeam = async (req, res, next) => {
  try {
    const Lead = require('../models/Lead');
    const Task = require('../models/Task');
    const { WORKLOAD_THRESHOLDS } = require('../constants/workload');

    let teamMembers = [];

    if (req.user.role === 'admin') {
      teamMembers = await User.find({ _id: { $ne: req.user.id } })
        .select('-passwordHash')
        .populate('supervisorId', 'name email role')
        .sort({ name: 1 })
        .lean();
    } else {
      teamMembers = await User.find({ supervisorId: req.user.id })
        .select('-passwordHash')
        .populate('supervisorId', 'name email role')
        .sort({ name: 1 })
        .lean();
    }

    if (!teamMembers || teamMembers.length === 0) {
      return res.json({
        teamMembers: [],
        metrics: {
          totalMembers: 0,
          totalLeads: 0,
          activeLeads: 0,
          convertedLeads: 0,
          conversionRate: 0,
          totalOpenTasks: 0,
        },
      });
    }

    const memberIds = teamMembers.map((m) => m._id);

    // 1. Single Lead Aggregation Pipeline across entire team
    const leadStats = await Lead.aggregate([
      { $match: { assignedTo: { $in: memberIds } } },
      {
        $group: {
          _id: '$assignedTo',
          totalLeads: { $sum: 1 },
          activeLeads: {
            $sum: { $cond: [{ $in: ['$status', ['new', 'contacted', 'qualified', 'proposal']] }, 1, 0] },
          },
          convertedLeads: {
            $sum: { $cond: [{ $eq: ['$status', 'won'] }, 1, 0] },
          },
        },
      },
    ]);

    // 2. Single Task Aggregation Pipeline across entire team
    const taskStats = await Task.aggregate([
      { $match: { assignedTo: { $in: memberIds }, completed: false } },
      { $group: { _id: '$assignedTo', openTasks: { $sum: 1 } } },
    ]);

    // Convert aggregated stats into fast lookup maps
    const leadStatsMap = {};
    let aggTotalLeads = 0;
    let aggActiveLeads = 0;
    let aggConvertedLeads = 0;

    leadStats.forEach((stat) => {
      const idStr = stat._id.toString();
      leadStatsMap[idStr] = stat;
      aggTotalLeads += stat.totalLeads;
      aggActiveLeads += stat.activeLeads;
      aggConvertedLeads += stat.convertedLeads;
    });

    const taskStatsMap = {};
    let aggOpenTasks = 0;
    taskStats.forEach((stat) => {
      const idStr = stat._id.toString();
      taskStatsMap[idStr] = stat.openTasks;
      aggOpenTasks += stat.openTasks;
    });

    // Merge stats & workload status into team member objects
    const enrichedTeamMembers = teamMembers.map((member) => {
      const mIdStr = member._id.toString();
      const lStat = leadStatsMap[mIdStr] || { totalLeads: 0, activeLeads: 0, convertedLeads: 0 };
      const openTasks = taskStatsMap[mIdStr] || 0;
      const totalActiveItems = lStat.activeLeads + openTasks;

      let workloadStatus = 'Available';
      if (totalActiveItems > WORKLOAD_THRESHOLDS.BUSY_MAX) {
        workloadStatus = 'Overloaded';
      } else if (totalActiveItems >= WORKLOAD_THRESHOLDS.AVAILABLE_MAX) {
        workloadStatus = 'Busy';
      }

      return {
        ...member,
        id: member._id,
        activeLeads: lStat.activeLeads,
        totalLeads: lStat.totalLeads,
        convertedLeads: lStat.convertedLeads,
        openTasks,
        totalActiveItems,
        workloadStatus,
      };
    });

    const conversionRate =
      aggTotalLeads > 0 ? parseFloat(((aggConvertedLeads / aggTotalLeads) * 100).toFixed(1)) : 0;

    res.json({
      teamMembers: enrichedTeamMembers,
      metrics: {
        totalMembers: teamMembers.length,
        totalLeads: aggTotalLeads,
        activeLeads: aggActiveLeads,
        convertedLeads: aggConvertedLeads,
        conversionRate,
        totalOpenTasks: aggOpenTasks,
      },
    });
  } catch (error) {
    next(error);
  }
};
