#!/bin/bash

# 投机计算器启动脚本
echo "🚀 启动投机计算器..."

# 检查Docker是否安装
if ! command -v docker &> /dev/null; then
    echo "❌ Docker未安装，请先安装Docker"
    exit 1
fi

# 检查Docker Compose是否安装
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose未安装，请先安装Docker Compose"
    exit 1
fi

# 创建必要的目录
mkdir -p ssl
mkdir -p data/mongodb

# 生成自签名SSL证书（仅用于开发）
if [ ! -f ssl/cert.pem ]; then
    echo "🔐 生成SSL证书..."
    openssl req -x509 -newkey rsa:4096 -keyout ssl/key.pem -out ssl/cert.pem -days 365 -nodes -subj "/C=CN/ST=Beijing/L=Beijing/O=BeichenTeam/OU=IT/CN=localhost"
fi

# 启动服务
echo "🐳 启动Docker容器..."
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 显示访问信息
echo ""
echo "✅ 投机计算器启动完成！"
echo ""
echo "📱 访问地址："
echo "   前端: https://localhost"
echo "   后端API: https://localhost/api"
echo "   管理后台: https://localhost/admin"
echo ""
echo "👤 默认管理员账户："
echo "   邮箱: admin@speculation-calculator.com"
echo "   密码: admin123"
echo ""
echo "📊 查看日志："
echo "   docker-compose logs -f"
echo ""
echo "🛑 停止服务："
echo "   docker-compose down"
echo ""