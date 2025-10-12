const express = require('express');
const { body, validationResult } = require('express-validator');
const { auth } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

// 更新用户资料
router.put('/profile', auth, [
  body('username').optional().isLength({ min: 2 }).withMessage('用户名至少2位'),
  body('avatar').optional().isURL().withMessage('头像必须是有效的URL')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { username, avatar } = req.body;
    const updates = {};

    if (username) updates.username = username;
    if (avatar) updates.avatar = avatar;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: '资料更新成功',
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        membership: user.membership,
        preferences: user.preferences
      }
    });
  } catch (error) {
    console.error('更新资料错误:', error);
    res.status(500).json({ 
      message: '更新失败',
      error: error.message 
    });
  }
});

// 更新用户偏好设置
router.put('/preferences', auth, [
  body('language').optional().isIn(['zh', 'en', 'ko']).withMessage('语言必须是zh、en或ko'),
  body('theme').optional().isIn(['financial', 'dark', 'light']).withMessage('主题必须是financial、dark或light'),
  body('currency').optional().isString().withMessage('货币必须是字符串')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { language, theme, currency } = req.body;
    const updates = {};

    if (language) updates['preferences.language'] = language;
    if (theme) updates['preferences.theme'] = theme;
    if (currency) updates['preferences.currency'] = currency;

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('-password');

    res.json({
      success: true,
      message: '偏好设置更新成功',
      preferences: user.preferences
    });
  } catch (error) {
    console.error('更新偏好设置错误:', error);
    res.status(500).json({ 
      message: '更新失败',
      error: error.message 
    });
  }
});

// 修改密码
router.put('/password', auth, [
  body('currentPassword').exists().withMessage('当前密码不能为空'),
  body('newPassword').isLength({ min: 6 }).withMessage('新密码至少6位')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(currentPassword);

    if (!isMatch) {
      return res.status(400).json({ message: '当前密码错误' });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码错误:', error);
    res.status(500).json({ 
      message: '修改失败',
      error: error.message 
    });
  }
});

// 获取用户统计信息
router.get('/stats', auth, async (req, res) => {
  try {
    const TradingRecord = require('../models/TradingRecord');
    
    const totalCalculations = await TradingRecord.countDocuments({ userId: req.user.id });
    const basicCalculations = await TradingRecord.countDocuments({ 
      userId: req.user.id, 
      calculationType: 'basic' 
    });
    const pyramidCalculations = await TradingRecord.countDocuments({ 
      userId: req.user.id, 
      calculationType: 'pyramid' 
    });
    const compoundCalculations = await TradingRecord.countDocuments({ 
      userId: req.user.id, 
      calculationType: 'compound' 
    });

    // 最近7天的计算次数
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentCalculations = await TradingRecord.countDocuments({
      userId: req.user.id,
      createdAt: { $gte: sevenDaysAgo }
    });

    res.json({
      success: true,
      data: {
        totalCalculations,
        basicCalculations,
        pyramidCalculations,
        compoundCalculations,
        recentCalculations,
        membership: req.user.membership,
        joinDate: req.user.createdAt,
        lastLogin: req.user.lastLogin
      }
    });
  } catch (error) {
    console.error('获取统计信息错误:', error);
    res.status(500).json({ 
      message: '获取统计信息失败',
      error: error.message 
    });
  }
});

// 删除账户
router.delete('/account', auth, [
  body('password').exists().withMessage('需要密码确认')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { password } = req.body;

    const user = await User.findById(req.user.id);
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(400).json({ message: '密码错误' });
    }

    // 删除用户相关数据
    const TradingRecord = require('../models/TradingRecord');
    await TradingRecord.deleteMany({ userId: req.user.id });
    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: '账户删除成功'
    });
  } catch (error) {
    console.error('删除账户错误:', error);
    res.status(500).json({ 
      message: '删除失败',
      error: error.message 
    });
  }
});

module.exports = router;