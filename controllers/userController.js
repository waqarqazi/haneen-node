const User = require('../models/User.js');
const ErrorResponse = require('../utils/errorResponse.js');
// Get all users
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    next(new ErrorResponse('Failed to retrieve users', 500));
  }
};

// Get user by ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Create a new user
const createUser = async (req, res, next) => {
  try {
    // Your code to create a user
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    console.error(error);
    next(new ErrorResponse('Failed to create user', 500));
  }
};

// Update a user
const updateUser = async (req, res) => {
  const { username, email, password } = req.body;

  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    user.username = username || user.username;
    user.email = email || user.email;
    user.password = password || user.password;

    await user.save();
    res.json(user);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Delete a user
const deleteUser = async (req, res) => {
  try {
    let user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    await user.remove();
    res.json({ msg: 'User removed' });
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};
module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
