const mongoose = require('mongoose');

const ActionType = Object.freeze({
  LIKE: 'like',
  SKIP: 'skip',
  SUPERLIKE: 'superlike',
});
const actionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  actionType: {
    type: String,
    enum: [ActionType.LIKE, ActionType.SKIP, ActionType.SUPERLIKE],
  },
  targetUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  timestamp: { type: Date, default: Date.now },
});

const ActionHistory = mongoose.model('ActionHistory', actionSchema);
module.exports = { ActionHistory, ActionType };
