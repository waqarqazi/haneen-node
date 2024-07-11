/* eslint-disable */
const Match = require('../models/Match');
const ErrorResponse = require('../utils/errorResponse.js');
// Get all matches
const getAllMatches = async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};
const getMatchesByUser = async (req, res) => {
  const userId = req.body.user._id;

  try {
    const matches = await Match.find({
      $or: [{ user1: userId }, { user2: userId }],
    }).populate('user1 user2', '-password -email -ph_number -otpVerified');

    res.status(200).json(matches);
  } catch (err) {
    res.status(500).send(err);
  }
};
const getUsersForMatch = async (req, res) => {
  try {
    const matches = await Match.find();
    res.json(matches);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Get match by ID
const getMatchById = async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }
    res.json(match);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Create a new match
const createMatch = async (req, res) => {
  const { user_id_1, user_id_2, is_mutual } = req.body;

  try {
    let match = new Match({
      user_id_1,
      user_id_2,
      is_mutual,
    });

    await match.save();
    res.json(match);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Update a match
const updateMatch = async (req, res) => {
  const { is_mutual } = req.body;

  try {
    let match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }

    match.is_mutual = is_mutual || match.is_mutual;

    await match.save();
    res.json(match);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Delete a match
const deleteMatch = async (req, res) => {
  try {
    let match = await Match.findById(req.params.id);

    if (!match) {
      return res.status(404).json({ msg: 'Match not found' });
    }

    await match.remove();
    res.json({ msg: 'Match removed' });
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};
module.exports = {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  getUsersForMatch,
  getMatchesByUser,
};
