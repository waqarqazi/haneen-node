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
      validate: v => Array.isArray(v) && v.length > 0,
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
    const isAlreadyRoomPrivate = await this.findOne({
      $and: [
        { userIds: { $size: 1 } },
        {
          $or: [
            {
              userIds: {
                $all: [...userIds],
              },
            },
            {
              userIds: {
                $all: [chatInitiator],
              },
            },
          ],
        },
        { chatInitiator: { $in: [chatInitiator, ...userIds] } },
      ],
    });

    console.log(isAlreadyRoomPrivate);

    // const availableRoom = await this.findOne({
    //   userIds: {
    //     $size: userIds.length,
    //     $all: [...userIds],
    //   },
    // });
    // if (availableRoom) {
    //   return {
    //     isNew: false,
    //     message: 'retrieving an old chat room',
    //     chatRoomId: availableRoom._doc._id,
    //     type: availableRoom._doc.type,
    //   };
    // }

    if (isAlreadyRoomPrivate) {
      return {
        isNew: false,
        message: 'retrieving an old private chat room',
        chatRoomId: isAlreadyRoomPrivate._doc._id,
        type: isAlreadyRoomPrivate._doc.type,
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
      chatRoomId: newRoom._doc._id,
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
