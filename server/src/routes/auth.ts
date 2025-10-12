import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import db, { generateId } from '../database';
import { authMiddleware, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Register
router.post('/register', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: '密码至少6位' });
    }

    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
    if (existingUser) {
      return res.status(400).json({ message: '该邮箱已被注册' });
    }

    // Hash password
    const hashedPassword = bcrypt.hashSync(password, 10);
    const userId = generateId();

    // Insert user
    db.prepare(`
      INSERT INTO users (id, email, password)
      VALUES (?, ?, ?)
    `).run(userId, email, hashedPassword);

    // Generate token
    const token = jwt.sign({ userId }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d'
    });

    const user = {
      id: userId,
      email,
      isPremium: false,
      isAdmin: false
    };

    res.json({ token, user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '注册失败' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: '邮箱和密码不能为空' });
    }

    // Find user
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email) as any;
    
    if (!user) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // Check password
    const isPasswordValid = bcrypt.compareSync(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ message: '邮箱或密码错误' });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || 'secret', {
      expiresIn: '7d'
    });

    const userData = {
      id: user.id,
      email: user.email,
      isPremium: user.isPremium === 1,
      premiumExpireDate: user.premiumExpireDate,
      isAdmin: user.isAdmin === 1
    };

    res.json({ token, user: userData });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '登录失败' });
  }
});

// Get current user
router.get('/me', authMiddleware, (req: AuthRequest, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, isPremium, premiumExpireDate, isAdmin
      FROM users WHERE id = ?
    `).get(req.userId) as any;

    if (!user) {
      return res.status(404).json({ message: '用户不存在' });
    }

    res.json({
      id: user.id,
      email: user.email,
      isPremium: user.isPremium === 1,
      premiumExpireDate: user.premiumExpireDate,
      isAdmin: user.isAdmin === 1
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: '获取用户信息失败' });
  }
});

export default router;
