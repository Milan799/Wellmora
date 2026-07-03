import express from 'express';
import {
  register,
  login,
  logout,
  refresh,
  getMe,
  updateAddress,
  socialLogin,
  getUsers
} from '../controllers/authController.js';
import { protect, authorizeRoles } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.post('/social-login', authLimiter, socialLogin);
router.post('/refresh', refresh);

// Protected routes
router.post('/logout', protect, logout);
router.get('/me', protect, getMe);
router.put('/address', protect, updateAddress);

// Admin only routes
router.get('/users', protect, authorizeRoles('admin'), getUsers);

export default router;

