/* eslint-disable */
const mongoose = require('mongoose');
const { v4 } = require('uuid');

const chatRoomSchema = new mongoose.Schema(
  {
    _id: {
      type: String,
      default: () => v4().replace(/\-/g, ''),
    },
    userIds: {
      type: [String],
      validate: v => Array.isArray(v) && v.length === 2, // Ensure there are exactly two users
    },
    chatInitiator: {
      type: mongoose.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    name: String,
    picture: String,
    description: String,
  },
  {
    timestamps: true,
  },
);

chatRoomSchema.statics.initiateChat = async function (
  userIds,
  chatInitiator,
  name,
  picture,
  description,
) {
  try {
    if (userIds.length !== 2) {
      throw new Error('A private chat room must have exactly two users');
    }

    const isAlreadyRoomPrivate = await this.findOne({
      $and: [
        { userIds: { $size: 2 } },
        {
          userIds: {
            $all: [...userIds],
          },
        },
        { chatInitiator: { $in: [chatInitiator, ...userIds] } },
      ],
    });

    if (isAlreadyRoomPrivate) {
      return {
        isNew: false,
        message: 'retrieving an old private chat room',
        chatRoomId: isAlreadyRoomPrivate._id,
        type: isAlreadyRoomPrivate.type,
      };
    }

    const newRoom = await this.create({
      userIds,
      chatInitiator,
      name,
      picture,
      description,
    });
    return {
      message: 'creating a new chatroom',
      chatRoomId: newRoom._id,
    };
  } catch (error) {
    console.log('error on start chat method', error);
    throw error;
  }
};

chatRoomSchema.statics.getChatRoomByRoomId = async function (roomId) {
  const room = await this.findOne({ _id: roomId });
  return room;
};

module.exports = mongoose.model('ChatRoom', chatRoomSchema);
