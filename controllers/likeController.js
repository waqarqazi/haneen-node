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
// const createLike = async (req, res) => {
//   const { liked_user_id } = req.body;
//   let userId = req.body.user._id;
//   try {
//     // Check if the like already exists
//     const existingLike = await Like.findOne({
//       user_id: userId,
//       liked_user_id: liked_user_id,
//     });

//     if (!existingLike) {
//       const like = new Like({ user_id: userId, liked_user_id: liked_user_id });
//       await like.save();
//     }

//     // Check if there is a mutual like
//     const mutualLike = await Like.findOne({
//       user_id: liked_user_id,
//       liked_user_id: userId,
//     });

//     // if (mutualLike) {
//     const roomId = [userId, liked_user_id].sort().join('-');

//     // Check if a room already exists for these users
//     let room =
//       (await Room.findOne({ user1: userId, user2: liked_user_id })) ||
//       (await Room.findOne({ user1: liked_user_id, user2: userId }));

//     if (!room) {
//       room = new Room({ user1: userId, user2: liked_user_id, roomId });
//       await room.save();
//     }

//     return res.json({ message: "It's a match!", roomId: room.roomId });
//     // }

//     //  res.json({ message: 'Like recorded' });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: 'Internal server error' });
//   }
// };

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
  // createLike,
  updateLike,
  deleteLike,
};
