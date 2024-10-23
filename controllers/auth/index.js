const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const User = require('../../models/User.js');
const ErrorResponse = require('../../utils/errorResponse.js');
const InvalidToken = require('../../models/InvalidToken.js');
// Register User
const register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const prevUserEmail = await User.findOne({ email });
    if (prevUserEmail) {
      return res.status(401).json({ error: 'Email Already Exist' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      ...req.body,
      email: email.toLowerCase(),
      password: passwordHash,
    });

    const user = await newUser.save();
    let sanitizedUser = _.omit(user.toObject(), 'password');
    const token = await User.findById(sanitizedUser._id).exec(); // Retrieve full user data to generate token
    if (!token) {
      return res.status(500).json({ message: 'Failed to generate token' });
    }
    const authToken = token.generateAuthToken();

    return res.json({ success: true, data: sanitizedUser, token: authToken });
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
};

// Login User
const login = async (req, res) => {
  try {
    const user = await User.findOne({
      email: req.body.email,
    }).select('+password');

    if (!user)
      return res
        .status(400)
        .json({ error: 'Invalid Phone Number or Password' });

    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );

    if (!validatePassword)
      return res
        .status(400)
        .json({ error: 'Invalid Phone Number or Password' });

    const token = user.generateAuthToken();

    let sanitizedUser = _.omit(user.toObject(), 'password');
    return res.status(200).json({
      success: true,
      token,
      data: sanitizedUser,
    });
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({ status: false, error });
  }
};

// Logout User
const logout = async (req, res) => {
  try {
    const token = req.header('x-auth-token');
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    // Add the token to the invalidated tokens list
    const invalidToken = new InvalidToken({ token });
    await invalidToken.save();

    return res
      .status(200)
      .json({ success: true, message: 'Logout successful' });
  } catch (error) {
    console.log('error', error);
    return res
      .status(500)
      .json({ status: false, message: 'Internal server error', error });
  }
};

module.exports = {
  register,
  login,
  logout,
};
