const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/env');

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
    },
    config.JWT_SECRET,
    {
      expiresIn: config.JWT_EXPIRES_IN,
    }
  );
};

const registerUser = async ({ name, email, password, role, department }) => {
  const existingUser = await User.findOne({ email: email.toLowerCase() });
  if (existingUser) {
    const error = new Error('A user with this email address already exists.');
    error.statusCode = 400;
    throw error;
  }

  const user = await User.create({
    name,
    email: email.toLowerCase(),
    password,
    role: role === 'admin' ? 'admin' : 'student',
    department: department || 'General',
  });

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    token,
  };
};

const loginUser = async ({ email, password }) => {
  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user) {
    const error = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    const error = new Error('Invalid email or password credentials.');
    error.statusCode = 401;
    throw error;
  }

  user.lastLogin = new Date();
  await user.save();

  const token = generateToken(user);

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
    },
    token,
  };
};

const getUserProfile = async (userId) => {
  const user = await User.findById(userId).select('-password');
  if (!user) {
    const error = new Error('User not found.');
    error.statusCode = 404;
    throw error;
  }
  return user;
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile,
  generateToken,
};
