/* eslint-disable */

const Like = require('../models/Like.js');
const Match = require('../models/Match.js');
const Skip = require('../models/SkipUser.js');
const { ActionHistory, ActionType } = require('../models/ActionHistory.js');
const SuperLike = require('../models/SuperLike.js');

// Create a new like
const makeRewind = async (req, res) => {
  const userId = req.body.user._id;
  try {
    const lastAction = await ActionHistory.findOne({ userId }).sort({
      timestamp: -1,
    });
    console.log('lastAction', lastAction);

    if (!lastAction) {
      return res.status(404).json({ message: 'No actions to revert' });
    }

    const { actionType, targetUserId } = lastAction;

    if (actionType === ActionType.LIKE) {
      await Like.findOneAndDelete({ userId, likedUserId: targetUserId });
      await Match.findOneAndDelete({
        $or: [
          { userId1: userId, userId2: targetUserId },
          { userId1: targetUserId, userId2: userId },
        ],
      });
    } else if (actionType === ActionType.SKIP) {
      await Skip.findOneAndDelete({ userId, skippedUserId: targetUserId });
    } else if (actionType === ActionType.SUPERLIKE) {
      await SuperLike.findOneAndDelete({
        userId,
        superlikedUserId: targetUserId,
      });
      await Match.findOneAndDelete({
        $or: [
          { userId1: userId, userId2: targetUserId },
          { userId1: targetUserId, userId2: userId },
        ],
      });
    }

    await ActionHistory.findByIdAndDelete(lastAction._id);

    res.status(200).json({ message: 'Rewind operation successful' });
  } catch (error) {
    console.log('error', error);
    res.status(500).json({ message: 'Rewind operation failed', error });
  }
};

module.exports = {
  makeRewind,
};
