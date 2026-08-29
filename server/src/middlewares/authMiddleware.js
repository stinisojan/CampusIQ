const jwt = require('jsonwebtoken');
const config = require('../config/env');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check Authorization header (Bearer token)
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } 
  // 2. Check URL Query Parameter (?token=...) for direct file viewing in new tabs
  else if (req.query && req.query.token) {
    token = req.query.token;
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    
    // In local dev without DB or with DB, retrieve user
    let user = null;
    try {
      user = await User.findById(decoded.id).select('-password');
    } catch (e) {
      // Fallback
    }

    if (!user) {
      // Create lightweight fallback user from JWT payload if DB temporarily offline
      req.user = {
        _id: decoded.id,
        id: decoded.id,
        name: decoded.name || 'User',
        email: decoded.email,
        role: decoded.role || 'student',
        department: decoded.department || 'General',
      };
    } else {
      req.user = user;
    }

    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid or expired token.',
    });
  }
};

module.exports = { protect };