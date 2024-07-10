const express = require('express');

const router = express.Router();
const auth = require('../../middleware/authMiddleware.js');
const chatController = require('../../controllers/chat');

router.route('/create-room').get(auth, chatController.createChatRoom);
router.route('/get-groups').get(auth, chatController.getChatGroups);
router.route('/allChatList').get(auth, chatController.getAllChatList);
router.route('/:roomId').get(auth, chatController.getConversationByRoomId); // for commit

router.route('/markRead/:roomId').get(auth, chatController.markRead);
router.post('/create-group').get(auth, chatController.createGroup);
router.put('/edit-group').get(auth, chatController.editGroup);
router.post('/leave-group').get(auth, chatController.leaveGroup);

module.exports = router;
