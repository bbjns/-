# 项目结构说明

## 目录结构

```
speculation-calculator/
│
├── client/                          # 前端React应用
│   ├── public/                      # 静态资源目录
│   │   ├── index.html              # HTML模板
│   │   └── manifest.json           # PWA配置
│   │
│   ├── src/                         # 源代码目录
│   │   ├── components/             # 通用组件
│   │   │   ├── Layout.tsx          # 主布局组件（导航、菜单）
│   │   │   ├── Layout.css          # 布局样式
│   │   │   └── ProtectedRoute.tsx  # 路由保护组件
│   │   │
│   │   ├── contexts/               # React Context
│   │   │   ├── AuthContext.tsx     # 用户认证状态管理
│   │   │   └── ThemeContext.tsx    # 主题管理
│   │   │
│   │   ├── i18n/                   # 国际化配置
│   │   │   ├── config.ts           # i18next配置
│   │   │   └── locales/            # 语言包
│   │   │       ├── zh.json         # 中文
│   │   │       ├── en.json         # 英文
│   │   │       └── ko.json         # 韩文
│   │   │
│   │   ├── pages/                  # 页面组件
│   │   │   ├── Calculator.tsx      # 计算器页面
│   │   │   ├── Calculator.css      # 计算器样式
│   │   │   ├── Login.tsx           # 登录页面
│   │   │   ├── Register.tsx        # 注册页面
│   │   │   ├── Auth.css            # 认证页面样式
│   │   │   ├── Membership.tsx      # 会员中心
│   │   │   ├── Membership.css      # 会员中心样式
│   │   │   ├── AdminDashboard.tsx  # 管理后台
│   │   │   └── AdminDashboard.css  # 后台样式
│   │   │
│   │   ├── utils/                  # 工具函数
│   │   │   └── calculator.ts       # 计算器核心逻辑
│   │   │
│   │   ├── App.tsx                 # 主应用组件
│   │   ├── App.css                 # 全局样式和主题变量
│   │   ├── index.tsx               # 应用入口
│   │   └── index.css               # 基础样式
│   │
│   ├── .env                         # 环境变量
│   ├── package.json                 # 依赖配置
│   ├── tsconfig.json               # TypeScript配置
│   ├── Dockerfile                   # Docker镜像配置
│   └── nginx.conf                   # Nginx配置
│
├── server/                          # 后端Node.js应用
│   ├── src/                         # 源代码目录
│   │   ├── middleware/             # 中间件
│   │   │   └── auth.ts             # JWT认证中间件
│   │   │
│   │   ├── routes/                 # API路由
│   │   │   ├── auth.ts             # 认证相关API
│   │   │   ├── payment.ts          # 支付相关API
│   │   │   └── admin.ts            # 管理员API
│   │   │
│   │   ├── database.ts             # 数据库配置和初始化
│   │   └── index.ts                # 服务器入口
│   │
│   ├── .env                         # 环境变量
│   ├── .env.example                # 环境变量示例
│   ├── package.json                # 依赖配置
│   ├── tsconfig.json               # TypeScript配置
│   └── Dockerfile                   # Docker镜像配置
│
├── .gitignore                       # Git忽略文件
├── docker-compose.yml              # Docker编排配置
├── package.json                    # 根项目配置
├── start.sh                        # 快速启动脚本
│
├── README.md                       # 项目说明文档
├── DEPLOYMENT.md                   # 部署指南
├── QUICKSTART.md                   # 快速开始指南
└── PROJECT_STRUCTURE.md            # 本文件
```

## 核心文件说明

### 前端核心文件

#### `client/src/utils/calculator.ts`
**计算器核心逻辑**
- `calculateBasic()` - 基础计算（止损止盈、保证金、手续费等）
- `calculateFloatingProfit()` - 浮盈加仓计算
- `calculateCompound()` - 复利计算
- `formatNumber()` - 数字格式化（6位小数）

#### `client/src/contexts/ThemeContext.tsx`
**主题管理**
- 三种主题：dark（暗黑）、blue（蓝色金融）、gold（金色奢华）
- 本地存储持久化
- 全局CSS变量控制

#### `client/src/contexts/AuthContext.tsx`
**用户认证管理**
- JWT令牌管理
- 登录/注册/登出
- 用户状态全局共享
- 自动令牌验证

#### `client/src/App.css`
**主题CSS变量定义**
```css
:root {
  --bg-primary: 主背景色
  --bg-secondary: 次要背景色
  --bg-tertiary: 第三层背景色
  --text-primary: 主文字颜色
  --text-secondary: 次要文字颜色
  --accent-primary: 主题色
  --accent-secondary: 主题辅助色
  --border-color: 边框颜色
  --success: 成功提示色
  --danger: 危险提示色
  --warning: 警告提示色
  --shadow: 阴影效果
}
```

