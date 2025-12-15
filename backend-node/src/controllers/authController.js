const User = require('../models/User');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const { generateTokens } = require('../utils/jwt');
const { validateRegister, validateLogin } = require('../middleware/validation');

const register = async (req, res) => {
  try {
    const { error, value } = validateRegister(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { name, email, password, phone } = value;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const user = new User({
      name,
      email,
      password: hashedPassword,
      phone,
      role: 'customer', // Default role
    });

    await user.save();

    const tokens = generateTokens(user._id, user.email, user.role);
    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Registration failed', error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { error, value } = validateLogin(req.body);
    if (error) {
      return res.status(400).json({ message: error.details[0].message });
    }

    const { email, password } = value;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    const tokens = generateTokens(user._id, user.email, user.role);
    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      ...tokens,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
};

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      // Don't reveal if email exists
      return res.json({ message: 'If email exists, password reset link has been sent' });
    }

    // In production, send actual email with reset link
    // For now, generate a temporary password
    const tempPassword = Math.random().toString(36).slice(-12);
    const hashedPassword = await bcrypt.hash(tempPassword, 10);
    user.password = hashedPassword;
    await user.save();

    // In development, log the temp password
    if (process.env.NODE_ENV === 'development') {
      console.log(`Temporary password for ${email}: ${tempPassword}`);
      return res.json({
        message: 'Password reset in dev mode',
        tempPassword, // Only in dev!
      });
    }

    res.json({ message: 'If email exists, password reset link has been sent' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ message: 'Password reset failed', error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get booking summary for this user
    const Booking = require('../models/Booking');
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const bookingStats = await Booking.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          confirmedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] },
          },
          pendingBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
          },
          cancelledBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'cancelled'] }, 1, 0] },
          },
          totalSpent: { $sum: '$pricePaid' },
        },
      },
    ]);

    const stats = bookingStats[0] || {
      totalBookings: 0,
      confirmedBookings: 0,
      pendingBookings: 0,
      cancelledBookings: 0,
      totalSpent: 0,
    };

    res.json({
      user,
      bookingStats: stats,
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Error fetching profile', error: error.message });
  }
};

const updateProfile = async (req, res) => {
  try {
    const { name, phone, address, city, state, zipCode, country, dateOfBirth } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user.userId,
      {
        name,
        phone,
        address,
        city,
        state,
        zipCode,
        country,
        dateOfBirth,
      },
      { new: true }
    ).select('-password');

    res.json({ message: 'Profile updated', user });
  } catch (error) {
    res.status(500).json({ message: 'Error updating profile', error: error.message });
  }
};

const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Current and new passwords are required' });
    }

    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Current password is incorrect' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error changing password', error: error.message });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  getProfile,
  updateProfile,
  changePassword,
};
