const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token = req.cookies.jwt; // First try to intercept the hyper-secure HttpOnly cookie

  if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1]; // Fallback to traditional Bearer logic
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      return next();
    } catch (error) {
      return res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  res.status(401).json({ message: 'Not authorized, no token' });
};

const admin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as an admin' });
  }
};

module.exports = { protect, admin };
