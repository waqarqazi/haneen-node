const express = require('express');

const router = express.Router();
const questionController = require('../controllers/questionController');

// Create a new hobby
router.route('/').post(questionController.createQuestion);

// Get all hobbies
router.route('/').get(questionController.getQuestions);

// Get a single hobby by ID
router.route('/:id').get(questionController.getQuestionById);

// Update a hobby by ID
router.route('/:id').put(questionController.updateQuestion);

// Delete a hobby by ID
router.route('/:id').delete(questionController.deleteQuestion);

module.exports = router;
