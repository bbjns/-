const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');
const TradingRecord = require('../models/TradingRecord');

const router = express.Router();

// 管理员权限检查
const requireAdmin = (req, res, next) => {
  if (req.user.email !== 'admin@speculation-calculator.com') {
    return res.status(403).json({ message: '需要管理员权限' });
  }
  next();
};

// 获取用户列表
router.get('/users', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '', membership = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (search) {
      query.$or = [
        { email: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } }
      ];
    }

    if (membership) {
      query['membership.type'] = membership;
    }

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await User.countDocuments(query);

    res.json({
      success: true,
      data: {
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({ 
      message: '获取用户列表失败',
      error: error.message 
    });
  }
});

// 获取用户详情
router.get('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    // 获取用户计算记录统计
    const calculationStats = await TradingRecord.aggregate([
      { $match: { userId: user._id } },
      {
        $group: {
          _id: '$calculationType',
          count: { $sum: 1 },
          lastUsed: { $max: '$createdAt' }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        user,
        calculationStats
      }
    });
  } catch (error) {
    console.error('获取用户详情错误:', error);
    res.status(500).json({ 
      message: '获取用户详情失败',
      error: error.message 
    });
  }
});

// 更新用户会员状态
router.put('/users/:id/membership', auth, requireAdmin, [
  body('type').isIn(['free', 'premium', 'vip']).withMessage('会员类型无效'),
  body('duration').optional().isInt({ min: 1 }).withMessage('时长必须是正整数')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type, duration = 30 } = req.body;
    const userId = req.params.id;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    const startDate = new Date();
    const endDate = new Date(startDate.getTime() + duration * 24 * 60 * 60 * 1000);

    user.membership = {
      type,
      startDate,
      endDate,
      isActive: type !== 'free'
    };

    await user.save();

    res.json({
      success: true,
      message: '会员状态更新成功',
      data: {
        membership: user.membership
      }
    });
  } catch (error) {
    console.error('更新会员状态错误:', error);
    res.status(500).json({ 
      message: '更新会员状态失败',
      error: error.message 
    });
  }
});

// 获取系统统计
router.get('/stats', auth, requireAdmin, async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      'membership.isActive': true 
    });
    const premiumUsers = await User.countDocuments({ 
      'membership.type': 'premium',
      'membership.isActive': true
    });
    const vipUsers = await User.countDocuments({ 
      'membership.type': 'vip',
      'membership.isActive': true
    });

    const totalCalculations = await TradingRecord.countDocuments();
    const basicCalculations = await TradingRecord.countDocuments({ 
      calculationType: 'basic' 
    });
    const pyramidCalculations = await TradingRecord.countDocuments({ 
      calculationType: 'pyramid' 
    });
    const compoundCalculations = await TradingRecord.countDocuments({ 
      calculationType: 'compound' 
    });

    // 最近30天的用户注册数
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newUsers = await User.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    // 最近30天的计算次数
    const recentCalculations = await TradingRecord.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });

    res.json({
      success: true,
      data: {
        users: {
          total: totalUsers,
          active: activeUsers,
          premium: premiumUsers,
          vip: vipUsers,
          new: newUsers
        },
        calculations: {
          total: totalCalculations,
          basic: basicCalculations,
          pyramid: pyramidCalculations,
          compound: compoundCalculations,
          recent: recentCalculations
        }
      }
    });
  } catch (error) {
    console.error('获取系统统计错误:', error);
    res.status(500).json({ 
      message: '获取系统统计失败',
      error: error.message 
    });
  }
});

// 获取计算记录列表
router.get('/calculations', auth, requireAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 20, type = '', userId = '' } = req.query;
    const skip = (page - 1) * limit;

    let query = {};
    
    if (type) {
      query.calculationType = type;
    }

    if (userId) {
      query.userId = userId;
    }

    const records = await TradingRecord.find(query)
      .populate('userId', 'username email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await TradingRecord.countDocuments(query);

    res.json({
      success: true,
      data: {
        records,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取计算记录错误:', error);
    res.status(500).json({ 
      message: '获取计算记录失败',
      error: error.message 
    });
  }
});

// 删除用户
router.delete('/users/:id', auth, requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // 删除用户相关数据
    await TradingRecord.deleteMany({ userId });
    await User.findByIdAndDelete(userId);

    res.json({
      success: true,
      message: '用户删除成功'
    });
  } catch (error) {
    console.error('删除用户错误:', error);
    res.status(500).json({ 
      message: '删除用户失败',
      error: error.message 
    });
  }
});

// 导出数据
router.get('/export/:type', auth, requireAdmin, async (req, res) => {
  try {
    const { type } = req.params;
    const { startDate, endDate } = req.query;

    let query = {};
    if (startDate && endDate) {
      query.createdAt = {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      };
    }

    let data = [];
    if (type === 'users') {
      data = await User.find(query).select('-password');
    } else if (type === 'calculations') {
      data = await TradingRecord.find(query).populate('userId', 'username email');
    }

    res.json({
      success: true,
      data,
      count: data.length
    });
  } catch (error) {
    console.error('导出数据错误:', error);
    res.status(500).json({ 
      message: '导出数据失败',
      error: error.message 
    });
  }
});

module.exports = router;