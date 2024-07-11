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

const Like = mongoose.model('Like', likeSchema);

module.exports = Like;
