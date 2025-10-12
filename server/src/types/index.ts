import { Document } from 'mongoose';
import Decimal from 'decimal.js';

// 用户接口
export interface IUser extends Document {
  email: string;
  username: string;
  password: string;
  isVip: boolean;
  vipExpiry?: Date;
  emailVerified: boolean;
  emailVerificationToken?: string;
  passwordResetToken?: string;
  passwordResetExpires?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// 支付订单接口
export interface IPaymentOrder extends Document {
  userId: string;
  amount: Decimal;
  method: 'usdt' | 'alipay';
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  transactionId?: string;
  paymentData?: any;
  createdAt: Date;
  updatedAt: Date;
}

// 计算历史接口
export interface ICalculationHistory extends Document {
  userId?: string;
  sessionId: string;
  input: {
    totalFunds: Decimal;
    leverage: Decimal;
    direction: 'long' | 'short';
    entryPrice: Decimal;
    riskRatio: Decimal;
    feeRate: Decimal;
    stopLoss?: Decimal;
    profitLossRatio?: Decimal;
    profitAddEnabled: boolean;
    profitThreshold?: Decimal;
    addPositionRatio?: Decimal;
  };
  result: any;
  createdAt: Date;
}

// JWT载荷接口
export interface IJWTPayload {
  userId: string;
  email: string;
  isVip: boolean;
}

// API响应接口
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// 请求接口扩展
declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

// 环境变量接口
export interface IConfig {
  PORT: number;
  NODE_ENV: string;
  MONGODB_URI: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  EMAIL_HOST: string;
  EMAIL_PORT: number;
  EMAIL_USER: string;
  EMAIL_PASS: string;
  FRONTEND_URL: string;
  USDT_WALLET_ADDRESS: string;
  ALIPAY_APP_ID: string;
  ALIPAY_PRIVATE_KEY: string;
  ALIPAY_PUBLIC_KEY: string;
}