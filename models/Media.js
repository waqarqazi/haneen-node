const mongoose = require('mongoose');

// Define schema for a single media item (image or video)
const mediaItemSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

// Define schema for a collection of media items associated with a user
const mediaSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  mediaItems: [mediaItemSchema], // Array of media items
});

// Create model from schema
const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
