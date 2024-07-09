const mongoose = require('mongoose');
const { v4 } = require('uuid');

const messageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => v4().replace(/\-/g, ''),
    },
    chatRoomId: {
      type: String,
      ref: 'Room',
    },
    postedByUser: { type: mongoose.Types.ObjectId, ref: 'User' },
    message: mongoose.Schema.Types.Mixed,
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Message', messageSchema);
