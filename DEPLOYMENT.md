# 部署指南

## 生产环境部署步骤

### 1. 服务器准备

**最低配置要求:**
- CPU: 2核
- 内存: 4GB
- 硬盘: 20GB
- 操作系统: Ubuntu 20.04+ / CentOS 8+

**安装必要软件:**
```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# 安装Docker和Docker Compose
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 安装Nginx
sudo apt install -y nginx
```

### 2. 项目部署

```bash
# 克隆项目
git clone <your-repo-url>
cd speculation-calculator

# 配置环境变量
cd server
cp .env.example .env
nano .env  # 编辑配置

# 重要配置项:
# JWT_SECRET=<生成一个强随机密钥>
# ADMIN_EMAIL=<你的管理员邮箱>
```

### 3. 使用Docker部署（推荐）

```bash
# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 重启服务
docker-compose restart
```

### 4. 手动部署

**构建前端:**
```bash
cd client
npm install
npm run build
```

**构建后端:**
```bash
cd server
npm install
npm run build
```

**使用PM2管理后端进程:**
```bash
# 安装PM2
npm install -g pm2

# 启动后端
cd server
pm2 start dist/index.js --name speculation-api

# 保存PM2配置
pm2 save
pm2 startup
```

### 5. Nginx配置

创建配置文件 `/etc/nginx/sites-available/speculation-calculator`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # 前端
    root /path/to/speculation-calculator/client/build;
    index index.html;

    # 前端路由
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API代理
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
    }

    # Gzip压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
}
```

启用配置:
```bash
sudo ln -s /etc/nginx/sites-available/speculation-calculator /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL证书配置（Let's Encrypt）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 7. 数据库备份

创建备份脚本 `backup.sh`:
```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/path/to/backups"
DB_PATH="/path/to/server/database.sqlite"

mkdir -p $BACKUP_DIR
cp $DB_PATH $BACKUP_DIR/database_$DATE.sqlite

# 保留最近30天的备份
find $BACKUP_DIR -name "database_*.sqlite" -mtime +30 -delete
```

添加到crontab:
```bash
crontab -e
# 每天凌晨2点备份
0 2 * * * /path/to/backup.sh
```

### 8. 防火墙配置

```bash
# UFW防火墙
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 9. 监控和日志

**查看应用日志:**
```bash
# Docker方式
docker-compose logs -f

# PM2方式
pm2 logs speculation-api

# Nginx日志
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

**系统监控:**
```bash
# 安装监控工具
sudo apt install -y htop

# 查看资源使用
htop
```

### 10. 性能优化

**Node.js优化:**
```bash
# 在.env中添加
NODE_ENV=production
NODE_OPTIONS=--max-old-space-size=4096
```

**Nginx优化:**
在nginx配置中添加:
```nginx
# 缓存静态资源
location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}

# 限流
limit_req_zone $binary_remote_addr zone=api:10m rate=10r/s;
location /api {
    limit_req zone=api burst=20;
    # ... 其他配置
}
```

### 11. 更新部署

```bash
# Docker方式
git pull
docker-compose down
docker-compose build
docker-compose up -d

# PM2方式
git pull
cd client && npm install && npm run build
cd ../server && npm install && npm run build
pm2 restart speculation-api
```

### 12. 故障排查

**常见问题:**

1. **端口被占用**
```bash
sudo lsof -i :5000
sudo kill -9 <PID>
```

2. **权限问题**
```bash
sudo chown -R $USER:$USER /path/to/project
```

3. **数据库锁定**
```bash
# 重启应用即可解决
pm2 restart speculation-api
```

4. **前端无法连接后端**
- 检查REACT_APP_API_URL配置
- 检查CORS配置
- 检查防火墙规则

### 13. 安全检查清单

- [ ] 修改默认JWT_SECRET
- [ ] 修改默认管理员密码
- [ ] 启用HTTPS
- [ ] 配置防火墙
- [ ] 设置数据库定期备份
- [ ] 限制API请求频率
- [ ] 更新依赖包到最新版本
- [ ] 配置日志轮转
- [ ] 设置监控告警

### 14. 维护建议

1. **定期更新依赖**
```bash
npm audit
npm audit fix
```

2. **监控磁盘空间**
```bash
df -h
```

3. **查看系统日志**
```bash
journalctl -xe
```

4. **定期检查SSL证书过期时间**
```bash
sudo certbot certificates
```

---

## 技术支持

如遇到部署问题，请检查:
1. 日志文件
2. 环境变量配置
3. 网络连接
4. 权限设置

联系：北辰团队
