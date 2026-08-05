const Lead = require('../models/Lead');
const User = require('../models/User');

// @desc    Get leads based on User Role (RBAC) & Filters
// @route   GET /api/leads
// @access  Private
exports.list = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    // Role-based record boundary filter
    if (req.user.role === 'user') {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === 'supervisor') {
      const supervisees = await User.find({ supervisorId: req.user.id }).select('_id');
      const superviseeIds = supervisees.map((s) => s._id);
      filter.assignedTo = { $in: [req.user.id, ...superviseeIds] };
    }
    // Admin sees all leads (filter remains unconstrained by assignedTo)

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { source: { $regex: search, $options: 'i' } },
      ];
    }

    const leads = await Lead.find(filter)
      .populate('assignedTo', 'name email role')
      .sort({ createdAt: -1 });

    res.json(leads);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single lead by ID
// @route   GET /api/leads/:id
// @access  Private
exports.getById = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id).populate('assignedTo', 'name email');
    if (!lead) {
      return res.status(404).json({ message: 'Lead record not found.' });
    }
    res.json(lead);
  } catch (error) {
    next(error);
  }
};

const mongoose = require('mongoose');

async function resolveAssigneeId(assignedTo, defaultUserId) {
  if (!assignedTo) return defaultUserId;
  if (mongoose.Types.ObjectId.isValid(assignedTo)) return assignedTo;

  const user = await User.findOne({
    $or: [{ name: assignedTo }, { email: assignedTo }],
  });
  return user ? user._id : defaultUserId;
}

// @desc    Create a new lead opportunity
// @route   POST /api/leads
// @access  Private
exports.create = async (req, res, next) => {
  try {
    const { name, company, phone, email, source, status, value, assignedTo } = req.body;
    const assigneeId = await resolveAssigneeId(assignedTo, req.user.id);

    const lead = await Lead.create({
      name,
      company: company || '',
      phone,
      email,
      source: source || 'Website Form',
      status: status || 'new',
      value: value || 0,
      assignedTo: assigneeId,
      createdBy: req.user.id,
    });

    const populated = await Lead.findById(lead._id).populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update lead opportunity or stage status
// @route   PUT /api/leads/:id
// @access  Private
exports.update = async (req, res, next) => {
  try {
    let lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead record not found.' });
    }

    const updateFields = { ...req.body };
    if (updateFields.assignedTo) {
      updateFields.assignedTo = await resolveAssigneeId(updateFields.assignedTo, lead.assignedTo);
    }

    lead = await Lead.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email');

    res.json(lead);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete lead opportunity
// @route   DELETE /api/leads/:id
// @access  Private (Admin, Supervisor)
exports.remove = async (req, res, next) => {
  try {
    const lead = await Lead.findById(req.params.id);
    if (!lead) {
      return res.status(404).json({ message: 'Lead record not found.' });
    }

    await lead.deleteOne();
    res.json({ message: 'Lead opportunity deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
