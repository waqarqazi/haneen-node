const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  first_name: String,
  last_name: String,
  date_of_birth: Date,
  gender: String,
  sexual_orientation: String,
  bio: String,
  profile_picture: String,
  interests: [String],
  location: {
    city: String,
    state: String,
    country: String,
  },
  occupation: String,
  education: String,
  height: Number,
  weight: Number,
  hobbies: [String],
  preferences: {
    preferred_age_range: [Number],
    preferred_gender: String,
    preferred_distance: Number,
    preferred_interests: [String],
  },
  created_at: { type: Date, default: Date.now },
  updated_at: { type: Date, default: Date.now },
});

module.exports = mongoose.model('User', userSchema);
