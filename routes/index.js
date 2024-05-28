const express = require('express');

const router = express.Router();
const authRoutes = require('./auth/auth.js');
const userRoutes = require('./userRoutes.js');
const matchRoutes = require('./matchRoutes.js');
const messageRoutes = require('./messageRoutes.js');
const likeRoutes = require('./likeRoutes.js');
const blockRoutes = require('./blockRoutes.js');
const subscriptionRoutes = require('./subscriptionRoutes.js');
const reportRoutes = require('./reportRoutes.js');
const chatRoutes = require('./chat/chatRoutes.js');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/matches', matchRoutes);
router.use('/messages', messageRoutes);
router.use('/likes', likeRoutes);
router.use('/blocks', blockRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/reports', reportRoutes);
router.use('/chat', chatRoutes);
router.use('*', (req, res) =>
  res.status(404).json({ error: '404: Page Not Found!' }),
);

module.exports = router;
