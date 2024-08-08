const express = require('express');

const router = express.Router();
const actionController = require('../controllers/actionController.js');
const auth = require('../middleware/authMiddleware.js');

router.route('/').post(auth, actionController.makeRewind);

module.exports = router;
