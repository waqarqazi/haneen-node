/* eslint-disable */
const express = require('express');

const router = express.Router();
const authRoutes = require('./auth/auth.js');
const actionRoutes = require('./actionRoutes.js');
router.use('/auth', authRoutes);
router.use('/action', actionRoutes);
router.use('*', (req, res) =>
  res.status(404).json({ error: '404: Page Not Found!' }),
);

module.exports = router;
