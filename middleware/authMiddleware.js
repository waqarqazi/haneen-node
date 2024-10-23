const jwt = require('jsonwebtoken');

// Middle ware function
const authMiddleware = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token)
    return res.status(401).json({ message: 'Access denied. No token passed.' });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.body.user = decoded;
    next();
  } catch (ex) {
    res.status(400).json({ message: 'Invalid Token.' });
  }
};

module.exports = authMiddleware;

