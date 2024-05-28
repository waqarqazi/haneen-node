const express = require('express');

const router = express.Router();
const authController = require('../../controllers/auth');
const {
  validateLogin,
  validateRegister,
} = require('../../utils/validation.js');
const validator = require('../../middleware/validator.js');
// @route    POST api/auth/register
// @desc     Register user
// @access   Public
router.route('/register').post(validator(validateRegister, 'body'));
router.route('/signup-step-zero').post(authController.signUpStepZero);
router.route('/send-otp').post(authController.sendOtpApi);
router.route('/verify-otp').post(authController.verifyOtpApi);

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
