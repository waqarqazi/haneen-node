const mongoose = require('mongoose');

const RoomSchema = new mongoose.Schema({
  user1: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  user2: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  roomId: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
  lastMessage: {
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    message: { type: String },
    timestamp: { type: Date },
  },
});

module.exports = mongoose.model('Room', RoomSchema);
