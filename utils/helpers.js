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
const calculateAge = dateOfBirth => {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
};
module.exports = {
  generateUniqueUsername,
  calculateAge,
};
