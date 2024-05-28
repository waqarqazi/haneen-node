/* eslint-disable */
const User = require('../models/User');

const generateUniqueUsername = async attachedText => {
  const timestamp = Date.now(); // Get current timestamp
  let baseUsername = `${attachedText.toLowerCase()}${timestamp}`;

  let username = baseUsername;
  let count = 1;

  while (await User.findOne({ username })) {
    username = `${baseUsername}_${count}`;
    count++;
  }

  return username;
};
module.exports = {
  generateUniqueUsername,
};
