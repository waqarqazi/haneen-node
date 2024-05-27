const Like = require('../models/Like');
const ErrorResponse = require('../utils/errorResponse.js');
// Get all likes
const getAllLikes = async (req, res) => {
  try {
    const likes = await Like.find();
    res.json(likes);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
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
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Create a new like
const createLike = async (req, res) => {
  const { user_id, liked_user_id } = req.body;

  try {
    let like = new Like({
      user_id,
      liked_user_id,
    });

    await like.save();
    res.json(like);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Update a like
const updateLike = async (req, res) => {
  const { liked_user_id } = req.body;

  try {
    let like = await Like.findById(req.params.id);

    if (!like) {
      return res.status(404).json({ msg: 'Like not found' });
    }

    like.liked_user_id = liked_user_id || like.liked_user_id;

    await like.save();
    res.json(like);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
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
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};
module.exports = {
  getAllLikes,
  getLikeById,
  createLike,
  updateLike,
  deleteLike,
};
