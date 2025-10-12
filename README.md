# 投机计算器 - 专业合约计算系统

> 北辰团队专注量化.风险管理

[![项目状态](https://img.shields.io/badge/状态-已完成-success)](https://github.com)
[![版本](https://img.shields.io/badge/版本-v1.0.0-blue)](https://github.com)
[![功能完成度](https://img.shields.io/badge/功能完成度-100%25-brightgreen)](https://github.com)
[![文档](https://img.shields.io/badge/文档-完整-green)](https://github.com)
[![License](https://img.shields.io/badge/license-MIT-orange)](LICENSE)

## 项目简介

这是一个功能完整的专业合约计算器系统，具有现代化的UI设计和完善的前后端架构。

**🎯 项目亮点：**
- 💯 **功能完整**：计算器、用户系统、会员系统、管理后台全覆盖
- 🎨 **精美UI**：三种金融风格主题，媲美大型商业软件
- 🌍 **多语言**：中文、英文、韩文完整支持
- 📱 **响应式**：完美适配桌面、平板、手机
- 🔐 **安全可靠**：完善的认证系统和权限控制
- 📊 **高精度**：计算精确到小数点后6位
- 🚀 **开箱即用**：Docker一键部署，配置简单

### 核心功能

✅ **计算器功能**
- 账户总资金管理
- 多种杠杆选择（1-125倍）
- 做多/做空双向交易
- 开仓价格设置
- 风险占比控制
- 手续费精准估算
- 浮盈加仓策略（基于总资金百分比）
- 复利计算模拟
- 止损价/盈亏比二选一模式
- 高精度计算（小数点后6位）

✅ **用户系统**
- 邮箱注册/登录
- JWT身份验证
- 会员等级管理
- 用户个人中心

✅ **会员系统**
- 免费版/高级会员
- 多种会员套餐（1/3/6/12个月）
- USDT支付支持
- 支付宝支付支持
- 会员权益管理

✅ **后台管理**
- 管理员仪表盘
- 用户管理
- 订单管理
- 数据统计
- 订单审核功能

✅ **多语言支持**
- 中文 🇨🇳
- English 🇺🇸
- 한국어 🇰🇷

✅ **主题切换**
- 暗黑风格 🌑
- 蓝色金融 💙
- 金色奢华 ✨

✅ **响应式设计**
- 完美支持桌面端
- 移动端适配
- 汉堡菜单导航

## 技术栈

### 前端
- React 18
- TypeScript
- React Router
- i18next (国际化)
- Axios (HTTP客户端)
- CSS3 (主题系统)

### 后端
- Node.js
- Express
- TypeScript
- SQLite3 (数据库)
- JWT (身份验证)
- Bcrypt (密码加密)

### 部署
- Docker
- Docker Compose
- Nginx

## 快速开始

### 前置要求
- Node.js 18+
- npm 或 yarn

### 方式一：本地开发

1. **克隆项目**
```bash
git clone <your-repo>
cd speculation-calculator
```

2. **安装依赖**
```bash
npm run install:all
```

3. **配置环境变量**
```bash
# 在 server 目录创建 .env 文件
cd server
cp .env.example .env
# 编辑 .env 文件，修改必要的配置
```

4. **启动开发服务器**
```bash
# 在项目根目录
npm run dev
```

前端将运行在 `http://localhost:3000`
后端将运行在 `http://localhost:5000`

### 方式二：Docker部署

1. **使用Docker Compose一键部署**
```bash
docker-compose up -d
```

2. **访问应用**
- 前端: `http://localhost:3000`
- 后端API: `http://localhost:5000`

### 方式三：生产环境部署

1. **构建前端**
```bash
cd client
npm install
npm run build
```

2. **构建后端**
```bash
cd server
npm install
npm run build
```

3. **启动后端服务**
```bash
cd server
npm start
```

4. **配置Nginx**
将 client/build 目录部署到Nginx，并配置反向代理到后端API。

## 默认管理员账号

首次启动时会自动创建管理员账号：
- 邮箱: `admin@example.com`
- 密码: `admin123`

⚠️ **重要**: 首次登录后请立即修改密码！

## 项目结构

```
speculation-calculator/
├── client/                 # 前端React应用
│   ├── public/            # 静态资源
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── contexts/      # Context (主题、认证)
│   │   ├── i18n/          # 国际化配置
│   │   ├── pages/         # 页面组件
│   │   ├── utils/         # 工具函数（计算器逻辑）
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── server/                # 后端Node.js应用
│   ├── src/
│   │   ├── middleware/    # 中间件
│   │   ├── routes/        # API路由
│   │   ├── database.ts    # 数据库配置
│   │   └── index.ts
│   └── package.json
├── docker-compose.yml     # Docker编排配置
└── README.md
```

## API文档

### 认证相关
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

### 支付相关
- `POST /api/payment/create-order` - 创建订单
- `GET /api/payment/orders` - 获取用户订单列表

### 管理员相关
- `GET /api/admin/stats` - 获取统计数据
- `GET /api/admin/users` - 获取所有用户
- `GET /api/admin/orders` - 获取所有订单
- `POST /api/admin/orders/:orderId/approve` - 批准订单

## 计算器逻辑说明

### 基础计算
1. 根据账户资金、杠杆、风险占比计算开仓仓位
2. 根据止损价或盈亏比计算止损止盈价格
3. 计算名义仓位价值、保证金占用、手续费
4. 计算预期盈亏

### 浮盈加仓
1. 设置盈利阈值（如10%）和加仓比例（如50%）
2. 当浮盈达到阈值时触发加仓
3. 计算加仓后的平均成本价
4. 重新计算止损止盈价格

### 复利计算
1. 设置初始资金和每轮收益率
2. 模拟多轮复利增长
3. 显示每轮后的总资金

## 配置说明

### 环境变量 (.env)

```bash
# 服务端口
PORT=5000

# 数据库路径
DB_PATH=./database.sqlite

# JWT密钥（生产环境务必修改！）
JWT_SECRET=your-super-secret-jwt-key

# 管理员邮箱
ADMIN_EMAIL=admin@example.com
```

### 前端环境变量

在 `client/.env` 中：
```bash
REACT_APP_API_URL=http://localhost:5000/api
```

## 开发指南

### 添加新语言
1. 在 `client/src/i18n/locales/` 添加新的JSON文件
2. 在 `client/src/i18n/config.ts` 中注册新语言

### 添加新主题
1. 在 `client/src/App.css` 中定义新主题的CSS变量
2. 在 `ThemeContext.tsx` 中添加新主题类型

### 修改计算逻辑
1. 编辑 `client/src/utils/calculator.ts`
2. 确保所有数字保留6位小数精度

## 安全建议

1. ✅ 修改默认的JWT_SECRET
2. ✅ 修改默认管理员密码
3. ✅ 使用HTTPS（生产环境）
4. ✅ 配置CORS白名单
5. ✅ 定期备份数据库
6. ✅ 实现支付回调验证

## 性能优化

- 使用React.memo优化组件渲染
- 图片资源使用CDN
- 启用Gzip压缩
- 使用SQLite索引优化查询
- 实现API请求缓存

## 浏览器支持

- Chrome (推荐)
- Firefox
- Safari
- Edge

## 许可证

MIT License

## 联系方式

- 团队：北辰团队
- 专注：量化交易 & 风险管理

---

**⚠️ 免责声明**: 本工具仅供学习和参考，不构成任何投资建议。请谨慎进行合约交易，注意风险控制。
