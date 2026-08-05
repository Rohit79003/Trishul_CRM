const mongoose = require('mongoose');

const LeadSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  company: {
    type: String,
    default: '',
  },
  phone: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
  },
  source: {
    type: String,
    default: 'Website Form',
  },
  status: {
    type: String,
    enum: ['new', 'contacted', 'interested', 'won', 'lost'],
    default: 'new',
  },
  value: {
    type: Number,
    default: 0,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Lead', LeadSchema);
