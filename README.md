# 投机计算器 - 专业金融衍生品交易计算工具

## 项目简介

投机计算器是由北辰团队开发的专业金融衍生品交易计算工具，支持多语言、多主题，提供精确的交易计算功能。

### 主要功能

- 🧮 **精确计算**：支持基础交易计算，精确到小数点后6位
- 📈 **浮盈加仓**：智能浮盈加仓策略计算
- 🔄 **复利计算**：多轮复利收益计算
- 🎨 **多主题**：经典蓝、暗夜黑、金融金三种主题
- 🌍 **多语言**：支持中文、韩文、英文
- 👤 **用户系统**：邮箱注册、VIP会员体系
- 💳 **支付系统**：支持USDT和支付宝充值
- 📱 **响应式**：完美适配桌面端和移动端

## 技术栈

### 前端
- React 18 + TypeScript
- Tailwind CSS + Headless UI
- Framer Motion (动画)
- React Hook Form (表单)
- i18next (国际化)
- Decimal.js (精确计算)
- Axios (HTTP客户端)

### 后端
- Node.js + Express + TypeScript
- MongoDB + Mongoose
- JWT认证
- bcryptjs (密码加密)
- Nodemailer (邮件发送)
- Express Validator (数据验证)

### 部署
- Docker + Docker Compose
- Nginx (反向代理)
- SSL/TLS (HTTPS)

## 快速开始

### 环境要求

- Node.js 18+
- MongoDB 6.0+
- Docker & Docker Compose (可选)

### 本地开发

1. **克隆项目**
```bash
git clone <repository-url>
cd speculation-calculator
```

2. **安装依赖**
```bash
# 安装根目录依赖
npm install

# 安装所有项目依赖
npm run install-all
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp .env.example .env
cp server/.env.example server/.env

# 编辑环境变量
nano .env
nano server/.env
```

4. **启动数据库**
```bash
# 使用Docker启动MongoDB
docker run -d --name mongodb -p 27017:27017 mongo:6.0

# 或使用本地MongoDB
mongod
```

5. **启动开发服务器**
```bash
# 同时启动前后端
npm run dev

# 或分别启动
npm run server  # 后端 (端口 3001)
npm run client  # 前端 (端口 3000)
```

6. **访问应用**
- 前端：http://localhost:3000
- 后端API：http://localhost:3001
- API文档：http://localhost:3001/health

### Docker部署

1. **准备环境变量**
```bash
cp .env.example .env
# 编辑 .env 文件
```

2. **构建并启动**
```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

3. **访问应用**
- 应用：http://localhost
- API：http://localhost/api

### 生产部署

1. **准备服务器**
```bash
# 安装Docker和Docker Compose
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

2. **配置SSL证书**
```bash
# 使用Let's Encrypt
sudo apt install certbot
sudo certbot certonly --standalone -d yourdomain.com

# 复制证书到nginx目录
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem ./nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem ./nginx/ssl/
```

3. **配置环境变量**
```bash
# 生产环境配置
cp .env.example .env
nano .env

# 设置生产环境变量
REACT_APP_API_URL=https://yourdomain.com/api
FRONTEND_URL=https://yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

4. **启动生产环境**
```bash
# 构建并启动
docker-compose -f docker-compose.yml up -d

# 查看状态
docker-compose ps
```

## 项目结构

```
speculation-calculator/
├── client/                 # 前端React应用
│   ├── public/            # 静态资源
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── pages/         # 页面组件
│   │   ├── contexts/      # React Context
│   │   ├── hooks/         # 自定义Hooks
│   │   ├── utils/         # 工具函数
│   │   ├── types/         # TypeScript类型
│   │   ├── locales/       # 国际化文件
│   │   └── styles/        # 样式文件
│   ├── Dockerfile         # 前端Docker配置
│   └── package.json
├── server/                # 后端Node.js应用
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   ├── utils/         # 工具函数
│   │   ├── config/        # 配置文件
│   │   └── types/         # TypeScript类型
│   ├── Dockerfile         # 后端Docker配置
│   └── package.json
├── nginx/                 # Nginx配置
├── docker-compose.yml     # Docker Compose配置
└── README.md
```

## API文档

### 认证接口

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/verify-email` - 邮箱验证
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码

