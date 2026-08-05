const Customer = require('../models/Customer');
const User = require('../models/User');

// @desc    Get all customers with RBAC boundary filters
// @route   GET /api/customers
// @access  Private
exports.list = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    // Role-based record boundary filter
    if (req.user.role === 'user') {
      filter.$or = [{ assignedTo: req.user.id }, { createdBy: req.user.id }];
    } else if (req.user.role === 'supervisor') {
      const supervisees = await User.find({ supervisorId: req.user.id }).select('_id');
      const superviseeIds = supervisees.map((s) => s._id);
      filter.$or = [
        { assignedTo: { $in: [req.user.id, ...superviseeIds] } },
        { createdBy: { $in: [req.user.id, ...superviseeIds] } },
      ];
    }

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      const searchFilter = {
        $or: [
          { name: { $regex: search, $options: 'i' } },
          { company: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, searchFilter];
        delete filter.$or;
      } else {
        filter.$or = searchFilter.$or;
      }
    }

    const customers = await Customer.find(filter)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.json(customers);
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer by ID
// @route   GET /api/customers/:id
// @access  Private
exports.getById = async (req, res, next) => {
  try {
    const customer = await Customer.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new customer
// @route   POST /api/customers
// @access  Private (Admin, Supervisor)
exports.create = async (req, res, next) => {
  try {
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Agents are not authorized to create customer records.' });
    }

    const { name, company, phone, email, address, status, value, notes, assignedTo } = req.body;

    const customer = await Customer.create({
      name,
      company,
      phone,
      email,
      address: address || '',
      status: status || 'new',
      value: value || 0,
      notes: notes || '',
      assignedTo: assignedTo || req.user.id,
      createdBy: req.user.id,
    });

    const populated = await Customer.findById(customer._id)
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer details
// @route   PUT /api/customers/:id
// @access  Private
exports.update = async (req, res, next) => {
  try {
    let customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    customer = await Customer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('createdBy', 'name email')
      .populate('assignedTo', 'name email');

    res.json(customer);
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a customer record
// @route   DELETE /api/customers/:id
// @access  Private (Admin, Supervisor)
exports.remove = async (req, res, next) => {
  try {
    if (req.user.role === 'user') {
      return res.status(403).json({ message: 'Agents are not authorized to delete customer records.' });
    }

    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ message: 'Customer not found.' });
    }

    await customer.deleteOne();
    res.json({ message: 'Customer record deleted successfully.' });
  } catch (error) {
    next(error);
  }
};
