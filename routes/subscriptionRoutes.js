const express = require('express');
const router = express.Router();
const subscriptionController = require('../controllers/subscriptionController.js');

// Get all subscriptions
router.get('/', subscriptionController.getAllSubscriptions);

// Get subscription by ID
router.get('/:id', subscriptionController.getSubscriptionById);

// Create a new subscription
router.post('/', subscriptionController.createSubscription);

// Update a subscription
router.put('/:id', subscriptionController.updateSubscription);

// Delete a subscription
router.delete('/:id', subscriptionController.deleteSubscription);

module.exports = router;
