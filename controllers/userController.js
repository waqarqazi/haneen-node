const Like = require('../models/Like.js');
const Match = require('../models/Match.js');
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

// Get all users Formatch
const getAllUsersForMatch = async (req, res, next) => {
  try {
    const userId = req.body.user._id; // or req.body.userId depending on where you get the user ID from

    // Get the list of users who have matched with the current user
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).select('user1 user2');

    const matchedUserIds = matches.map(match => {
      if (match.user1.toString() === userId.toString()) {
        return match.user2;
      }
      return match.user1;
    });

    // Get the list of users who have been liked by the current user
    const likes = await Like.find({ userId }).select('likedUserId');
    const likedUserIds = likes.map(like => like.likedUserId);

    // Combine matched and liked user IDs to exclude them
    const excludedUserIds = [...matchedUserIds, ...likedUserIds, userId];

    // Get all users excluding the current user and users who have matched or been liked by the current user
    const users = await User.find({
      _id: { $nin: excludedUserIds },
    }).select(
      'first_name last_name _id gender sexual_orientation bio profile_picture',
    );

    res.status(200).json(users);
  } catch (error) {
    next(new ErrorResponse('Failed to retrieve users', 500));
  }
};
// Get user by ID
const getUserById = async (req, res, next) => {
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

// Get user by ID
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById({ _id: req.body.user._id });
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    return res.json({ user });
  } catch (err) {
    return res.status(500).send(err);
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
const updateUser = async (req, res, next) => {
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
const deleteUser = async (req, res, next) => {
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
  getProfile,
  getAllUsersForMatch,
};
