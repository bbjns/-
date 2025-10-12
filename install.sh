#!/bin/bash

# 投机计算器安装脚本
echo "🎯 投机计算器 - 北辰团队专注量化风险管理"
echo "================================================"

# 检查系统
echo "🔍 检查系统环境..."

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js未安装，请先安装Node.js 18+"
    echo "   下载地址: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js版本过低，需要18+，当前版本: $(node -v)"
    exit 1
fi

echo "✅ Node.js版本: $(node -v)"

# 检查npm
if ! command -v npm &> /dev/null; then
    echo "❌ npm未安装"
    exit 1
fi

echo "✅ npm版本: $(npm -v)"

# 检查Docker
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker未安装，将使用本地开发模式"
    USE_DOCKER=false
else
    echo "✅ Docker版本: $(docker --version)"
    USE_DOCKER=true
fi

# 检查Docker Compose
if [ "$USE_DOCKER" = true ]; then
    if ! command -v docker-compose &> /dev/null; then
        echo "⚠️  Docker Compose未安装，将使用本地开发模式"
        USE_DOCKER=false
    else
        echo "✅ Docker Compose版本: $(docker-compose --version)"
    fi
fi

echo ""
echo "📦 开始安装依赖..."

# 安装根目录依赖
echo "📦 安装根目录依赖..."
npm install

# 安装后端依赖
echo "📦 安装后端依赖..."
cd server
npm install
cd ..

# 安装前端依赖
echo "📦 安装前端依赖..."
cd client
npm install
cd ..

echo ""
echo "⚙️  配置环境变量..."

# 创建环境变量文件
if [ ! -f server/.env ]; then
    echo "📝 创建环境变量文件..."
    cp server/.env.example server/.env
    echo "✅ 已创建 server/.env 文件，请根据需要修改配置"
else
    echo "✅ 环境变量文件已存在"
fi

# 创建必要的目录
echo "📁 创建必要目录..."
mkdir -p ssl
mkdir -p data/mongodb

echo ""
echo "🎉 安装完成！"
echo ""

if [ "$USE_DOCKER" = true ]; then
    echo "🐳 使用Docker部署："
    echo "   ./start.sh"
    echo ""
    echo "📱 访问地址："
    echo "   前端: https://localhost"
    echo "   后端API: https://localhost/api"
    echo "   管理后台: https://localhost/admin"
else
    echo "💻 本地开发模式："
    echo "   1. 启动MongoDB: mongod"
    echo "   2. 启动后端: cd server && npm run dev"
    echo "   3. 启动前端: cd client && npm run dev"
    echo ""
    echo "📱 访问地址："
    echo "   前端: http://localhost:3000"
    echo "   后端API: http://localhost:5000"
    echo "   管理后台: http://localhost:3000/admin"
fi

echo ""
echo "👤 默认管理员账户："
echo "   邮箱: admin@speculation-calculator.com"
echo "   密码: admin123"
echo ""
echo "📚 更多信息请查看 README.md"
echo ""
echo "🚀 开始您的投机计算之旅！"