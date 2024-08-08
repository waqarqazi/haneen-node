const mongoose = require('mongoose');

// Define schema for media (images and videos)
const mediaSchema = new mongoose.Schema({
  type: { type: String, enum: ['image', 'video'], required: true },
  url: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
  // Add other fields as needed, such as user reference, captions, etc.
});

// Create model from schema
const Media = mongoose.model('Media', mediaSchema);

module.exports = Media;
