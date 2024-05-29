const express = require('express');

const router = express.Router();
const hobbyController = require('../controllers/hobbyController');

// Create a new hobby
router.route('/').post(hobbyController.createHobby);

// Get all hobbies
router.route('/').get(hobbyController.getHobbies);

// Get a single hobby by ID
router.route('/:id').get(hobbyController.getHobbyById);

// Update a hobby by ID
router.route('/:id').put(hobbyController.updateHobby);

// Delete a hobby by ID
router.route('/:id').delete(hobbyController.deleteHobby);

module.exports = router;
