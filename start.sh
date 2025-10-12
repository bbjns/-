#!/bin/bash

# 投机计算器启动脚本
# 作者：北辰团队
# 版本：1.0.0

set -e

echo "🚀 投机计算器启动脚本"
echo "📅 $(date)"
echo "👥 北辰团队专注量化·风险管理"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 函数定义
print_step() {
    echo -e "${BLUE}[步骤]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

# 检查Docker
check_docker() {
    print_step "检查Docker环境..."
    
    if ! command -v docker &> /dev/null; then
        print_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    if ! command -v docker-compose &> /dev/null; then
        print_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi
    
    if ! docker info &> /dev/null; then
        print_error "Docker服务未启动，请启动Docker服务"
        exit 1
    fi
    
    print_success "Docker环境检查通过"
}

# 检查环境变量
check_env() {
    print_step "检查环境变量..."
    
    if [ ! -f .env ]; then
        print_warning ".env文件不存在，正在创建..."
        cp .env.example .env
        print_warning "请编辑.env文件配置必要的环境变量"
        echo "主要配置项："
        echo "  - REACT_APP_API_URL: 前端API地址"
        echo "  - EMAIL_USER: 邮件发送账户"
        echo "  - EMAIL_PASS: 邮件发送密码"
        echo "  - USDT_WALLET_ADDRESS: USDT钱包地址"
        echo ""
        read -p "是否现在编辑.env文件？(y/n): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            ${EDITOR:-nano} .env
        fi
    fi
    
    print_success "环境变量检查完成"
}

# 检查SSL证书
check_ssl() {
    print_step "检查SSL证书..."
    
    if [ ! -d "nginx/ssl" ]; then
        mkdir -p nginx/ssl
        print_warning "SSL证书目录不存在，已创建"
    fi
    
    if [ ! -f "nginx/ssl/fullchain.pem" ] || [ ! -f "nginx/ssl/privkey.pem" ]; then
        print_warning "SSL证书不存在，将生成自签名证书用于测试"
        
        # 生成自签名证书
        openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
            -keyout nginx/ssl/privkey.pem \
            -out nginx/ssl/fullchain.pem \
            -subj "/C=CN/ST=Beijing/L=Beijing/O=Beichen/CN=localhost" \
            &> /dev/null
        
        print_warning "已生成自签名证书，生产环境请使用真实SSL证书"
    fi
    
    print_success "SSL证书检查完成"
}

# 构建和启动服务
start_services() {
    print_step "构建和启动服务..."
    
    # 停止现有服务
    docker-compose down &> /dev/null || true
    
    # 构建镜像
    print_step "构建Docker镜像..."
    docker-compose build --no-cache
    
    # 启动服务
    print_step "启动所有服务..."
    docker-compose up -d
    
    print_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    print_step "等待服务就绪..."
    
    # 等待后端API
    echo -n "等待后端API启动"
    for i in {1..30}; do
        if curl -f http://localhost:3001/health &> /dev/null; then
            echo ""
            print_success "后端API已就绪"
            break
        fi
        echo -n "."
        sleep 2
        if [ $i -eq 30 ]; then
            echo ""
            print_error "后端API启动超时"
            exit 1
        fi
    done
    
    # 等待前端服务
    echo -n "等待前端服务启动"
    for i in {1..30}; do
        if curl -f http://localhost/ &> /dev/null; then
            echo ""
            print_success "前端服务已就绪"
            break
        fi
        echo -n "."
        sleep 2
        if [ $i -eq 30 ]; then
            echo ""
            print_error "前端服务启动超时"
            exit 1
        fi
    done
}

# 显示服务状态
show_status() {
    print_step "服务状态检查..."
    
    echo ""
    echo "📊 服务状态："
    docker-compose ps
    
    echo ""
    echo "🌐 访问地址："
    echo "  前端应用: http://localhost"
    echo "  API接口: http://localhost/api"
    echo "  健康检查: http://localhost/health"
    
    echo ""
    echo "📝 管理命令："
    echo "  查看日志: docker-compose logs -f"
    echo "  重启服务: docker-compose restart"
    echo "  停止服务: docker-compose down"
    echo "  进入容器: docker-compose exec [service] sh"
    
    echo ""
    print_success "投机计算器启动完成！"
}

# 主函数
main() {
    echo "开始启动投机计算器..."
    echo ""
    
    # 检查环境
    check_docker
    check_env
    check_ssl
    
    echo ""
    read -p "是否继续启动服务？(y/n): " -n 1 -r
    echo ""
    
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        print_warning "用户取消启动"
        exit 0
    fi
    
    # 启动服务
    start_services
    wait_for_services
    show_status
}

# 错误处理
trap 'print_error "启动过程中发生错误，请检查日志"; exit 1' ERR

# 执行主函数
main "$@"