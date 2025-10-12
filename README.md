# 投机计算器 (Speculation Calculator)

一个专业的投机交易计算器，支持杠杆交易、浮盈加仓、复利计算等功能，为您的交易决策提供精确的数据支持。

## 功能特性

### 🧮 核心计算功能
- **基础计算**: 精确计算止损止盈、仓位大小、保证金需求等基础交易参数
- **浮盈加仓**: 智能浮盈加仓计算，优化平均成本，最大化收益潜力
- **复利计算**: 复利计算功能，模拟多轮交易后的资金增长情况
- **精确计算**: 所有计算结果精确到小数点后6位

### 🎨 用户体验
- **多语言支持**: 中文、韩文、英文
- **主题切换**: 经典、现代、暗黑三种金融风格主题
- **响应式设计**: 完美支持桌面端和移动端
- **实时计算**: 输入即计算，实时显示结果

### 👥 用户系统
- **用户注册**: 邮箱注册，支持邮箱验证
- **会员系统**: 免费版、高级版、VIP版
- **支付集成**: 支持信用卡、USDT、支付宝支付
- **历史记录**: 保存和查看计算历史

### 🔧 管理功能
- **后台管理**: 完整的用户和数据分析后台
- **数据统计**: 用户增长、计算统计等数据分析
- **用户管理**: 用户状态管理、会员管理

## 技术栈

### 后端
- **Node.js** + **Express**: 服务器框架
- **MongoDB**: 数据库
- **JWT**: 身份认证
- **Nodemailer**: 邮件服务
- **Stripe**: 支付处理
- **bcryptjs**: 密码加密

### 前端
- **React** + **TypeScript**: 前端框架
- **Vite**: 构建工具
- **Tailwind CSS**: 样式框架
- **React Router**: 路由管理
- **Zustand**: 状态管理
- **React Hook Form**: 表单处理
- **React i18next**: 国际化

### 部署
- **Docker**: 容器化部署
- **Nginx**: 反向代理
- **MongoDB**: 数据库服务

## 快速开始

### 环境要求
- Node.js 18+
- MongoDB 7.0+
- Docker (可选)

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

# 安装后端依赖
cd server
npm install

# 安装前端依赖
cd ../client
npm install
```

3. **配置环境变量**
```bash
# 复制环境变量模板
cp server/.env.example server/.env

# 编辑环境变量
nano server/.env
```

4. **启动MongoDB**
```bash
# 使用Docker启动MongoDB
docker run -d --name mongodb -p 27017:27017 -e MONGO_INITDB_ROOT_USERNAME=admin -e MONGO_INITDB_ROOT_PASSWORD=password123 mongo:7.0

# 或使用本地MongoDB
mongod
```

5. **启动开发服务器**
```bash
# 在根目录启动所有服务
npm run dev

# 或分别启动
# 后端 (端口 5000)
cd server && npm run dev

# 前端 (端口 3000)
cd client && npm run dev
```

6. **访问应用**
- 前端: http://localhost:3000
- 后端API: http://localhost:5000
- 管理后台: http://localhost:3000/admin (admin@speculation-calculator.com / admin123)

### Docker部署

1. **使用Docker Compose**
```bash
# 启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

2. **访问应用**
- 前端: http://localhost
- 后端API: http://localhost/api
- 管理后台: http://localhost/admin

## 配置说明

### 环境变量

#### 后端配置 (server/.env)
```env
# 服务器配置
PORT=5000
NODE_ENV=production

# 数据库配置
MONGODB_URI=mongodb://admin:password123@localhost:27017/speculation-calculator?authSource=admin

# JWT配置
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# 邮件配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# 支付配置
STRIPE_SECRET_KEY=sk_test_your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=whsec_your_webhook_secret

# USDT配置
USDT_WALLET_ADDRESS=your_usdt_wallet_address
USDT_PRIVATE_KEY=your_usdt_private_key

# 前端URL
CLIENT_URL=http://localhost:3000
```

### 计算器配置

#### 基础计算参数
- **账户总资金**: 用于计算的基础资金
- **杠杆**: 1-1000倍杠杆
- **做多/做空**: 交易方向
- **开仓价**: 入场价格
- **风险占比**: 风险资金占总资金的比例
- **手续费率**: 交易手续费率

#### 止损设置
- **止损价模式**: 直接设置止损价格
- **盈亏比模式**: 设置盈亏比例，自动计算止损价

#### 浮盈加仓设置
- **加仓触发价**: 盈利多少百分比时触发加仓
- **加仓百分比**: 加仓资金占总资金的百分比

