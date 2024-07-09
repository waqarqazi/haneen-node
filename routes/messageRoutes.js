const express = require('express');
const {
  getChatList,
  sendMessage,
  getMessages,
  addMessage,
} = require('../controllers/messageController.js');
const auth = require('../middleware/authMiddleware.js');
const { getChatOverview } = require('../controllers/chatController.js');

const router = express.Router();

router.route('/chatlist').get(auth, getChatList);
router.post('/send-message', sendMessage);
router.get('/messages/:userId1/:userId2', getMessages);
router.post('/', addMessage);

// new
// app.post('/like', likeController.likeUser);
// app.get('/chatrooms/:userId', chatController.getChatRooms);
router.get('/chatoverview/:userId', getChatOverview);

module.exports = router;
