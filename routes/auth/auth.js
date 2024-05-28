const express = require('express');

const router = express.Router();
const authController = require('../../controllers/authController.js');
const {
  validateLogin,
  validateRegister,
} = require('../../utils/validation.js');
const validator = require('../../middleware/validator.js');
// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router
  .route('/register')
  .post(validator(validateRegister, 'body'), authController.register);

// @route    POST api/auth/login
// @desc     Login user
// @access   Public
router.route('/login').post(
  (req, res, next) => {
    next();
  },
  validator(validateLogin, 'body'),
  authController.login,
);

module.exports = router;
