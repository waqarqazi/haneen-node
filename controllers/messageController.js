/* eslint-disable camelcase */
/* eslint-disable */

const User = require('../models/User');
const Message = require('../models/Message');
const Chat = require('../models/Chat');
const Room = require('../models/Room');
// const addMessage = async (req, res) => {
//   try {
//     const { sender, receiver, message, like_id } = req.body;
//     const newMessage = new Message({
//       sender,
//       receiver,
//       message,
//       like_id,
//       lastMessage: {
//         content: message,
//         createdAt: Date.now(),
//       },
//     });

//     await newMessage.save();
//     res.status(201).json(newMessage);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

const addMessage = async (req, res) => {
  try {
    const { chatId, senderId, message } = req.body;

    const chat = await Chat.findById(chatId);
    if (!chat) return res.status(404).send('Chat not found');

    chat.messages.push({ sender: senderId, message, timestamp: new Date() });
    await chat.save();

    io.to(chatId).emit('new-message', chat);

    res.status(200).send(chat);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// Get chat list for a user
const getConversation = async (req, res) => {
  try {
    const roomId = req.params.roomId;

    const messages = await Message.find({
      $or: [
        { sender: roomId.split('-')[0], receiver: roomId.split('-')[1] },
        { sender: roomId.split('-')[1], receiver: roomId.split('-')[0] },
      ],
    }).sort('timestamp');

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Send a message
const sendMessage = async (req, res) => {
  try {
    const { sender, receiver, message } = req.body;
    const newMessage = new Message({ sender, receiver, message });

    await newMessage.save();
    res.status(200).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// // Get messages between two users
// const getMessages = async (req, res) => {
//   try {
//     const { userId1, userId2 } = req.params;
//     const messages = await Message.find({
//       $or: [
//         { sender: userId1, receiver: userId2 },
//         { sender: userId2, receiver: userId1 },
//       ],
//     }).sort({ createdAt: 1 });

//     res.status(200).json(messages);
//   } catch (error) {
//     res.status(500).json({ message: error.message });
//   }
// };

module.exports = { getConversation, sendMessage, addMessage };
