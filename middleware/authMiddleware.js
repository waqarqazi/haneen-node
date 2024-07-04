const jwt = require('jsonwebtoken');
const InvalidToken = require('../models/InvalidToken');

const authMiddleware = async (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token)
    return res.status(401).json({ message: 'Access denied. No token passed.' });

  // Check if the token is in the invalidated tokens list
  const invalidToken = await InvalidToken.findOne({ token });
  if (invalidToken) {
    return res.status(401).json({ message: 'Invalid Token.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid Token.' });
  }
};

module.exports = authMiddleware;
