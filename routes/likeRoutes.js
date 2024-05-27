const express = require('express');
const router = express.Router();
const likeController = require('../controllers/likeController.js');

// Get all likes
router.get('/', likeController.getAllLikes);

// Get like by ID
router.get('/:id', likeController.getLikeById);

// Create a new like
router.post('/', likeController.createLike);

// Update a like
router.put('/:id', likeController.updateLike);

// Delete a like
router.delete('/:id', likeController.deleteLike);

module.exports = router;
