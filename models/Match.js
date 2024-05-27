const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  user_id_1: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  user_id_2: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  matched_at: { type: Date, default: Date.now },
  is_mutual: { type: Boolean, default: false },
});

module.exports = mongoose.model('Match', matchSchema);
