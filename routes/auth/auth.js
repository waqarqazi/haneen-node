const express = require('express');

const router = express.Router();
const auth = require('../../middleware/authMiddleware.js');
const authController = require('../../controllers/auth');
const {
  validateLogin,
  validateRegister,
} = require('../../utils/validation.js');
const validator = require('../../middleware/validator.js');

router
  .route('/register')
  .post(validator(validateRegister, 'body'), authController.register);
router.route('/logout').post(auth, authController.logout);

router.route('/login').post(
  (req, res, next) => {
    next();
  },
  validator(validateLogin, 'body'),
  authController.login,
);

module.exports = router;
