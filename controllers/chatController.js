/* eslint-disable camelcase */
const User = require('../models/User');
const Message = require('../models/Message');

const addMessage = async (req, res) => {
  try {
    const { sender, receiver, message, match_id } = req.body;
    const newMessage = new Message({
      sender,
      receiver,
      message,
      match_id,
      lastMessage: {
        content: message,
        createdAt: Date.now(),
      },
    });

    await newMessage.save();
    res.status(201).json(newMessage);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get chat list for a user
const getChatList = async (req, res) => {
  try {
    const userId = req.params.userId;
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }],
    })
      .populate('sender', 'first_name last_name profile_picture username')
      .sort({ updatedAt: -1 });

    // Flatten the sender fields and remove the sender object
    const transformedMessages = messages.map(message => {
      const { sender, ...rest } = message.toObject(); // Destructure to remove sender
      return {
        ...rest,
        firstName: sender.first_name,
        lastName: sender.last_name,
        profileImage: sender.profile_picture,
        sender_username: sender.username,
      };
    });

    res.status(200).json(transformedMessages);
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

// Get messages between two users
const getMessages = async (req, res) => {
  try {
    const { userId1, userId2 } = req.params;
    const messages = await Message.find({
      $or: [
        { sender: userId1, receiver: userId2 },
        { sender: userId2, receiver: userId1 },
      ],
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getChatList, sendMessage, getMessages, addMessage };
