const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { updateStreak } = require('../utils/streakManager');

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || 'fallback_secret', { expiresIn: '30d' });
};

// @route POST /api/auth/register
const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'All fields are required' });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({
      name,
      email,
      password,
      notifications: [{
        message: `Welcome to EduLearn, ${name}! Start your learning journey today! 🎉`,
        type: 'system'
      }]
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: user.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// @route POST /api/auth/login
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Update streak on login
    await updateStreak(user._id);

    const updatedUser = await User.findById(user._id);
    const token = generateToken(user._id);

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: updatedUser.toJSON()
    });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/me
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate('enrolledCourses.course', 'title thumbnail category');
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route PUT /api/auth/profile
const updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, language } = req.body;
    const updates = {};
    if (name) updates.name = name;
    if (avatar) updates.avatar = avatar;
    if (language) updates.language = language;

    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true });
    res.json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

// @route GET /api/auth/leaderboard
const getLeaderboard = async (req, res, next) => {
  try {
    const users = await User.find({})
      .select('name avatar points streak.current enrolledCourses')
      .sort({ points: -1 })
      .limit(20);

    res.json({ success: true, leaderboard: users });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, getMe, updateProfile, getLeaderboard };
