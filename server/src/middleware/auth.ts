import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { config } from '../config/config';
import { IJWTPayload, ApiResponse } from '../types';

export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        success: false,
        error: '访问令牌缺失，请先登录'
      } as ApiResponse);
    }

    const decoded = jwt.verify(token, config.JWT_SECRET) as IJWTPayload;
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        error: '用户不存在，请重新登录'
      } as ApiResponse);
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: '访问令牌无效，请重新登录'
    } as ApiResponse);
  }
};

export const requireVip = (req: Request, res: Response, next: NextFunction) => {
  if (!req.user?.isVip) {
    return res.status(403).json({
      success: false,
      error: '此功能需要VIP会员权限'
    } as ApiResponse);
  }
  next();
};

export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (token) {
      const decoded = jwt.verify(token, config.JWT_SECRET) as IJWTPayload;
      const user = await User.findById(decoded.userId);
      if (user) {
        req.user = user;
      }
    }
    
    next();
  } catch (error) {
    // 忽略认证错误，继续处理请求
    next();
  }
};