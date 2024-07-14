const mongoose = require('mongoose');
const Match = require('./Match'); // Add this line

const likeSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  likedUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },

  timestamp: { type: Date, default: Date.now },
});

// Add a unique compound index to prevent duplicate likes
likeSchema.index({ userId: 1, likedUserId: 1 }, { unique: true });

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