#### 复利计算设置
- **复利轮数**: 计算多少轮复利
- **每轮盈利**: 每轮交易的盈利百分比

## API文档

### 认证接口
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息
- `POST /api/auth/verify-email` - 验证邮箱
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码

### 计算器接口
- `POST /api/calculator/calculate` - 执行计算
- `GET /api/calculator/history` - 获取计算历史
- `GET /api/calculator/history/:id` - 获取特定计算详情
- `DELETE /api/calculator/history/:id` - 删除计算记录
- `GET /api/calculator/statistics` - 获取计算统计

### 用户接口
- `PUT /api/users/profile` - 更新用户资料
- `PUT /api/users/password` - 修改密码
- `GET /api/users/membership` - 获取会员信息
- `DELETE /api/users/account` - 删除账户

### 支付接口
- `POST /api/payments/create-intent` - 创建支付意图
- `POST /api/payments/confirm` - 确认支付
- `GET /api/payments/plans` - 获取会员方案
- `POST /api/payments/webhook` - Stripe webhook

### 管理接口
- `GET /api/admin/users` - 获取用户列表
- `GET /api/admin/statistics` - 获取平台统计
- `PUT /api/admin/users/:id/membership` - 更新用户会员
- `PUT /api/admin/users/:id/status` - 更新用户状态
- `DELETE /api/admin/users/:id` - 删除用户

## 计算逻辑

### 基础计算
1. 风险资金 = 总资金 × 风险占比
2. 止损价计算:
   - 价格模式: 直接使用设置的止损价
   - 比例模式: 根据盈亏比计算止损价
3. 止盈价 = 止损价 + (止损价 - 开仓价) × 盈亏比
4. 仓位大小 = 风险资金 ÷ |开仓价 - 止损价|
5. 名义仓位价值 = 仓位大小 × 开仓价
6. 所需保证金 = 名义仓位价值 ÷ 杠杆
7. 手续费 = 名义仓位价值 × 手续费率 × 2
8. 平仓盈亏 = 仓位大小 × (止盈价 - 开仓价) - 手续费

### 浮盈加仓计算
1. 加仓触发价 = 开仓价 × (1 ± 触发百分比)
2. 加仓资金 = 总资金 × 加仓百分比
3. 加仓数量 = 加仓资金 ÷ 触发价
4. 新平均成本 = (原仓位价值 + 加仓资金) ÷ (原仓位数量 + 加仓数量)
5. 重新计算止损止盈价
6. 新风险占比 = 新价格差 ÷ 新平均成本 × 100%

### 复利计算
1. 每轮基础计算
2. 新总资金 = 当前资金 + 盈利
3. 新仓位大小 = 新总资金 × 风险占比 ÷ 价格差
4. 重复指定轮数

## 部署指南

### 生产环境部署

1. **服务器要求**
- CPU: 2核心以上
- 内存: 4GB以上
- 存储: 20GB以上
- 操作系统: Ubuntu 20.04+ / CentOS 8+

2. **域名和SSL**
- 配置域名解析
- 申请SSL证书
- 更新nginx配置

3. **数据库备份**
```bash
# 备份MongoDB
mongodump --uri="mongodb://admin:password123@localhost:27017/speculation-calculator?authSource=admin" --out=/backup/

# 恢复MongoDB
mongorestore --uri="mongodb://admin:password123@localhost:27017/speculation-calculator?authSource=admin" /backup/speculation-calculator/
```

4. **监控和日志**
- 配置日志轮转
- 设置监控告警
- 定期备份数据

### 性能优化

1. **数据库优化**
- 创建合适的索引
- 定期清理历史数据
- 使用连接池

2. **缓存策略**
- Redis缓存热点数据
- CDN加速静态资源
- 浏览器缓存优化

3. **负载均衡**
- 多实例部署
- Nginx负载均衡
- 数据库读写分离

## 安全考虑

1. **数据安全**
- 密码加密存储
- JWT令牌安全
- 敏感数据加密

2. **网络安全**
- HTTPS强制
- 安全头设置
- 请求频率限制

3. **业务安全**
- 输入验证
- SQL注入防护
- XSS防护

## 贡献指南

1. Fork项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

- 项目主页: [GitHub Repository]
- 问题反馈: [GitHub Issues]
- 邮箱: admin@speculation-calculator.com

## 更新日志

### v1.0.0 (2024-01-15)
- 初始版本发布
- 基础计算功能
- 用户系统
- 会员系统
- 管理后台
- 多语言支持
- 主题切换
- 移动端适配

---

**北辰团队专注量化风险管理** - 为您的交易决策提供专业的数据支持