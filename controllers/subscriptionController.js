const Subscription = require('../models/Subscription');
const ErrorResponse = require('../utils/errorResponse.js');
// Get all subscriptions
const getAllSubscriptions = async (req, res) => {
  try {
    const subscriptions = await Subscription.find();
    res.json(subscriptions);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Get subscription by ID
const getSubscriptionById = async (req, res) => {
  try {
    const subscription = await Subscription.findById(req.params.id);
    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }
    res.json(subscription);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Create a new subscription
const createSubscription = async (req, res) => {
  const { user_id, plan, start_date, end_date } = req.body;

  try {
    let subscription = new Subscription({
      user_id,
      plan,
      start_date,
      end_date,
    });

    await subscription.save();
    res.json(subscription);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Update a subscription
const updateSubscription = async (req, res) => {
  const { plan, start_date, end_date } = req.body;

  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }

    subscription.plan = plan || subscription.plan;
    subscription.start_date = start_date || subscription.start_date;
    subscription.end_date = end_date || subscription.end_date;

    await subscription.save();
    res.json(subscription);
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};

// Delete a subscription
const deleteSubscription = async (req, res) => {
  try {
    let subscription = await Subscription.findById(req.params.id);

    if (!subscription) {
      return res.status(404).json({ msg: 'Subscription not found' });
    }

    await subscription.remove();
    res.json({ msg: 'Subscription removed' });
  } catch (err) {
    next(new ErrorResponse('Failed to retrieve', 500));
  }
};
module.exports = {
  getAllSubscriptions,
  getSubscriptionById,
  createSubscription,
  updateSubscription,
  deleteSubscription,
};
