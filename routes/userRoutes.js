const express = require('express');
const auth = require('../middleware/authMiddleware.js');
const {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
  getProfile,
  getAllUsersForMatch,
} = require('../controllers/userController');

const router = express.Router();

// Define routes and attach controller functions
router.route('/profile').get(auth, getProfile);
router.route('/').get(getAllUsers);
router.route('/').post(createUser);
router.route('/:id').get(getUserById);
router.route('/update').post(auth, updateUser);
router.route('/:id').delete(deleteUser);
router.route('/match/fetchMatches').get(auth, getAllUsersForMatch);

module.exports = router;
