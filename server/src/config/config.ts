import dotenv from 'dotenv';
import { IConfig } from '../types';

dotenv.config();

export const config: IConfig = {
  PORT: parseInt(process.env.PORT || '3001', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/speculation-calculator',
  JWT_SECRET: process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production',
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: process.env.EMAIL_USER || '',
  EMAIL_PASS: process.env.EMAIL_PASS || '',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
  USDT_WALLET_ADDRESS: process.env.USDT_WALLET_ADDRESS || '',
  ALIPAY_APP_ID: process.env.ALIPAY_APP_ID || '',
  ALIPAY_PRIVATE_KEY: process.env.ALIPAY_PRIVATE_KEY || '',
  ALIPAY_PUBLIC_KEY: process.env.ALIPAY_PUBLIC_KEY || '',
};