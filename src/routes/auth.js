import express from 'express';
import passport from '../config/passport.js';
import {
  register,
  login,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  googleCallback,
  logout,
  googleLogin
} from '../controllers/authController.js';

import { authenticateToken } from '../middleware/auth.js';
import {
  validateRegister,
  validateLogin,
  validateProfileUpdate,
  validatePasswordChange
} from '../utils/validators.js';

const router = express.Router();

// Local authentication routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.post('/refresh-token', refreshToken);
router.post('/logout', logout);

// Google OAuth routes
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

router.post("/google", googleLogin);

router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/auth/error' }),
  googleCallback
);

// Protected routes (require authentication)
router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, validateProfileUpdate, updateProfile);
router.put('/change-password', authenticateToken, validatePasswordChange, changePassword);

export default router;

