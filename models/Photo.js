const mongoose = require('mongoose');

const photoSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  photo_url: { type: String, required: true },
  uploaded_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Photo', photoSchema);
