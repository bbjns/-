const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const TradingCalculation = require('../models/TradingCalculation');
const auth = require('../middleware/auth');

const router = express.Router();

// Admin middleware (simplified - in production, implement proper role-based access)
const adminAuth = async (req, res, next) => {
  try {
    // Check if user is admin (simplified check)
    const user = await User.findById(req.userId);
    if (!user || user.email !== 'admin@speculation-calculator.com') {
      return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// @route   GET /api/admin/users
// @desc    Get all users
// @access  Private (Admin)
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 20, search, membershipType } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }
    if (membershipType) {
      query['membership.type'] = membershipType;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      users,
      pagination: {
        current: parseInt(page),
        pages: Math.ceil(total / limit),
        total
      }
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users'
    });
  }
});

// @route   GET /api/admin/statistics
// @desc    Get platform statistics
// @access  Private (Admin)
router.get('/statistics', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    const premiumUsers = await User.countDocuments({ 'membership.type': 'premium', 'membership.isActive': true });
    const vipUsers = await User.countDocuments({ 'membership.type': 'vip', 'membership.isActive': true });
    const totalCalculations = await TradingCalculation.countDocuments();

    // Recent registrations (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentRegistrations = await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });

    // Calculations by type
    const calculationsByType = await TradingCalculation.aggregate([
      {
        $group: {
          _id: '$calculationType',
          count: { $sum: 1 }
        }
      }
    ]);

    // Daily calculations (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const dailyCalculations = await TradingCalculation.aggregate([
      {
        $match: { createdAt: { $gte: sevenDaysAgo } }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
      }
    ]);

    res.json({
      success: true,
      statistics: {
        users: {
          total: totalUsers,
          active: activeUsers,
          premium: premiumUsers,
          vip: vipUsers,
          recentRegistrations
        },
        calculations: {
          total: totalCalculations,
          byType: calculationsByType,
          daily: dailyCalculations
        }
      }
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch statistics'
    });
  }
});

// @route   PUT /api/admin/users/:id/membership
// @desc    Update user membership
// @access  Private (Admin)
router.put('/users/:id/membership', auth, adminAuth, [
  body('type').isIn(['free', 'premium', 'vip']),
  body('duration').isInt({ min: 1, max: 365 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, duration } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + (duration * 24 * 60 * 60 * 1000));

    user.membership = {
      type,
      startDate,
      endDate,
      isActive: type !== 'free'
    };

    await user.save();

    res.json({
      success: true,
      message: 'Membership updated successfully',
      membership: user.membership
    });
  } catch (error) {
    console.error('Update membership error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update membership'
    });
  }
});

// @route   PUT /api/admin/users/:id/status
// @desc    Update user status
// @access  Private (Admin)
router.put('/users/:id/status', auth, adminAuth, [
  body('isActive').isBoolean()
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { isActive } = req.body;
    const userId = req.params.id;

    const user = await User.findByIdAndUpdate(
      userId,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }

    res.json({
      success: true,
      message: 'User status updated successfully',
      user
    });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to update user status'
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user
// @access  Private (Admin)
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found'
      });
    }

    // Also delete user's calculations
    await TradingCalculation.deleteMany({ userId });

    res.json({
      success: true,
      message: 'User deleted successfully'
    });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete user'
    });
  }
});

module.exports = router;