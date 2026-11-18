import express from 'express';
import { body } from 'express-validator';
import {
  registerCitizen,
  login,
  getMe,
  logout,
  forgotPassword,
  resetPassword
} from '../controllers/authController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validationMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post(
  '/register',
  authLimiter,
  [
    body('name').trim().notEmpty().withMessage('Full name is required.'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email address is required.'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('confirmPassword').notEmpty().withMessage('Please confirm your password.')
  ],
  validate,
  registerCitizen
);

router.post(
  '/login',
  authLimiter,
  [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password').notEmpty().withMessage('Password is required.')
  ],
  validate,
  login
);

router.post('/logout', authenticateToken, logout);
router.get('/me', authenticateToken, getMe);

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail().withMessage('Valid email is required.')],
  validate,
  forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [
    body('token').notEmpty().withMessage('Reset token is required.'),
    body('newPassword').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long.'),
    body('confirmPassword').notEmpty().withMessage('Confirmation password is required.')
  ],
  validate,
  resetPassword
);

export default router;
