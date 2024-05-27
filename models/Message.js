const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  match_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Match',
    required: true,
  },
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message_content: { type: String, required: true },
  sent_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Message', messageSchema);
