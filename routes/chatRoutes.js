const express = require('express');

const router = express.Router();
const auth = require('../middleware/authMiddleware.js');
const {
  createChatRoom,
  getAllChatRooms,
  getChatGroups,
  getAllChatList,
  getConversationByRoomId,
  markRead,
  createGroup,
  editGroup,
  leaveGroup,
  createMessage,
  getAllMessages,
} = require('../controllers/chatController.js');

router.route('/create-msg').post(auth, createMessage);
router.route('/create-room').post(auth, createChatRoom);
router.route('/get-all-room').get(auth, getAllChatRooms);
router.route('/get-msgs/:roomId').get(auth, getAllMessages);
router.route('/get-groups').get(auth, getChatGroups);
router.route('/allChatList').get(auth, getAllChatList);
router.route('/:roomId').get(auth, getConversationByRoomId); // for commit

router.route('/markRead/:roomId').get(auth, markRead);
router.post('/create-group').get(auth, createGroup);
router.put('/edit-group').get(auth, editGroup);
router.post('/leave-group').get(auth, leaveGroup);

module.exports = router;
