const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController.js');

// Get all messages
router.get('/', messageController.getAllMessages);

// Get message by ID
router.get('/:id', messageController.getMessageById);

// Create a new message
router.post('/', messageController.createMessage);

// Update a message
router.put('/:id', messageController.updateMessage);

// Delete a message
router.delete('/:id', messageController.deleteMessage);

module.exports = router;