### 计算器接口

- `POST /api/calculator/calculate` - 执行计算
- `GET /api/calculator/history` - 获取计算历史

### 支付接口

- `GET /api/payment/packages` - 获取VIP套餐
- `POST /api/payment/orders` - 创建支付订单
- `POST /api/payment/confirm-usdt` - 确认USDT支付
- `GET /api/payment/orders` - 获取支付订单列表

## 计算器功能详解

### 基础计算

支持以下参数的精确计算：
- 账户总资金
- 杠杆倍数 (1-1000倍)
- 交易方向 (做多/做空)
- 开仓价格
- 风险占比 (0-100%)
- 手续费率 (0-10%)
- 止损价格 或 盈亏比 (1:X)

### 浮盈加仓

当持仓盈利达到设定阈值时，自动计算加仓策略：
- 盈利阈值百分比
- 加仓资金比例
- 新的平均成本价
- 调整后的止损止盈价

### 复利计算

模拟多轮交易的复利效果：
- 每轮使用相同风险占比
- 计算累计收益
- 展示资金增长曲线

## 会员体系

### 免费用户
- 总资金限制：10万
- 基础计算功能
- 标准精度计算

### VIP会员
- 无资金限制
- 所有高级功能
- 6位小数精度
- 专属客服支持

### VIP套餐
- 月度会员：¥29.99 (30天)
- 年度会员：¥299.99 (365天，8.3折)
- 终身会员：¥999.99 (永久)

## 支付方式

### USDT支付
- 支持TRC20网络
- 实时汇率计算
- 区块链交易验证

### 支付宝支付
- 扫码支付
- 即时到账
- 自动激活VIP

## 安全特性

- JWT令牌认证
- 密码bcrypt加密
- 请求速率限制
- CORS跨域保护
- Helmet安全头
- 输入数据验证
- SQL注入防护

## 性能优化

- 响应压缩 (Gzip)
- 静态资源缓存
- 数据库索引优化
- 连接池管理
- CDN加速支持

## 监控和日志

- 应用健康检查
- 错误日志记录
- 访问日志分析
- 性能监控
- 邮件告警

## 开发指南

### 代码规范

- ESLint + Prettier
- TypeScript严格模式
- 组件化开发
- RESTful API设计

### 测试

```bash
# 运行测试
npm test

# 测试覆盖率
npm run test:coverage
```

### 构建

```bash
# 构建前端
cd client && npm run build

# 构建后端
cd server && npm run build

# Docker构建
docker-compose build
```

## 故障排除

### 常见问题

1. **数据库连接失败**
   - 检查MongoDB是否启动
   - 验证连接字符串
   - 检查网络连接

2. **邮件发送失败**
   - 验证SMTP配置
   - 检查应用密码
   - 确认防火墙设置

3. **计算精度问题**
   - 使用Decimal.js库
   - 避免JavaScript浮点运算
   - 设置正确的精度配置

### 日志查看

```bash
# Docker日志
docker-compose logs -f [service-name]

# 应用日志
tail -f server/logs/app.log
tail -f nginx/logs/access.log
```

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 联系我们

- 团队：北辰团队
- 邮箱：contact@beichen.team
- 网站：https://calculator.beichen.team

## 更新日志

### v1.0.0 (2024-01-01)
- 🎉 初始版本发布
- ✨ 基础计算功能
- 🎨 多主题支持
- 🌍 多语言支持
- 👤 用户系统
- 💳 支付系统
- 📱 移动端适配

---

**投机计算器** - 专业的金融衍生品交易计算工具
由北辰团队精心打造 ❤️