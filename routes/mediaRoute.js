const express = require('express');

const router = express.Router();
const mediaController = require('../controllers/mediaController.js');
const auth = require('../middleware/authMiddleware.js');

// Create a new hobby
router.route('/').post(auth, mediaController.uploadImages);

// Get all hobbies
router.route('/').get(auth, mediaController.getHobbies);

// Get a single hobby by ID
router.route('/:id').get(auth, mediaController.getMediaById);

// Update a hobby by ID
router.route('/:id').put(auth, mediaController.updateMedia);

// Delete a hobby by ID
router.route('/:id').delete(auth, mediaController.deleteMedia);

module.exports = router;
