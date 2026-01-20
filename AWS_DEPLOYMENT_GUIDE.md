# MERN Threads App - AWS Deployment Guide

## Server Information
- **AWS EC2 IP**: 52.66.246.135
- **Backend Port**: 5000 (internal)
- **Frontend Port**: 80 (nginx)
- **Database**: MongoDB Atlas

## Directory Structure
```
/home/ubuntu/MERN_AWS/
├── client/          # React frontend
├── server/          # Node.js backend
└── AWS_DEPLOYMENT_GUIDE.md
```

## Backend Management

### Start Backend
```bash
cd ~/MERN_AWS/server
pm2 start ecosystem.config.js
```

### Stop Backend
```bash
pm2 stop threads-backend
```

### Restart Backend
```bash
pm2 restart threads-backend
```

### Check Backend Status
```bash
pm2 status
pm2 show threads-backend
```

### View Backend Logs
```bash
pm2 logs threads-backend
pm2 logs threads-backend --lines 50
```

### Delete Backend Process
```bash
pm2 delete threads-backend
```

## Frontend Management

### Build Frontend
```bash
cd ~/MERN_AWS/client
npm run build
```

### Deploy Frontend to Nginx
```bash
sudo cp -r /home/ubuntu/MERN_AWS/client/dist/* /var/www/html/
sudo chown -R www-data:www-data /var/www/html/
sudo chmod -R 755 /var/www/html/
```

### Start Nginx
```bash
sudo systemctl start nginx
```

### Stop Nginx
```bash
sudo systemctl stop nginx
```

### Restart Nginx
```bash
sudo systemctl restart nginx
```

### Check Nginx Status
```bash
sudo systemctl status nginx
```

### Test Nginx Configuration
```bash
sudo nginx -t
```

### View Nginx Logs
```bash
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Complete Deployment Process

### Initial Setup (One-time)
1. **Clone Repository**
   ```bash
   cd ~
   git clone <your-repo-url> MERN_AWS
   cd MERN_AWS
   ```

2. **Install Dependencies**
   ```bash
   # Backend
   cd server
   npm install
   
   # Frontend
   cd ../client
   npm install
   ```

3. **Setup Environment Variables**
   ```bash
   cd ~/MERN_AWS/server
   nano .env
   ```
   Add:
   ```
   MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Thread
   PORT=5000
   JWT_SECRET=your-jwt-secret
   CLIENT_URL=http://52.66.246.135
   NODE_ENV=production
   ```

4. **Create PM2 Ecosystem File**
   ```bash
   cd ~/MERN_AWS/server
   cat > ecosystem.config.js << 'EOF'
   module.exports = {
     apps: [{
       name: 'threads-backend',
       script: 'index.js',
       env: {
         NODE_ENV: 'production',
         PORT: 5000
       }
     }]
   }
   EOF
   ```

5. **Setup Nginx Configuration**
   ```bash
   sudo nano /etc/nginx/sites-available/threads-app
   ```
   Add the nginx configuration (see Nginx Configuration section below)

### Regular Deployment (After Code Changes)

1. **Pull Latest Code**
   ```bash
   cd ~/MERN_AWS
   git pull origin main
   ```

2. **Update Backend**
   ```bash
   cd server
   npm install  # if package.json changed
   pm2 restart threads-backend
   ```

3. **Update Frontend**
   ```bash
   cd ../client
   npm install  # if package.json changed
   npm run build
   sudo cp -r dist/* /var/www/html/
   sudo chown -R www-data:www-data /var/www/html/
   ```

4. **Restart Services**
   ```bash
   sudo systemctl restart nginx
   pm2 restart threads-backend
   ```

## Nginx Configuration

### Configuration File Location
```bash
/etc/nginx/sites-available/threads-app
```

### Complete Nginx Configuration
```nginx
server {
    listen 80;
    server_name 52.66.246.135;

    # Serve React frontend from /var/www/html
    location / {
        root /var/www/html;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Handle static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        root /var/www/html;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # Proxy API requests to backend
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # Cookie handling
        proxy_set_header Cookie $http_cookie;
        proxy_pass_header Set-Cookie;
        proxy_cookie_path / /;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss;
}
```

### Enable Nginx Site
```bash
sudo ln -s /etc/nginx/sites-available/threads-app /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
```

## Troubleshooting

### Backend Issues
```bash
# Check if backend is running
pm2 status

# Check backend logs
pm2 logs threads-backend

# Check if port 5000 is in use
sudo netstat -tlnp | grep :5000

# Restart backend
pm2 restart threads-backend
```

### Frontend Issues
```bash
# Check nginx status
sudo systemctl status nginx

# Check nginx logs
sudo tail -f /var/log/nginx/error.log

# Test nginx config
sudo nginx -t

# Check if files exist
ls -la /var/www/html/
```

### Database Connection Issues
```bash
# Check environment variables
pm2 env 0

# Test MongoDB connection
cd ~/MERN_AWS/server
node -e "require('dotenv').config(); console.log(process.env.MONGO_URI)"
```

### Cookie/Authentication Issues
```bash
# Test login endpoint
curl -v -X POST http://13.204.66.128/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"your@email.com","password":"yourpassword"}' \
  -c cookies.txt

# Test protected endpoint
curl -v http://13.204.66.128/api/me -b cookies.txt
```

## Quick Commands Reference

### Start Everything
```bash
# Start backend
cd ~/MERN_AWS/server && pm2 start ecosystem.config.js

# Start nginx
sudo systemctl start nginx
```

### Stop Everything
```bash
# Stop backend
pm2 stop threads-backend

# Stop nginx
sudo systemctl stop nginx
```

### Check Status
```bash
# Check all services
pm2 status
sudo systemctl status nginx

# Check application
curl http://13.204.66.128
curl http://13.204.66.128/api/me
```

### View All Logs
```bash
# Backend logs
pm2 logs threads-backend

# Nginx logs
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log
```

## Security Group Settings (AWS Console)

Ensure your EC2 security group allows:
- **Port 22**: SSH access
- **Port 80**: HTTP access (0.0.0.0/0)
- **Port 443**: HTTPS access (0.0.0.0/0) - for future SSL

## Application URLs

- **Frontend**: http://52.66.246.135
- **Backend API**: http://52.66.246.135/api/
- **Health Check**: http://52.66.246.135/api/me

## Environment Variables

### Server (.env)
```
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/Thread
PORT=5000
JWT_SECRET=your-jwt-secret
CLIENT_URL=http://52.66.246.135
NODE_ENV=production
```

### Client (vite.config.js)
```javascript
SERVER_URL: JSON.stringify(
  process.env.NODE_ENV === "production" 
    ? "" 
    : "http://localhost:5000"
)
```

## Backup and Maintenance

### Create Backup
```bash
# Backup application
tar -czf mern-threads-backup-$(date +%Y%m%d).tar.gz ~/MERN_AWS

# Backup nginx config
sudo cp /etc/nginx/sites-available/threads-app ~/nginx-backup.conf
```

### Update System
```bash
sudo apt update && sudo apt upgrade -y
```

### Monitor Resources
```bash
# Check disk space
df -h

# Check memory usage
free -h

# Check CPU usage
htop
```