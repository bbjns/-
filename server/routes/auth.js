const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const User = require('../models/User');

const router = express.Router();

// 邮件配置
const transporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 生成JWT令牌
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  });
};

// 注册
router.post('/register', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位'),
  body('username').isLength({ min: 2 }).withMessage('用户名至少2位')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password, username } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: '用户已存在' });
    }

    // 生成邮箱验证令牌
    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24小时

    // 创建用户
    const user = new User({
      email,
      password,
      username,
      emailVerificationToken: emailToken,
      emailVerificationExpires: emailTokenExpires
    });

    await user.save();

    // 发送验证邮件
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '投机计算器 - 邮箱验证',
      html: `
        <h2>欢迎注册投机计算器</h2>
        <p>请点击以下链接验证您的邮箱：</p>
        <a href="${verificationUrl}">验证邮箱</a>
        <p>链接24小时内有效</p>
      `
    });

    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      message: '注册成功，请查收验证邮件',
      token,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        isEmailVerified: user.isEmailVerified
      }
    });
  } catch (error) {
    console.error('注册错误:', error);
    res.status(500).json({ 
      message: '注册失败',
      error: error.message 
    });
  }
});

// 登录
router.post('/login', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').exists().withMessage('请输入密码')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, password } = req.body;

    // 查找用户
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // 验证密码
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // 更新登录信息
    user.lastLogin = new Date();
    user.loginCount += 1;
    await user.save();

    const token = generateToken(user._id);

    res.json({
      success: true,
      message: '登录成功',
      token,
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
    console.error('登录错误:', error);
    res.status(500).json({ 
      message: '登录失败',
      error: error.message 
    });
  }
});

// 验证邮箱
router.post('/verify-email', async (req, res) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: '验证链接无效或已过期' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: '邮箱验证成功'
    });
  } catch (error) {
    console.error('邮箱验证错误:', error);
    res.status(500).json({ 
      message: '邮箱验证失败',
      error: error.message 
    });
  }
});

// 重新发送验证邮件
router.post('/resend-verification', async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    if (user.isEmailVerified) {
      return res.status(400).json({ message: '邮箱已验证' });
    }

    // 生成新的验证令牌
    const emailToken = crypto.randomBytes(32).toString('hex');
    const emailTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    user.emailVerificationToken = emailToken;
    user.emailVerificationExpires = emailTokenExpires;
    await user.save();

    // 发送验证邮件
    const verificationUrl = `${process.env.CLIENT_URL}/verify-email?token=${emailToken}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '投机计算器 - 邮箱验证',
      html: `
        <h2>邮箱验证</h2>
        <p>请点击以下链接验证您的邮箱：</p>
        <a href="${verificationUrl}">验证邮箱</a>
        <p>链接24小时内有效</p>
      `
    });

    res.json({
      success: true,
      message: '验证邮件已重新发送'
    });
  } catch (error) {
    console.error('重新发送验证邮件错误:', error);
    res.status(500).json({ 
      message: '发送失败',
      error: error.message 
    });
  }
});

// 忘记密码
router.post('/forgot-password', [
  body('email').isEmail().withMessage('请输入有效的邮箱地址')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: '用户不存在' });
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1小时

    user.passwordResetToken = resetToken;
    user.passwordResetExpires = resetExpires;
    await user.save();

    // 发送重置邮件
    const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: email,
      subject: '投机计算器 - 密码重置',
      html: `
        <h2>密码重置</h2>
        <p>请点击以下链接重置您的密码：</p>
        <a href="${resetUrl}">重置密码</a>
        <p>链接1小时内有效</p>
      `
    });

    res.json({
      success: true,
      message: '重置邮件已发送'
    });
  } catch (error) {
    console.error('忘记密码错误:', error);
    res.status(500).json({ 
      message: '发送失败',
      error: error.message 
    });
  }
});

// 重置密码
router.post('/reset-password', [
  body('token').exists().withMessage('重置令牌不能为空'),
  body('password').isLength({ min: 6 }).withMessage('密码至少6位')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: '重置链接无效或已过期' });
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: '密码重置成功'
    });
  } catch (error) {
    console.error('重置密码错误:', error);
    res.status(500).json({ 
      message: '重置失败',
      error: error.message 
    });
  }
});

// 获取当前用户信息
router.get('/me', async (req, res) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: '未登录' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: '用户不存在' });
    }

    res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        username: user.username,
        avatar: user.avatar,
        isEmailVerified: user.isEmailVerified,
        membership: user.membership,
        preferences: user.preferences,
        lastLogin: user.lastLogin,
        loginCount: user.loginCount
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(401).json({ message: '令牌无效' });
  }
});

module.exports = router;