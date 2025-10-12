# 投机计算器部署指南

## 部署概览

本指南将帮助您在生产环境中部署投机计算器应用。应用采用Docker容器化部署，支持自动扩展和高可用性。

## 系统要求

### 最低配置
- CPU: 2核
- 内存: 4GB RAM
- 存储: 20GB SSD
- 网络: 10Mbps带宽

### 推荐配置
- CPU: 4核
- 内存: 8GB RAM
- 存储: 50GB SSD
- 网络: 100Mbps带宽

### 软件要求
- Ubuntu 20.04+ / CentOS 8+ / Debian 11+
- Docker 20.10+
- Docker Compose 2.0+
- Nginx (可选，如果不使用容器化nginx)

## 快速部署

### 1. 服务器准备

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装必要工具
sudo apt install -y curl wget git unzip

# 安装Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 安装Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 将用户添加到docker组
sudo usermod -aG docker $USER
newgrp docker
```

### 2. 获取代码

```bash
# 克隆项目
git clone <your-repository-url>
cd speculation-calculator

# 或者上传代码包
# scp -r speculation-calculator.tar.gz user@server:/opt/
# tar -xzf speculation-calculator.tar.gz
```

### 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量
nano .env
```

**重要配置项：**

```bash
# 前端API地址
REACT_APP_API_URL=https://yourdomain.com/api

# 前端URL
FRONTEND_URL=https://yourdomain.com

# 邮件配置
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 支付配置
USDT_WALLET_ADDRESS=your-usdt-wallet-address
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key
```

### 4. SSL证书配置

#### 使用Let's Encrypt (推荐)

```bash
# 安装Certbot
sudo apt install -y certbot

# 获取证书
sudo certbot certonly --standalone -d yourdomain.com

# 创建SSL目录
mkdir -p nginx/ssl

# 复制证书
sudo cp /etc/letsencrypt/live/yourdomain.com/fullchain.pem nginx/ssl/
sudo cp /etc/letsencrypt/live/yourdomain.com/privkey.pem nginx/ssl/

# 设置权限
sudo chown -R $USER:$USER nginx/ssl/
```

#### 使用自签名证书 (仅测试)

```bash
# 创建SSL目录
mkdir -p nginx/ssl

# 生成自签名证书
openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
  -keyout nginx/ssl/privkey.pem \
  -out nginx/ssl/fullchain.pem \
  -subj "/C=CN/ST=Beijing/L=Beijing/O=Beichen/CN=yourdomain.com"
```

### 5. 启动应用

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 6. 验证部署

```bash
# 检查服务健康状态
curl -f http://localhost/health

# 检查API
curl -f http://localhost/api/payment/packages

# 检查前端
curl -f http://localhost/
```

## 详细配置

### Docker Compose配置

主要服务说明：

1. **MongoDB** - 数据库服务
   - 端口: 27017
   - 数据持久化: mongodb_data卷
   - 认证: admin/password123

2. **Backend** - API服务
   - 端口: 3001
   - 环境: production
   - 健康检查: /health端点

3. **Frontend** - Web服务
   - 端口: 80 (容器内)
   - 静态文件服务
   - Nginx配置

4. **Nginx** - 反向代理
   - 端口: 80, 443
   - SSL终止
   - 负载均衡

### 环境变量详解

#### 前端环境变量
```bash
# API地址
REACT_APP_API_URL=https://yourdomain.com/api
```

#### 后端环境变量
```bash
# 应用配置
NODE_ENV=production
PORT=3001

# 数据库
MONGODB_URI=mongodb://admin:password123@mongodb:27017/speculation-calculator?authSource=admin

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production-2024
JWT_EXPIRES_IN=7d

# 邮件配置
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password

# 前端地址
FRONTEND_URL=https://yourdomain.com

# 支付配置
USDT_WALLET_ADDRESS=your-usdt-wallet-address
ALIPAY_APP_ID=your-alipay-app-id
ALIPAY_PRIVATE_KEY=your-alipay-private-key
ALIPAY_PUBLIC_KEY=your-alipay-public-key
```

### Nginx配置

