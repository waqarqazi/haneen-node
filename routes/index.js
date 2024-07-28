/* eslint-disable */
const express = require('express');

const router = express.Router();
const authRoutes = require('./auth/auth.js');
const userRoutes = require('./userRoutes.js');
const matchRoutes = require('./matchRoutes.js');
const likeRoutes = require('./likeRoutes.js');
const superLikeRoutes = require('./superLikeRoutes.js');
const skipRoutes = require('./skipRoutes.js');
const blockRoutes = require('./blockRoutes.js');
const subscriptionRoutes = require('./subscriptionRoutes.js');
const reportRoutes = require('./reportRoutes.js');
const hobbyRoutes = require('./hobbyRoute.js');
const questionRoutes = require('./questionRoute.js');
const chatRoutes = require('./chatRoutes.js');
const actionRoutes = require('./actionRoutes.js');
const mediaRoute = require('./mediaRoute.js');

router.use('/auth', authRoutes);
router.use('/users', userRoutes);
router.use('/match', matchRoutes);
router.use('/likes', likeRoutes);
router.use('/skips', skipRoutes);
router.use('/super/like', superLikeRoutes);
router.use('/rewind', actionRoutes);
router.use('/blocks', blockRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/reports', reportRoutes);
router.use('/chat', chatRoutes);
router.use('/hobbies', hobbyRoutes);
router.use('/question', questionRoutes);
router.use('/media', mediaRoute);
router.use('*', (req, res) =>
  res.status(404).json({ error: '404: Page Not Found!' }),
);

module.exports = router;
