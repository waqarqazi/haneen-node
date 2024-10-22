/* eslint-disable */
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  email: { type: String, unique: true, sparse: true },
  password: { type: String, required: false },
  firstName: String,
  lastName: String,
  wins: { type: Number, default: 0 },
  loses: { type: Number, default: 0 },
  draws: { type: Number, default: 0 },
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
