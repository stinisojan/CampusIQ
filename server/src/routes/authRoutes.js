const express = require('express');
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middlewares/authMiddleware');
const { authLimiter } = require('../middlewares/rateLimiter');

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('role').optional().isIn(['student', 'admin']).withMessage('Role must be student or admin'),
  ],
  authController.register
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  authController.login
);

router.get('/me', protect, authController.getMe);

module.exports = router;
