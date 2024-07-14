const mongoose = require('mongoose');

const skipSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skippedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

// Add a unique compound index to prevent duplicate skips
skipSchema.index({ userId: 1, skippedUserId: 1 }, { unique: true });

const Skip = mongoose.model('Skip', skipSchema);

module.exports = Skip;
