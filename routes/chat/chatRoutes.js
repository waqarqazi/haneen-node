// chatRoutes.js

const express = require('express');
const router = express.Router();
const { sendMessage } = require('./chatController.js');

// Example route to handle sending a chat message
router.post('/send', (req, res) => {
  const { message } = req.body;
  sendMessage(req.app.get('io'), message);
  res.send('Message sent');
});

module.exports = router;
