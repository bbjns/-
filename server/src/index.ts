import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/config';
import { connectDatabase } from './config/database';
import authRoutes from './routes/auth';
import calculatorRoutes from './routes/calculator';
import paymentRoutes from './routes/payment';
import adminRoutes from './routes/admin';
import { ApiResponse } from './types';

const app = express();

// 连接数据库
connectDatabase();

// 安全中间件
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:"],
      scriptSrc: ["'self'"],
      connectSrc: ["'self'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS配置
app.use(cors({
  origin: [
    config.FRONTEND_URL,
    'http://localhost:3000',
    'http://127.0.0.1:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-session-id']
}));

// 压缩响应
app.use(compression());

// 请求日志
if (config.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// 解析请求体
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: config.NODE_ENV === 'development' ? 1000 : 100, // 开发环境放宽限制
  message: {
    success: false,
    error: '请求过于频繁，请稍后再试'
  } as ApiResponse,
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// 健康检查
app.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'OK',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: config.NODE_ENV,
      version: process.env.npm_package_version || '1.0.0'
    },
    message: '服务运行正常'
  } as ApiResponse);
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/calculator', calculatorRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: `路由 ${req.originalUrl} 不存在`
  } as ApiResponse);
});

// 全局错误处理
app.use((error: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('服务器错误:', error);
  
  // Mongoose验证错误
  if (error.name === 'ValidationError') {
    const errors = Object.values(error.errors).map((err: any) => err.message);
    return res.status(400).json({
      success: false,
      error: '数据验证失败',
      data: errors
    } as ApiResponse);
  }
  
  // Mongoose重复键错误
  if (error.code === 11000) {
    const field = Object.keys(error.keyValue)[0];
    return res.status(400).json({
      success: false,
      error: `${field} 已存在`
    } as ApiResponse);
  }
  
  // JWT错误
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: '无效的访问令牌'
    } as ApiResponse);
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: '访问令牌已过期'
    } as ApiResponse);
  }
  
  // 默认错误
  res.status(error.statusCode || 500).json({
    success: false,
    error: config.NODE_ENV === 'development' 
      ? error.message 
      : '服务器内部错误'
  } as ApiResponse);
});

// 启动服务器
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`
🚀 投机计算器服务器启动成功！
📍 端口: ${PORT}
🌍 环境: ${config.NODE_ENV}
🔗 API地址: http://localhost:${PORT}/api
📊 健康检查: http://localhost:${PORT}/health
⏰ 启动时间: ${new Date().toLocaleString()}
  `);
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在优雅关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在优雅关闭服务器...');
  process.exit(0);
});

export default app;