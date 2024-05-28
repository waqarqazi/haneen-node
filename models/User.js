const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

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

userSchema.methods.generateAuthToken = function (expiresIn) {
  const maxAge = 365 * 24 * 60 * 60;
  const token = jwt.sign(
    {
      _id: this._id,
      userType: this.userType,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: expiresIn || maxAge,
    },
  );
  return token;
};
module.exports = mongoose.model('User', userSchema);
