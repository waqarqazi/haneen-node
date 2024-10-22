const axios = require('axios');
const User = require('../models/User.js');
require('dotenv').config();

const pythonAPIUrl = process.env.PYTHON_ENIGNE_URL;
let currentSessionId = null;
const startGame = async (req, res) => {
  try {
    const response = await axios.post(`${pythonAPIUrl}/start-game`);
    currentSessionId = response.data.session_id;
    res
      .status(200)
      .json({ sessionId: currentSessionId, board: response.data.board });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start game.' });
  }
};
const makeMove = async (req, res) => {
  const { row, col, player } = req.body;
  const userId = req.body.user._id;

  let user;
  try {
    user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found.' });
    }
  } catch (error) {
    console.error('Error fetching user:', error);
    return res.status(500).json({ error: 'Failed to fetch user.' });
  }

  if (!currentSessionId) {
    return res.status(400).json({ error: 'Game session not started.' });
  }

  try {
    const response = await axios.post(`${pythonAPIUrl}/make-move`, {
      session_id: currentSessionId,
      row,
      col,
      player,
    });

    if (response?.data?.winner === 'X') {
      user.wins = (user.wins || 0) + 1;
    } else if (response?.data?.winner === 'O') {
      user.loses = (user.loses || 0) + 1;
    } else if (response?.data?.winner === 'Draw') {
      user.draws = (user.draws || 0) + 1;
    }
    await user.save();

    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error during makeMove:', error);

    // Handle error from the Python API
    if (error.response && error.response.data) {
      return res
        .status(error.response.status)
        .json({ error: error.response.data.detail });
    }
    res.status(500).json({ error: 'Failed to make move.' });
  }
};

const checkStatus = async (req, res) => {
  if (!currentSessionId) {
    return res.status(400).json({ error: 'Game session not started.' });
  }

  try {
    const response = await axios.get(
      `${pythonAPIUrl}/status/${currentSessionId}`,
    );
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to get game status.' });
  }
};
const getProfile = async (req, res, next) => {
  const userId = req.body.user._id;
  try {
    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    return res.json({
      user,
    });
  } catch (err) {
    return res.status(500).send(err);
  }
};
module.exports = {
  startGame,
  makeMove,
  checkStatus,
  getProfile,
};
