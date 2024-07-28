const express = require('express');

const router = express.Router();
const superLikeController = require('../controllers/superLikeController.js');
const auth = require('../middleware/authMiddleware.js');
// Get all likes
router.route('/').get(auth, superLikeController.getAllLikes);

// Get like by ID
router.route('/:id').get(auth, superLikeController.getLikeById);

// Create a new like
router.route('/').post(auth, superLikeController.createLike);

// Update a like
router.route('/:id').put(auth, superLikeController.updateLike);

// Delete a like
router.route('/:id').delete(auth, superLikeController.deleteLike);

module.exports = router;
