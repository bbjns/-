import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User';
import { config } from '../config/config';
import { ApiResponse, IJWTPayload } from '../types';
import { sendEmail } from '../utils/email';

// 生成JWT令牌
const generateToken = (payload: IJWTPayload): string => {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN
  });
};

// 用户注册
export const register = async (req: Request, res: Response) => {
  try {
    const { email, username, password } = req.body;

    // 检查用户是否已存在
    const existingUser = await User.findOne({
      $or: [{ email }, { username }]
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: existingUser.email === email ? '邮箱已被注册' : '用户名已被使用'
      } as ApiResponse);
    }

    // 创建新用户
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    const user = new User({
      email,
      username,
      password,
      emailVerificationToken
    });

    await user.save();

    // 发送验证邮件
    try {
      await sendEmail({
        to: email,
        subject: '投机计算器 - 邮箱验证',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">欢迎注册投机计算器</h2>
            <p>感谢您注册投机计算器！请点击下面的链接验证您的邮箱：</p>
            <a href="${config.FRONTEND_URL}/verify-email?token=${emailVerificationToken}" 
               style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              验证邮箱
            </a>
            <p style="margin-top: 20px; color: #666;">如果您没有注册投机计算器，请忽略此邮件。</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">北辰团队专注量化·风险管理</p>
          </div>
        `
      });
    } catch (emailError) {
      console.error('发送验证邮件失败:', emailError);
    }

    // 生成JWT令牌
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      isVip: user.isVip
    });

    res.status(201).json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          isVip: user.isVip,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      },
      message: '注册成功！请查收邮箱验证邮件。'
    } as ApiResponse);

  } catch (error: any) {
    console.error('注册错误:', error);
    res.status(500).json({
      success: false,
      error: '注册失败，请稍后重试'
    } as ApiResponse);
  }
};

// 用户登录
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 查找用户（包含密码字段）
    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: '邮箱或密码错误'
      } as ApiResponse);
    }

    // 更新VIP状态
    if (user.isVip && user.vipExpiry && user.vipExpiry < new Date()) {
      user.isVip = false;
      user.vipExpiry = undefined;
      await user.save();
    }

    // 生成JWT令牌
    const token = generateToken({
      userId: user._id.toString(),
      email: user.email,
      isVip: user.isVip
    });

    res.json({
      success: true,
      data: {
        token,
        user: {
          id: user._id,
          email: user.email,
          username: user.username,
          isVip: user.isVip,
          vipExpiry: user.vipExpiry,
          emailVerified: user.emailVerified,
          createdAt: user.createdAt
        }
      },
      message: '登录成功'
    } as ApiResponse);

  } catch (error: any) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      error: '登录失败，请稍后重试'
    } as ApiResponse);
  }
};

// 获取当前用户信息
export const getMe = async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    
    res.json({
      success: true,
      data: {
        id: user._id,
        email: user.email,
        username: user.username,
        isVip: user.isVip,
        vipExpiry: user.vipExpiry,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    } as ApiResponse);

  } catch (error: any) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      error: '获取用户信息失败'
    } as ApiResponse);
  }
};

// 邮箱验证
export const verifyEmail = async (req: Request, res: Response) => {
  try {
    const { token } = req.body;

    const user = await User.findOne({ 
      emailVerificationToken: token 
    }).select('+emailVerificationToken');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: '验证令牌无效或已过期'
      } as ApiResponse);
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    await user.save();

    res.json({
      success: true,
      message: '邮箱验证成功'
    } as ApiResponse);

  } catch (error: any) {
    console.error('邮箱验证错误:', error);
    res.status(500).json({
      success: false,
      error: '邮箱验证失败'
    } as ApiResponse);
  }
};

// 发送密码重置邮件
export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: '用户不存在'
      } as ApiResponse);
    }

    // 生成重置令牌
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = resetToken;
    user.passwordResetExpires = new Date(Date.now() + 10 * 60 * 1000); // 10分钟后过期
    await user.save();

    // 发送重置邮件
    try {
      await sendEmail({
        to: email,
        subject: '投机计算器 - 密码重置',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0ea5e9;">密码重置请求</h2>
            <p>您请求重置投机计算器账户的密码。请点击下面的链接重置密码：</p>
            <a href="${config.FRONTEND_URL}/reset-password?token=${resetToken}" 
               style="background: #0ea5e9; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">
              重置密码
            </a>
            <p style="margin-top: 20px; color: #666;">此链接将在10分钟后失效。如果您没有请求重置密码，请忽略此邮件。</p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #eee;">
            <p style="color: #999; font-size: 12px;">北辰团队专注量化·风险管理</p>
          </div>
        `
      });

      res.json({
        success: true,
        message: '密码重置邮件已发送，请查收邮箱'
      } as ApiResponse);

    } catch (emailError) {
      console.error('发送重置邮件失败:', emailError);
      res.status(500).json({
        success: false,
        error: '发送重置邮件失败，请稍后重试'
      } as ApiResponse);
    }

  } catch (error: any) {
    console.error('密码重置错误:', error);
    res.status(500).json({
      success: false,
      error: '密码重置失败，请稍后重试'
    } as ApiResponse);
  }
};

// 重置密码
export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body;

    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() }
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        error: '重置令牌无效或已过期'
      } as ApiResponse);
    }

    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    res.json({
      success: true,
      message: '密码重置成功，请使用新密码登录'
    } as ApiResponse);

  } catch (error: any) {
    console.error('重置密码错误:', error);
    res.status(500).json({
      success: false,
      error: '重置密码失败，请稍后重试'
    } as ApiResponse);
  }
};