import mongoose from 'mongoose';
import { config } from './config';

export const connectDatabase = async (): Promise<void> => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI);
    console.log(`MongoDB连接成功: ${conn.connection.host}`);
    
    // 监听连接事件
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB连接错误:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB连接断开');
    });
    
    // 优雅关闭
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB连接已关闭');
      process.exit(0);
    });
    
  } catch (error) {
    console.error('数据库连接失败:', error);
    process.exit(1);
  }
};