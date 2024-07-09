const Room = require('../models/Room');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const User = require('../models/User');

const createChat = async (req, res) => {
  try {
    const { userIds } = req.body;
    const chat = new Chat({ users: userIds, messages: [] });
    await chat.save();
    res.status(201).send(chat);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};
const getChatOverview = async (req, res) => {
  const userId = req.body.user._id;
  try {
    // Find all rooms involving the user
    const rooms = await Room.find({
      $or: [{ user1: userId }, { user2: userId }],
    })
      .populate('user1', 'first_name last_name _id username profile_picture')
      .populate('user2', 'first_name last_name _id username profile_picture')
      .populate('lastMessage');

    const chatOverview = rooms.map(room => {
      const otherUser =
        room.user1._id.toString() === userId ? room.user2 : room.user1;
      return {
        roomId: room.roomId,
        userId: otherUser._id,
        firstName: otherUser.first_name,
        lastName: otherUser.last_name,
        username: otherUser.username,
        profile_picture: otherUser.profile_picture,
        lastMessage: room.lastMessage,
      };
    });

    res.json(chatOverview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};

const getMainChatRooms = async (req, res) => {
  const { userId } = req.params;

  try {
    // Find all rooms involving the user
    const rooms = await Room.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate('user1 user2', 'username'); // Assuming username is a field in the User model

    // Fetch the latest message for each room
    const chatOverview = await Promise.all(
      rooms.map(async room => {
        const latestMessage = await Message.findOne({ roomId: room.roomId })
          .sort('-timestamp')
          .exec();

        return {
          roomId: room.roomId,
          user1: room.user1,
          user2: room.user2,
          latestMessage,
        };
      }),
    );

    res.json(chatOverview);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Internal server error' });
  }
};
module.exports = { createChat, getChatOverview };
