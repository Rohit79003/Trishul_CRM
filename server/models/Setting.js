const mongoose = require('mongoose');

const SettingSchema = new mongoose.Schema({
  companyName: {
    type: String,
    default: 'Trishul Global Enterprise',
  },
  logoUrl: {
    type: String,
    default: '',
  },
  theme: {
    type: String,
    enum: ['dark', 'light'],
    default: 'dark',
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('Setting', SettingSchema);
