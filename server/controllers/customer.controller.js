const Customer = require('../models/Customer');

// @desc    Get all customers with search and status filters
// @route   GET /api/customers
// @access  Private
exports.list = async (req, res, next) => {
  try {
    const { search, status } = req.query;
    const filter = {};

    if (status && status !== 'all') {
      filter.status = status;
    }

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const customers = await Customer.find(filter)
      .populate('createdBy', 'name email')
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
    const customer = await Customer.findById(req.params.id).populate('createdBy', 'name email');
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
// @access  Private
exports.create = async (req, res, next) => {
  try {
    const { name, company, phone, email, address, status, value, notes } = req.body;

    const customer = await Customer.create({
      name,
      company,
      phone,
      email,
      address: address || '',
      status: status || 'new',
      value: value || 0,
      notes: notes || '',
      createdBy: req.user.id,
    });

    res.status(201).json(customer);
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
    });

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
