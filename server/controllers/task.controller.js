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

  if (mongoose.Types.ObjectId.isValid(assignedTo)) {
    const userById = await User.findById(assignedTo);
    if (userById) return userById._id;
  }

  const user = await User.findOne({
    $or: [{ name: assignedTo }, { email: assignedTo }],
  });

  if (!user) {
    const err = new Error('User not exist');
    err.statusCode = 400;
    throw err;
  }

  return user._id;
}

// @desc    Create a new task
// @route   POST /api/tasks
// @access  Private (Admin, Supervisor)
exports.create = async (req, res, next) => {
  try {
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Agents are not authorized to create or assign tasks.' });
    }

    const { title, assignedTo, dueDate, priority, category, status } = req.body;
    const assigneeId = await resolveAssigneeId(assignedTo, req.user.id);
    const initialStatus = status || 'pending';
    const isCompleted = initialStatus === 'completed';

    const task = await Task.create({
      title,
      assignedTo: assigneeId,
      dueDate: dueDate || new Date(),
      priority: priority || 'medium',
      category: category || 'Sales',
      status: initialStatus,
      completed: isCompleted,
      createdBy: req.user.id,
    });

    const populated = await Task.findById(task._id).populate('assignedTo', 'name email role');
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

    let updateFields = { ...req.body };

    if (req.user.role === 'user') {
      // Agents can only update status (pending, in-progress, completed) or completion toggle on their assigned tasks
      if (task.assignedTo.toString() !== req.user.id) {
        return res.status(403).json({ message: 'Forbidden. You can only update status for your assigned tasks.' });
      }

      const allowed = {};
      if (req.body.status !== undefined) {
        allowed.status = req.body.status;
        allowed.completed = req.body.status === 'completed';
      } else if (req.body.completed !== undefined) {
        allowed.completed = Boolean(req.body.completed);
        allowed.status = req.body.completed ? 'completed' : 'pending';
      }
      updateFields = allowed;
    } else {
      // Admin and Supervisor have full access to edit all fields
      if (updateFields.assignedTo) {
        updateFields.assignedTo = await resolveAssigneeId(updateFields.assignedTo, task.assignedTo);
      }
      if (updateFields.status !== undefined) {
        updateFields.completed = updateFields.status === 'completed';
      } else if (updateFields.completed !== undefined) {
        updateFields.status = updateFields.completed ? 'completed' : (task.status === 'completed' ? 'pending' : (task.status || 'pending'));
      }
    }

    task = await Task.findByIdAndUpdate(req.params.id, updateFields, {
      new: true,
      runValidators: true,
    }).populate('assignedTo', 'name email role');

    res.json(task);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a task
// @route   DELETE /api/tasks/:id
// @access  Private (Admin, Supervisor)
exports.remove = async (req, res, next) => {
  try {
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Agents are not authorized to delete tasks.' });
    }

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
