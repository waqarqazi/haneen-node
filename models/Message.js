const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // like_id: {
    //   type: mongoose.Schema.Types.ObjectId,
    //   ref: 'Like',
    //   required: true,
    // },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    lastMessage: {
      content: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model('Message', messageSchema);
