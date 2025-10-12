import { Router } from 'express';
import {
  register,
  login,
  getMe,
  verifyEmail,
  forgotPassword,
  resetPassword
} from '../controllers/authController';
import {
  validateRegister,
  validateLogin,
  validatePasswordReset,
  validateNewPassword
} from '../middleware/validation';
import { authenticate } from '../middleware/auth';

const router = Router();

// 用户注册
router.post('/register', validateRegister, register);

// 用户登录
router.post('/login', validateLogin, login);

// 获取当前用户信息
router.get('/me', authenticate, getMe);

// 邮箱验证
router.post('/verify-email', verifyEmail);

// 忘记密码
router.post('/forgot-password', validatePasswordReset, forgotPassword);

// 重置密码
router.post('/reset-password', validateNewPassword, resetPassword);

export default router;