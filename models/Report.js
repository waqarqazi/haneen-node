const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  reporter_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reported_user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  reason: { type: String, required: true },
  reported_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Report', reportSchema);
