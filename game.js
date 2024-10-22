// server.js
const express = require('express');
const axios = require('axios');

const app = express();
const PORT = 3000;

app.use(express.json());

const pythonAPIUrl = 'http://localhost:8000'; // Change this if your Python API is hosted elsewhere
let currentSessionId = null;

// Start a new game session
app.post('/start-game', async (req, res) => {
  try {
    const response = await axios.post(`${pythonAPIUrl}/start-game`);
    currentSessionId = response.data.session_id;
    res
      .status(200)
      .json({ sessionId: currentSessionId, board: response.data.board });
  } catch (error) {
    res.status(500).json({ error: 'Failed to start game.' });
  }
});

// Make a move in the game
app.post('/make-move', async (req, res) => {
  const { row, col, player } = req.body;

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
    res.status(200).json(response.data);
  } catch (error) {
    if (error.response && error.response.data) {
      return res
        .status(error.response.status)
        .json({ error: error.response.data.detail });
    }
    res.status(500).json({ error: 'Failed to make move.' });
  }
});

// Get current game status
app.get('/status', async (req, res) => {
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
});

// Start the server
app.listen(PORT, () => {
  console.log(`Node.js server running on http://localhost:${PORT}`);
});
