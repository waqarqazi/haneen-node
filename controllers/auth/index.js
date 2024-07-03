const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const twilio = require('twilio');
const User = require('../../models/User.js');

const ErrorResponse = require('../../utils/errorResponse.js');
const { generateUniqueUsername } = require('../../utils/helpers.js');
const { sendOTP, verifyOTP, generateOtp } = require('./helper.js');
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
  try {
    const prevUser = await User.findOne({ ph_number: req.body.ph_number });
    if (prevUser) {
      return res.json({ otp: 'test', detail: 'User Exist' });
    }
    return res.json({ otp: 'test' });
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
};
const verifyOtpApi = async (req, res) => {
  try {
    const prevUser = await User.findOne({ ph_number: req.body.ph_number });
    if (prevUser) {
      if (prevUser.otpVerified) {
        return res.json({ otpDetails: 'Already Verified' });
      }
    }
    const otpDetails = await verifyOTP(req.body.ph_number, req.body.otp);
    if (otpDetails.status == 'approved') {
      const updatedUser = await User.findOneAndUpdate(
        { ph_number: req.body.ph_number },
        {
          $set: { otpVerified: true },
        },
        {
          new: true, // Return the updated document
          upsert: true, // Create a new document if none is found
          setDefaultsOnInsert: true, // Apply default values if a new document is created
        },
      )
        .lean()
        .exec();
      return res.json({
        otpDetails,
        updatedUser,
      });
    }
    return res.json({ otpDetails });
  } catch (error) {
    console.log('error', error);
    return res.status(500).send(error);
  }
};
const addRemainDetails = async (req, res) => {
  console.log('id', req.body.user._id);
  try {
    const user = await User.findByIdAndUpdate(req.body.user._id, req.body, {
      new: true, // Return the updated document
      runValidators: true, // Validate the update operation
    })
      .lean()
      .exec();

    if (!user) {
      return res.status(404).send({ message: 'User not found' });
    }
    return res.status(200).json({ user, success: true });
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
      $or: [
        { username: req.body.usernameOrEmail },
        { email: req.body.usernameOrEmail },
      ],
    }).select('+password');

    if (!user)
      return res.status(400).json({ error: 'Invalid userName or Password' });

    const validatePassword = bcrypt.compare(req.body.password, user.password);

    if (!validatePassword)
      return res.status(400).json({ error: 'Invalid userName or Password' });

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

module.exports = {
  register,
  login,
  signUpStepZero,
  sendOtpApi,
  verifyOtpApi,
  addRemainDetails,
  forgotPassword,
};
