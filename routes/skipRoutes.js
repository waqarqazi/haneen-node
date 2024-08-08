const express = require('express');

const router = express.Router();
const skipController = require('../controllers/skipController.js');
const auth = require('../middleware/authMiddleware.js');
// Get all likes
router.route('/').get(auth, skipController.getAllSkip);

// Get like by ID
router.route('/:id').get(auth, skipController.getSkipById);

// Create a new like
router.route('/').post(auth, skipController.createSkip);

// Update a like
router.route('/:id').put(auth, skipController.updateSkip);

// Delete a like
router.route('/:id').delete(auth, skipController.deleteSkip);

module.exports = router;
