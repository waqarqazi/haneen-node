/* eslint-disable */

const Like = require('../models/Like');
// const Room = require('../models/Room.js');
const ErrorResponse = require('../utils/errorResponse.js');
const socketIo = require('socket.io');
// Get all likes
const getAllLikes = async (req, res) => {
  try {
    const likes = await Like.find();
    res.json(likes);
  } catch (err) {
    return res.status(500).json({ status: false, err });
  }
};

// Get like by ID
const getLikeById = async (req, res) => {
  try {
    const like = await Like.findById(req.params.id);
    if (!like) {
      return res.status(404).json({ msg: 'Like not found' });
    }
    res.json(like);
  } catch (err) {
    return res.status(500).json({ status: false, err });
  }
};

// Create a new like
const createLike = async (req, res) => {
  try {
    const { likedUserId } = req.body;
    let userId = req.body.user._id;
    console.log('userId', userId);
    const existingLike = await Like.findOne({ userId, likedUserId });
    if (existingLike) {
      return res.json({
        success: false,
        message: 'User has already been liked',
      });
    }
    const newLike = new Like({ userId, likedUserId });
    await newLike.save();
    res.json(newLike);
  } catch (error) {
    console.log('error', error);
    res.json({ success: false, message: error });
  }
};

// Update a like
const updateLike = async (req, res) => {
  const { liked_user_id } = req.body;

  try {
    let like = await Like.findById(req.params.id);

    if (!like) {
      return res.status(200).json({ msg: 'Like not found' });
    }

    like.liked_user_id = liked_user_id || like.liked_user_id;

    await like.save();
    return res.status(200).json({ status: true, like });
  } catch (err) {
    return res.status(500).json({ status: false, err });
  }
};

// Delete a like
const deleteLike = async (req, res) => {
  try {
    let like = await Like.findById(req.params.id);

    if (!like) {
      return res.status(404).json({ msg: 'Like not found' });
    }

    await like.remove();
    res.json({ msg: 'Like removed' });
  } catch (err) {
    return res.status(500).json({ status: false, err });
  }
};
module.exports = {
  getAllLikes,
  getLikeById,
  createLike,
  updateLike,
  deleteLike,
};