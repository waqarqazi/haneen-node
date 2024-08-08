const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const twilio = require('twilio');
const User = require('../../models/User.js');

const ErrorResponse = require('../../utils/errorResponse.js');
const { generateUniqueUsername } = require('../../utils/helpers.js');
const { sendOTP, verifyOTP, generateOtp } = require('./helper.js');
const InvalidToken = require('../../models/InvalidToken.js');
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

    return res.json({ success: true, data: sanitizedUser });
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
};
const signUpStepZero = async (req, res) => {
  try {
    if (req?.body?.ph_number) {
      const prevUser = await User.findOne({ ph_number: req.body.ph_number });
      if (prevUser) {
        return res.status(401).json({ error: 'Phone Already Exist' });
      }
      const username = await generateUniqueUsername('@');
      const newUser = new User({
        ph_number: req.body.ph_number.toLowerCase(),
        username,
      });

      const user = await newUser.save();
      let sanitizedUser = _.omit(user.toObject(), 'password');
      console.log('sanitizedUser', sanitizedUser);
      const otpDetails = await sendOTP(sanitizedUser?.ph_number);
      const token = user.generateAuthToken();
      return res.json({ user: sanitizedUser, token, otpDetails });
    }
    const prevUserEmail = await User.findOne({ email: req.body.email });
    if (prevUserEmail) {
      return res.status(401).json({ error: 'Email Already Exist' });
    }
    // const passwordHash = await bcrypt.hash(password, 10);
    const username = await generateUniqueUsername('@');
    const newUser = new User({
      email: req.body.email,
      username,
    });

    const user = await newUser.save();
    let sanitizedUser = _.omit(user.toObject(), 'password');

    return res.json({ user: sanitizedUser });
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
};
const sendOtpApi = async (req, res) => {
  let phoneNumber = req.body.ph_number;
  try {
    // const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otp = 123456;
    // await sendOtp(phoneNumber, otp); //Use twillo service

    // Save user with OTP (will update later after verification)
    let user = await User.findOne({ ph_number: phoneNumber });
    if (!user) {
      user = new User({ ph_number: phoneNumber, otp });
      await user.save();
    } else {
      user.otp = otp;
      await user.save();
    }
    return res.status(200).json({
      success: true,
      otp,
      _id: user._id,
      message: 'OTP sent successfully',
    });
  } catch (error) {
    console.log('error', error);
    return res.status(500).json({ error: 'Failed to send OTP' });
  }
};
const verifyOtpApi = async (req, res) => {
  const { ph_number, userId, otp } = req.body;
  try {
    const user = await User.findOne({ ph_number, _id: userId });
    if (!user || user.otp !== otp) {
      return res.status(400).json({ error: 'Invalid OTP' });
    }
    if (user.otp == otp) {
      user.isVerified = true;
      await user.save();
      res
        .status(200)
        .json({ success: true, message: 'OTP verified successfully' });
    }
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
};
const createSignupProfile = async (req, res) => {
  const { userId, password, ...updateFields } = req.body; // Extract userId, password, and other fields

  try {
    // Check if the user exists
    const prevUser = await User.findById(userId);
    if (!prevUser) {
      return res.status(401).json({ error: 'User Not Exist' });
    }

    if (password) {
      const passwordHash = await bcrypt.hash(password, 10);
      updateFields.password = passwordHash;
    }

    const user = await User.findByIdAndUpdate(userId, updateFields, {
      new: true,
      runValidators: true,
    })
      .lean()
      .exec();

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }

    if (user.password) {
      delete user.password;
    }
    const token = await User.findById(userId).exec(); // Retrieve full user data to generate token
    if (!token) {
      return res.status(500).json({ message: 'Failed to generate token' });
    }
    const authToken = token.generateAuthToken();
    return res.status(200).json({ user, token: authToken, success: true });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).send({ message: 'Internal server error', error });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const user = await User.findOne({ ph_number: req.body.ph_number });
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: 'User not found' });
    }
    const otp = await generateOtp();
    const resetPasswordExpire = Date.now() + 3600000;
    // Save the OTP and expiration to the user's record
    user.resetPasswordOTP = otp;
    user.resetPasswordExpire = resetPasswordExpire;
    await user.save();
    res.status(200).json({
      success: true,
      message: `Password reset OTP sent to mobile ${otp}`,
    });
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
};

// Login User
const login = async (req, res) => {
  try {
    const user = await User.findOne({
      ph_number: req.body.ph_number,
    }).select('+password');

    if (!user)
      return res
        .status(400)
        .json({ error: 'Invalid Phone Number or Password' });

    const validatePassword = bcrypt.compare(req.body.password, user.password);

    if (!validatePassword)
      return res
        .status(400)
        .json({ error: 'Invalid Phone Number or Password' });

    // User disabled
    // if (!user.status)
    //   return res.status(401).json({ error: 'Your account is Inactive' });

    const token = user.generateAuthToken();

    let sanitizedUser = _.omit(user.toObject(), 'password');
    console.log('sanitizedUser', sanitizedUser);
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

// checkUserExists
const checkUserExists = async (req, res) => {
  try {
    const user = await User.findOne({
      ph_number: req.body.ph_number,
    }).select('+password');

    if (!user)
      return res.status(201).json({
        success: false,
        status: 'User not Exist',
      });

    return res.status(200).json({
      success: true,
      basicProfileStatus: user.basicProfileStatus,
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
  signUpStepZero,
  sendOtpApi,
  verifyOtpApi,
  createSignupProfile,
  forgotPassword,
  logout,
  checkUserExists,
};
