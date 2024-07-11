const express = require('express');

const router = express.Router();
const likeController = require('../controllers/likeController.js');
const auth = require('../middleware/authMiddleware.js');
// Get all likes
router.route('/').get(auth, likeController.getAllLikes);

// Get like by ID
router.route('/:id').get(auth, likeController.getLikeById);

// Create a new like
router.route('/').post(auth, likeController.createLike);

// Update a like
router.route('/:id').put(auth, likeController.updateLike);

// Delete a like
router.route('/:id').delete(auth, likeController.deleteLike);

module.exports = router;
