const express = require('express');

const router = express.Router();
const actionController = require('../controllers/actionController.js');
const auth = require('../middleware/authMiddleware.js');

router.route('/start-game').post(auth, actionController.startGame);
router.route('/make-move').post(auth, actionController.makeMove);
router.route('/status').post(auth, actionController.checkStatus);
router.route('/profile').get(auth, actionController.getProfile);

module.exports = router;
