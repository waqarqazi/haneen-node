const express = require('express');
const {
  sendMessage,
  addMessage,
  getConversation,
} = require('../controllers/messageController.js');
const auth = require('../middleware/authMiddleware.js');
const { getChatOverview } = require('../controllers/chatController.js');

const router = express.Router();

router.route('/conversation/:roomId').get(auth, getConversation);
router.post('/send-message', sendMessage);
// router.get('/messages/:userId1/:userId2', getMessages);
router.post('/', addMessage);

// new
// app.post('/like', likeController.likeUser);
// app.get('/chatrooms/:userId', chatController.getChatRooms);
router.route('/chat/overview').get(auth, getChatOverview);

module.exports = router;