#### SSL配置
```nginx
# 现代SSL配置
ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
ssl_prefer_server_ciphers off;

# HSTS
add_header Strict-Transport-Security "max-age=63072000" always;
```

#### 安全头
```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "no-referrer-when-downgrade" always;
```

#### 速率限制
```nginx
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
limit_req_zone $binary_remote_addr zone=login:10m rate=5r/m;
```

## 高级部署

### 集群部署

#### 1. 多节点MongoDB

```yaml
# docker-compose.cluster.yml
services:
  mongodb-primary:
    image: mongo:6.0
    command: mongod --replSet rs0 --bind_ip_all
    
  mongodb-secondary1:
    image: mongo:6.0
    command: mongod --replSet rs0 --bind_ip_all
    
  mongodb-secondary2:
    image: mongo:6.0
    command: mongod --replSet rs0 --bind_ip_all
```

#### 2. 负载均衡

```yaml
services:
  backend-1:
    build: ./server
    environment:
      - INSTANCE_ID=backend-1
      
  backend-2:
    build: ./server
    environment:
      - INSTANCE_ID=backend-2
      
  nginx:
    volumes:
      - ./nginx/upstream.conf:/etc/nginx/conf.d/upstream.conf
```

### 监控配置

#### 1. 健康检查

```bash
# 创建健康检查脚本
cat > health-check.sh << 'EOF'
#!/bin/bash
curl -f http://localhost/health || exit 1
curl -f http://localhost/api/payment/packages || exit 1
EOF

chmod +x health-check.sh
```

#### 2. 日志监控

```bash
# 安装日志收集工具
docker run -d \
  --name=log-collector \
  -v /var/lib/docker/containers:/var/lib/docker/containers:ro \
  -v /var/run/docker.sock:/var/run/docker.sock:ro \
  grafana/promtail:latest
```

### 备份策略

#### 1. 数据库备份

```bash
# 创建备份脚本
cat > backup-db.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
mkdir -p $BACKUP_DIR

# MongoDB备份
docker exec mongodb mongodump --out /tmp/backup_$DATE
docker cp mongodb:/tmp/backup_$DATE $BACKUP_DIR/

# 压缩备份
tar -czf $BACKUP_DIR/mongodb_backup_$DATE.tar.gz -C $BACKUP_DIR backup_$DATE
rm -rf $BACKUP_DIR/backup_$DATE

# 删除7天前的备份
find $BACKUP_DIR -name "mongodb_backup_*.tar.gz" -mtime +7 -delete
EOF

chmod +x backup-db.sh

# 添加到crontab
echo "0 2 * * * /path/to/backup-db.sh" | crontab -
```

#### 2. 代码备份

```bash
# 创建代码备份脚本
cat > backup-code.sh << 'EOF'
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/opt/backups"
APP_DIR="/opt/speculation-calculator"

tar -czf $BACKUP_DIR/code_backup_$DATE.tar.gz -C $APP_DIR .
find $BACKUP_DIR -name "code_backup_*.tar.gz" -mtime +30 -delete
EOF

chmod +x backup-code.sh
```

## 运维管理

### 日常维护

#### 1. 查看服务状态

```bash
# 查看所有服务
docker-compose ps

# 查看特定服务日志
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f mongodb

# 查看资源使用
docker stats
```

#### 2. 更新应用

```bash
# 拉取最新代码
git pull origin main

# 重新构建并启动
docker-compose build --no-cache
docker-compose up -d

# 清理旧镜像
docker image prune -f
```

#### 3. 数据库维护

```bash
# 进入MongoDB容器
docker exec -it mongodb mongo

# 查看数据库状态
use speculation-calculator
db.stats()

# 创建索引
db.users.createIndex({ "email": 1 }, { unique: true })
db.paymentorders.createIndex({ "userId": 1, "createdAt": -1 })
```

### 性能优化

#### 1. 数据库优化

```javascript
// MongoDB优化配置
db.adminCommand({
  setParameter: 1,
  internalQueryPlannerMaxIndexedSolutions: 64,
  internalQueryPlannerEnableIndexIntersection: 1
})
```

