/* eslint-disable */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const locationSchema = new mongoose.Schema({
  city: String,
  state: String,
  country: String,
  latitude: Number,
  longitude: Number,
});
const preferencesSchema = new mongoose.Schema({
  preferred_age_range: {
    type: [Number],
    validate: {
      validator: function (v) {
        return v.length === 2;
      },
      message: 'Preferred age range should contain exactly two numbers.',
    },
  },
  preferred_gender: {
    type: String,
    enum: ['male', 'female', 'both'],
  },
  preferred_distance: Number,
  preferred_interests: [String],
});
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: false, unique: false },
  password: { type: String, required: false },
  ph_number: { type: String, required: false, unique: true },
  first_name: String,
  last_name: String,
  date_of_birth: Date,
  gender: String,
  sexual_orientation: String,
  bio: String,
  profile_picture: String,
  fcm: String,
  interests: [String],
  location: locationSchema,
  occupation: String,
  education: String,
  height: Number,
  weight: Number,
  hobbies: [String],
  preferences: preferencesSchema,
  otpVerified: {
    type: Boolean,
    default: false,
  },
  resetPasswordOTP: String,
  resetPasswordExpire: Date,
});
// Virtual property to calculate age
userSchema.virtual('age').get(function () {
  if (!this.date_of_birth) return null;
  const today = new Date();
  const birthDate = new Date(this.date_of_birth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
});
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });
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
