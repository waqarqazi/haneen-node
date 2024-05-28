const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const User = require('../models/User');

const ErrorResponse = require('../utils/errorResponse.js');
// Register User
const register = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    const prevUser = await User.findOne({ username });
    if (prevUser) {
      return res.status(401).json({ error: 'User Already Exist' });
    }
    const prevUserEmail = await User.findOne({ email });
    if (prevUserEmail) {
      return res.status(401).json({ error: 'Email Already Exist' });
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const newUser = new User({
      ...req.body,
      username: username.toLowerCase(),
      email: email.toLowerCase(),
      password: passwordHash,
    });

    const user = await newUser.save();
    let sanitizedUser = _.omit(user.toObject(), 'password');

    return res.json({ user: sanitizedUser });
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
};

// Login User
const login = async (req, res) => {
  try {
    const user = await User.findOne({
      $or: [
        { username: req.body.usernameOrEmail },
        { email: req.body.usernameOrEmail },
      ],
    }).select('+password');

    if (!user)
      return res.status(400).json({ error: 'Invalid userName or Password' });

    const validatePassword = await bcrypt.compare(
      req.body.password,
      user.password,
    );

    if (!validatePassword)
      return res.status(400).json({ error: 'Invalid userName or Password' });

    // User disabled
    // if (!user.status)
    //   return res.status(401).json({ error: 'Your account is Inactive' });

    const token = user.generateAuthToken();

    let sanitizedUser = _.omit(user.toObject(), 'password');
    console.log('sanitizedUser', sanitizedUser);
    return res.status(200).json({
      message: 'Auth Successful',
      token,
      user: sanitizedUser,
    });
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({ status: false, error });
  }
};

module.exports = {
  register,
  login,
};