#### 2. 应用优化

```bash
# 增加Node.js内存限制
export NODE_OPTIONS="--max-old-space-size=4096"

# 启用集群模式
export NODE_ENV=production
export CLUSTER_MODE=true
```

### 故障排除

#### 1. 常见问题

**服务无法启动**
```bash
# 检查端口占用
sudo netstat -tulpn | grep :80
sudo netstat -tulpn | grep :443

# 检查磁盘空间
df -h

# 检查内存使用
free -h
```

**数据库连接失败**
```bash
# 检查MongoDB状态
docker-compose logs mongodb

# 测试连接
docker exec mongodb mongo --eval "db.adminCommand('ismaster')"
```

**SSL证书问题**
```bash
# 检查证书有效期
openssl x509 -in nginx/ssl/fullchain.pem -text -noout | grep "Not After"

# 更新证书
sudo certbot renew --dry-run
```

#### 2. 应急处理

**服务异常重启**
```bash
# 快速重启所有服务
docker-compose restart

# 重启特定服务
docker-compose restart backend

# 强制重建
docker-compose down
docker-compose up -d --force-recreate
```

**数据恢复**
```bash
# 恢复数据库
docker exec -i mongodb mongorestore --drop /tmp/backup_latest/

# 恢复代码
tar -xzf /opt/backups/code_backup_latest.tar.gz -C /opt/speculation-calculator/
```

## 安全加固

### 1. 系统安全

```bash
# 配置防火墙
sudo ufw enable
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 禁用root登录
sudo sed -i 's/PermitRootLogin yes/PermitRootLogin no/' /etc/ssh/sshd_config
sudo systemctl restart ssh

# 自动安全更新
sudo apt install -y unattended-upgrades
sudo dpkg-reconfigure -plow unattended-upgrades
```

### 2. 应用安全

```bash
# 更新Docker镜像
docker-compose pull
docker-compose up -d

# 扫描安全漏洞
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
  aquasec/trivy image speculation-calculator_backend
```

### 3. 网络安全

```bash
# 配置Fail2Ban
sudo apt install -y fail2ban

# 创建Nginx jail配置
sudo tee /etc/fail2ban/jail.d/nginx.conf << 'EOF'
[nginx-http-auth]
enabled = true
filter = nginx-http-auth
logpath = /var/log/nginx/error.log
maxretry = 3
bantime = 3600

[nginx-limit-req]
enabled = true
filter = nginx-limit-req
logpath = /var/log/nginx/error.log
maxretry = 10
bantime = 600
EOF

sudo systemctl restart fail2ban
```

## 监控和告警

### 1. 基础监控

```bash
# 安装监控工具
docker run -d \
  --name=node-exporter \
  -p 9100:9100 \
  prom/node-exporter

# 应用监控
docker run -d \
  --name=cadvisor \
  -p 8080:8080 \
  -v /:/rootfs:ro \
  -v /var/run:/var/run:ro \
  -v /sys:/sys:ro \
  -v /var/lib/docker/:/var/lib/docker:ro \
  gcr.io/cadvisor/cadvisor
```

### 2. 告警配置

```bash
# 创建告警脚本
cat > alert.sh << 'EOF'
#!/bin/bash
SERVICE_NAME="speculation-calculator"
WEBHOOK_URL="your-webhook-url"

# 检查服务状态
if ! curl -f http://localhost/health > /dev/null 2>&1; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"⚠️ $SERVICE_NAME 服务异常！\"}" \
    $WEBHOOK_URL
fi
EOF

chmod +x alert.sh

# 添加到crontab
echo "*/5 * * * * /path/to/alert.sh" | crontab -
```

## 总结

通过本部署指南，您应该能够成功部署投机计算器应用到生产环境。记住以下要点：

1. **安全第一** - 始终使用HTTPS，定期更新系统和依赖
2. **监控重要** - 设置适当的监控和告警机制
3. **备份关键** - 定期备份数据和代码
4. **文档更新** - 保持部署文档的更新

如果遇到问题，请参考故障排除章节或联系技术支持。