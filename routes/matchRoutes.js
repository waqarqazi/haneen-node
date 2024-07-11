const express = require('express');

const router = express.Router();
const auth = require('../middleware/authMiddleware.js');
const {
  getAllMatches,
  getMatchById,
  createMatch,
  updateMatch,
  deleteMatch,
  getMatchesByUser,
} = require('../controllers/matchController.js');

router.route('/').get(getAllMatches).post(createMatch);
router.route('/my').get(auth, getMatchesByUser);

router.route('/:id').get(getMatchById).put(updateMatch).delete(deleteMatch);

module.exports = router;
