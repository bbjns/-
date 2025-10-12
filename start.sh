#!/bin/bash

echo "======================================"
echo "投机计算器 - 启动脚本"
echo "北辰团队专注量化.风险管理"
echo "======================================"
echo ""

# 检查Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

echo "✅ Node.js 版本: $(node --version)"
echo ""

# 安装依赖
echo "📦 安装依赖..."
if [ ! -d "node_modules" ]; then
    npm install
fi

if [ ! -d "client/node_modules" ]; then
    echo "📦 安装前端依赖..."
    cd client && npm install && cd ..
fi

if [ ! -d "server/node_modules" ]; then
    echo "📦 安装后端依赖..."
    cd server && npm install && cd ..
fi

echo ""
echo "✅ 依赖安装完成"
echo ""

# 启动服务
echo "🚀 启动开发服务器..."
echo ""
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:5000"
echo ""
echo "默认管理员账号:"
echo "邮箱: admin@example.com"
echo "密码: admin123"
echo ""
echo "按 Ctrl+C 停止服务"
echo ""

npm run dev
