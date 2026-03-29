const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/auth');
const rateLimit = require('express-rate-limit');

const router = express.Router();

// Generate JWT
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: '4h' });
};

// Specific limiter for Auth routes: max 5 attempts per 15 mins
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login/register attempts. Please try again after 15 minutes.',
  standardHeaders: true,
  legacyHeaders: false,
});

// POST /api/auth/register (Admin only)
router.post('/register', authLimiter, protect, adminOnly, async (req, res) => {
  try {
    const { username, password, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    const user = await User.create({
      username,
      password,
      role: role || 'user',
    });

    res.status(201).json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', authLimiter, async (req, res) => {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    res.json({
      _id: user._id,
      username: user.username,
      role: user.role,
      token: generateToken(user._id, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
