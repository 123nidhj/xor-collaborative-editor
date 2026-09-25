import express from 'express';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_key_collab_platform_2026',
    { expiresIn: '7d' }
  );
};

// @route   POST /api/auth/register
// @desc    Register a new user account
// @access  Public
router.post('/register', async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email already exists.',
      });
    }

    const user = await User.create({
      name,
      email,
      password,
    });

    const token = signToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user,
    });
  } catch (err) {
    next(err);
  }
});

// @route   POST /api/auth/login
// @desc    Authenticate user & return JWT token
// @access  Public
router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password.',
      });
    }

    // Explicitly select password since it has select: false
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const token = signToken(user._id);

    res.status(200).json({
      success: true,
      token,
      user: user.toJSON(),
    });
  } catch (err) {
    next(err);
  }
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user profile
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
});

export default router;
