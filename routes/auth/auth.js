const express = require('express');

const router = express.Router();
const auth = require('../../middleware/authMiddleware.js');
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
router.route('/verify-otp').post(auth, authController.verifyOtpApi);
router.route('/add-user-details').post(auth, authController.addRemainDetails);
router.route('/forgot-password').post(authController.forgotPassword);

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
