const Task = require('../models/Task');
const User = require('../models/User');

// @desc    Get task list with RBAC boundary filters
// @route   GET /api/tasks
// @access  Private
exports.list = async (req, res, next) => {
  try {
    const { priority, completed } = req.query;
    const filter = {};

    if (req.user.role === 'user') {
      filter.assignedTo = req.user.id;
    } else if (req.user.role === 'supervisor') {
      const supervisees = await User.find({ supervisorId: req.user.id }).select('_id');
      const superviseeIds = supervisees.map((s) => s._id);
      filter.assignedTo = { $in: [req.user.id, ...superviseeIds] };
    }

    if (priority && priority !== 'all') {
      filter.priority = priority;
    }

    if (completed !== undefined) {
      filter.completed = completed === 'true';
    }

    const tasks = await Task.find(filter)
      .populate('assignedTo', 'name email role')
      .sort({ dueDate: 1 });

    res.json(tasks);
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

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private
exports.create = async (req, res, next) => {
  try {
    const { title, assignedTo, dueDate, priority, category } = req.body;
    const assigneeId = await resolveAssigneeId(assignedTo, req.user.id);

    const task = await Task.create({
      title,
      assignedTo: assigneeId,
      dueDate: dueDate || new Date(),
      priority: priority || 'medium',
      category: category || 'Sales',
      completed: false,
      createdBy: req.user.id,
    });

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email');
    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update task details or completion status
// @route   PUT /api/tasks/:id
// @access  Private
exports.update = async (req, res, next) => {
  try {
    let task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    const updateFields = { ...req.body };
    if (updateFields.assignedTo) {
      updateFields.assignedTo = await resolveAssigneeId(updateFields.assignedTo, task.assignedTo);
    }

    task = await Task.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email');

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private
exports.remove = async (req, res, next) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found.' });
    }

    await task.deleteOne();
    res.json({ message: 'Task deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
