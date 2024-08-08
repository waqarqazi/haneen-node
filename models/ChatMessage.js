/* eslint-disable */
const mongoose = require('mongoose');
const { v4 } = require('uuid');

const chatMessageSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => v4().replace(/\-/g, ''),
    },
    chatRoomId: {
      type: String,
      ref: 'ChatRoom',
    },
    message: mongoose.Schema.Types.Mixed,
    postedByUser: { type: mongoose.Types.ObjectId, ref: 'User' },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  },
);

chatMessageSchema.statics.createPostInChatRoom = async function (
  chatRoomId,
  message,
  postedByUser,
) {
  const post = await this.create({
    chatRoomId,
    message,
    postedByUser,
  });

  return post;
};

module.exports = mongoose.model('ChatMessage', chatMessageSchema);
