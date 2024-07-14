/* eslint-disable */

const Skip = require('../models/SkipUser.js');
// const Room = require('../models/Room.js');
const ErrorResponse = require('../utils/errorResponse.js');
const socketIo = require('socket.io');
// Get all likes
const getAllSkip = async (req, res) => {
  try {
    const likes = await Skip.find();
    res.json(likes);
  } catch (err) {
    return res.status(500).json({ status: false, err });
  }
};

// Get like by ID
const getSkipById = async (req, res) => {
  try {
    const like = await Skip.findById(req.params.id);
    if (!like) {
      return res.status(404).json({ msg: 'Skip not found' });
    }
    res.json(like);
  } catch (err) {
    return res.status(500).json({ status: false, err });
  }
};

// Create a new like
const createSkip = async (req, res) => {
  try {
    const { skippedUserId } = req.body;
    let userId = req.body.user._id;
    console.log('userId', userId);
    const existingSkip = await Skip.findOne({ userId, skippedUserId });
    if (existingSkip) {
      return res.json({
        success: false,
        message: 'User has already been Skpied',
      });
    }
    const newSkip = new Skip({ userId, skippedUserId });
    await newSkip.save();
    res.json(newSkip);
  } catch (error) {
    console.log('error', error);
    res.json({ success: false, message: error });
  }
};

// Update a like
const updateSkip = async (req, res) => {
  const { liked_user_id } = req.body;

  try {
    let like = await Skip.findById(req.params.id);

    if (!like) {
      return res.status(200).json({ msg: 'Skip not found' });
    }

    like.liked_user_id = liked_user_id || like.liked_user_id;

    await like.save();
    return res.status(200).json({ status: true, like });
  } catch (err) {
    return res.status(500).json({ status: false, err });
  }
};

// Delete a like
const deleteSkip = async (req, res) => {
  try {
    let like = await Skip.findById(req.params.id);

    if (!like) {
      return res.status(404).json({ msg: 'Skip not found' });
    }

    await like.remove();
    res.json({ msg: 'Skip removed' });
  } catch (err) {
    return res.status(500).json({ status: false, err });
  }
};
module.exports = {
  getAllSkip,
  getSkipById,
  createSkip,
  updateSkip,
  deleteSkip,
};
