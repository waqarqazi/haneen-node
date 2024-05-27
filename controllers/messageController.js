const Message = require('../models/Message');
const ErrorResponse = require('../utils/errorResponse.js');
// Get all messages
const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find();
    res.json(messages);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Get message by ID
const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id);
    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }
    res.json(message);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Create a new message
const createMessage = async (req, res) => {
  const { match_id, sender_id, message_content } = req.body;

  try {
    let message = new Message({
      match_id,
      sender_id,
      message_content,
    });

    await message.save();
    res.json(message);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Update a message
const updateMessage = async (req, res) => {
  const { message_content } = req.body;

  try {
    let message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    message.message_content = message_content || message.message_content;

    await message.save();
    res.json(message);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Delete a message
const deleteMessage = async (req, res) => {
  try {
    let message = await Message.findById(req.params.id);

    if (!message) {
      return res.status(404).json({ msg: 'Message not found' });
    }

    await message.remove();
    res.json({ msg: 'Message removed' });
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

module.exports = {
  getAllMessages,
  getMessageById,
  createMessage,
  updateMessage,
  deleteMessage,
};
