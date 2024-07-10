/* eslint-disable */
const express = require('express');

const router = express.Router();
const authRoutes = require('./auth/auth.js');
const userRoutes = require('./userRoutes.js');
const matchRoutes = require('./matchRoutes.js');
const likeRoutes = require('./likeRoutes.js');
const blockRoutes = require('./blockRoutes.js');
const subscriptionRoutes = require('./subscriptionRoutes.js');
const reportRoutes = require('./reportRoutes.js');
const hobbyRoutes = require('./hobbyRoute.js');
const questionRoutes = require('./questionRoute.js');
const chatRoutes = require('./chat/index.js');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/matches', matchRoutes);
router.use('/likes', likeRoutes);
router.use('/blocks', blockRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/reports', reportRoutes);
router.use('/chat', chatRoutes);
router.use('/hobbies', hobbyRoutes);
router.use('/question', questionRoutes);
router.use('*', (req, res) =>
  res.status(404).json({ error: '404: Page Not Found!' }),
);

module.exports = router;
