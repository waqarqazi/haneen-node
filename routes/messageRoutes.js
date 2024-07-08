const express = require('express');
const {
  getChatList,
  sendMessage,
  getMessages,
  addMessage,
} = require('../controllers/chatController.js');

const router = express.Router();

router.get('/chatlist/:userId', getChatList);
router.post('/send-message', sendMessage);
router.get('/messages/:userId1/:userId2', getMessages);
router.post('/', addMessage);

module.exports = router;
