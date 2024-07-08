const mongoose = require('mongoose');

const invalidTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' }, // Token will expire after 1 hour
});

module.exports = mongoose.model('InvalidToken', invalidTokenSchema);
