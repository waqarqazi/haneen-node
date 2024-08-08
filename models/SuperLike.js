const mongoose = require('mongoose');
const Match = require('./Match'); // Add this line

const superLikeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  superLikedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  timestamp: { type: Date, default: Date.now },
});

// Add a unique compound index to prevent duplicate likes
superLikeSchema.index({ userId: 1, superLikedUserId: 1 }, { unique: true });

const SuperLike = mongoose.model('SuperLike', superLikeSchema);

module.exports = SuperLike;