### 后端核心文件

#### `server/src/database.ts`
**数据库管理**
- SQLite数据库初始化
- 用户表结构
- 订单表结构
- 管理员账号自动创建

**数据表结构:**

**users表:**
```sql
id TEXT PRIMARY KEY          # 用户ID
email TEXT UNIQUE           # 邮箱
password TEXT               # 密码哈希
isPremium INTEGER          # 是否会员
premiumExpireDate TEXT     # 会员过期时间
isAdmin INTEGER            # 是否管理员
createdAt TEXT             # 创建时间
```

**orders表:**
```sql
id TEXT PRIMARY KEY          # 订单ID
userId TEXT                 # 用户ID
amount REAL                 # 金额
duration INTEGER            # 时长（月）
paymentMethod TEXT         # 支付方式
status TEXT                # 状态（pending/completed/cancelled）
createdAt TEXT             # 创建时间
```

#### `server/src/middleware/auth.ts`
**认证中间件**
- JWT令牌验证
- 用户身份注入
- 管理员权限检查

#### `server/src/routes/`
**API路由**

**auth.ts** - 认证API:
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `GET /api/auth/me` - 获取当前用户

**payment.ts** - 支付API:
- `POST /api/payment/create-order` - 创建订单
- `GET /api/payment/orders` - 获取订单列表

**admin.ts** - 管理API:
- `GET /api/admin/stats` - 统计数据
- `GET /api/admin/users` - 用户列表
- `GET /api/admin/orders` - 订单列表
- `POST /api/admin/orders/:id/approve` - 批准订单

## 数据流向

### 计算器数据流
```
用户输入 → Calculator.tsx → calculator.ts计算 → 显示结果
```

### 用户认证流程
```
登录表单 → AuthContext.login() → 
后端API验证 → 返回JWT → 
存储token → 更新用户状态 → 
路由跳转
```

### 订单创建流程
```
会员中心 → 选择套餐 → 创建订单API → 
生成订单记录 → 返回订单号 → 
管理员后台 → 批准订单 → 
更新用户会员状态
```

### 主题切换流程
```
用户选择主题 → ThemeContext.setTheme() → 
localStorage存储 → 更新body className → 
CSS变量自动应用
```

### 多语言切换流程
```
用户选择语言 → i18n.changeLanguage() → 
所有使用t()的文本自动更新
```

## 关键特性实现

### 1. 高精度计算
- 使用`Math.round(num * 1000000) / 1000000`保证6位小数精度
- 避免JavaScript浮点数精度问题

### 2. 响应式设计
- 使用CSS Grid和Flexbox
- 媒体查询适配不同屏幕
- 移动端汉堡菜单

### 3. 主题系统
- CSS变量实现主题切换
- 无需重新加载页面
- 平滑过渡动画

### 4. 国际化
- i18next库
- JSON格式语言包
- 支持动态插值

### 5. 安全性
- JWT身份验证
- 密码bcrypt加密
- 路由保护
- CORS配置

## 开发规范

### 命名规范
- 组件：PascalCase（如`Calculator.tsx`）
- 函数：camelCase（如`calculateBasic`）
- 常量：UPPER_SNAKE_CASE（如`JWT_SECRET`）
- CSS类：kebab-case（如`calculator-grid`）

### 代码组织
- 一个文件一个主要组件
- 相关的CSS文件与组件同名
- 工具函数放在utils目录
- API调用统一使用axios

### 提交规范
```
feat: 新功能
fix: 修复bug
docs: 文档更新
style: 代码格式调整
refactor: 重构
test: 测试相关
chore: 构建/工具相关
```

## 扩展建议

### 添加新页面
1. 在`client/src/pages/`创建组件
2. 在`App.tsx`添加路由
3. 在语言包添加文本
4. 创建对应CSS文件

### 添加新API
1. 在`server/src/routes/`创建路由文件
2. 在`server/src/index.ts`注册路由
3. 添加必要的中间件
4. 更新API文档

### 添加新主题
1. 在`App.css`定义新主题CSS变量
2. 在`ThemeContext.tsx`添加主题类型
3. 在语言包添加主题名称

### 添加新语言
1. 在`client/src/i18n/locales/`创建JSON文件
2. 在`config.ts`注册新语言
3. 翻译所有文本键值

---

更多详情请参考源代码注释和README文档。
