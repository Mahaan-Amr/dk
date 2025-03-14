# Derakhte Kherad Deployment Guide

This guide provides step-by-step instructions for deploying the Derakhte Kherad bilingual educational platform to a production server.

## Table of Contents

- [Phase 1: Pre-Deployment Preparation](#phase-1-pre-deployment-preparation) ✅
- [Phase 2: Server Infrastructure Setup](#phase-2-server-infrastructure-setup)
- [Phase 3: Application Deployment](#phase-3-application-deployment)
- [Phase 4: Web Server and Security Configuration](#phase-4-web-server-and-security-configuration)
- [Phase 5: Post-Deployment Tasks](#phase-5-post-deployment-tasks)
- [Phase 6: Security Hardening](#phase-6-security-hardening)
- [Phase 7: Performance Optimization](#phase-7-performance-optimization)
- [Essential Configurations](#essential-configurations)
- [Deployment Risks and Mitigations](#deployment-risks-and-mitigations)
- [Troubleshooting](#troubleshooting)

## Phase 1: Pre-Deployment Preparation ✅

### 1.1 Security Remediation ✅

The following security issues have been fixed in the codebase:

1. **Removed hardcoded credentials** from `src/app/api/admin/login/route.ts` ✅
   ```typescript
   // Hardcoded credentials were replaced with proper authentication
   isPasswordValid = await bcrypt.compare(password, admin.password);
   ```

2. **Implemented proper JWT secret management** ✅
   ```typescript
   // Added proper environment variable checking
   const jwtSecret = process.env.JWT_SECRET;
   if (!jwtSecret) {
     console.error('JWT_SECRET environment variable is not defined');
     return NextResponse.json({ message: 'Server configuration error' }, { status: 500 });
   }
   ```

3. **Added input validation** to API routes using Zod ✅
   ```typescript
   // Example from login route
   import { z } from 'zod';
   
   const loginSchema = z.object({
     username: z.string().min(3, "Username must be at least 3 characters"),
     password: z.string().min(6, "Password must be at least 6 characters")
   });
   
   // Validate input using Zod
   const result = loginSchema.safeParse(body);
   if (!result.success) {
     return NextResponse.json({ 
       message: 'Invalid input', 
       errors: result.error.format() 
     }, { status: 400 });
   }
   ```

4. **Implemented CSRF protection** for state-changing operations ✅
   - Created a CSRF token generation and validation system in `src/lib/csrf.ts`
   - Implemented CSRF middleware for protecting API routes in `src/lib/middleware.ts`
   - Added CSRF token to the login response for client-side usage
   - Created an example protected route in `src/app/api/admin/example/route.ts`
   - Provided a frontend example component in `src/components/admin/CsrfExample.tsx`

### 1.2 Performance Optimization ✅

Implemented performance enhancements:

1. **Enhanced image loading strategy** in `src/components/ui/placeholder-image.tsx` ✅
   - Added proper memory preloading for images
   - Improved responsive image handling with dynamic `sizes` attribute
   - Enhanced accessibility with appropriate ARIA attributes
   - Added quality optimization parameter to reduce bandwidth usage
   - Implemented better loading states with fade-in effects

2. **Created console logging cleanup scripts** ✅
   - Created `clean-logs.sh` for Unix-based systems
   - Created `clean-logs.ps1` for Windows systems
   - Scripts comment out unnecessary `console.log` and `console.error` statements
   - Preserves line numbers for easier debugging if needed

### 1.3 Configuration Preparation ✅

Completed environment configuration:

1. **Created production environment variables** file (`.env.production`) ✅
   ```
   # Server Environment
   NODE_ENV=production
   PORT=3000
   
   # Database Connection
   MONGODB_URI=mongodb://username:password@mongodb-host:27017/derakhtekherad
   
   # Authentication
   JWT_SECRET=replace_with_secure_random_string_at_least_32_chars
   CSRF_SECRET=replace_with_another_secure_random_string_at_least_32_chars
   JWT_EXPIRY=7d
   
   # Application Settings
   NEXT_PUBLIC_SITE_URL=https://derakhtekherad.com
   DEFAULT_LOCALE=fa
   AVAILABLE_LOCALES=fa,de
   ```

2. **Prepared deployment script** (`deploy.sh`) ✅
   - Created a comprehensive deployment script with:
     - Automatic backup of code and database before deployment
     - Git pull for latest changes
     - Production dependency installation
     - Console log cleanup
     - Application build
     - Application restart with PM2
     - Basic health check to verify deployment

## Phase 2: Server Infrastructure Setup

### 2.1 Server Provisioning

1. **Provision a suitable server**:
   - Recommended specs: 4GB RAM, 2 vCPUs, 50GB SSD
   - Ubuntu 22.04 LTS
   - Provider options: DigitalOcean, Linode, AWS EC2, Hetzner

2. **Initial server access**:
   ```bash
   # Connect to your server
   ssh root@your-server-ip
   ```

### 2.2 Base Server Configuration

```bash
# Update system packages
apt update && apt upgrade -y

# Install essential tools
apt install -y curl wget git build-essential ufw nano htop

# Configure firewall
ufw allow ssh
ufw allow http
ufw allow https
ufw enable

# Set hostname
hostnamectl set-hostname derakhtekherad-prod

# Create a non-root user
adduser deployer
usermod -aG sudo deployer

# Copy SSH keys to new user (if you used SSH to connect)
rsync --archive --chown=deployer:deployer ~/.ssh /home/deployer/

# Switch to the new user
su - deployer
```

### 2.3 Install Required Software

```bash
# Install Node.js 18.x LTS
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verify Node.js installation
node -v  # Should be v18.x.x
npm -v   # Should be 9.x.x or higher

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx
sudo apt install -y nginx
sudo systemctl enable nginx
sudo systemctl start nginx
```

### 2.4 Database Setup

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Add MongoDB repository
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package list
sudo apt update

# Install MongoDB
sudo apt install -y mongodb-org

# Start MongoDB and enable it on boot
sudo systemctl start mongod
sudo systemctl enable mongod

# Verify MongoDB is running
sudo systemctl status mongod
```

Create database and user:

```bash
# Connect to MongoDB shell
mongosh
```

In the MongoDB shell:

```javascript
// Create database
use derakhtekherad

// Create database user
db.createUser(
  {
    user: "derakhtuser",
    pwd: "secure-password-here",  // Replace with a strong password
    roles: [ { role: "readWrite", db: "derakhtekherad" } ]
  }
)

// Verify the user was created
show users

// Exit the MongoDB shell
exit
```

## Phase 3: Application Deployment

### 3.1 Clone and Configure the Repository

```bash
# Create application directory
sudo mkdir -p /var/www/derakhtekherad
sudo chown deployer:deployer /var/www/derakhtekherad
cd /var/www/derakhtekherad

# Clone the repository
git clone https://github.com/Mahaan-Amr/dk.git .

# Create production environment file
nano .env
```

Add the following to the `.env` file:

```
NODE_ENV=production
MONGODB_URI=mongodb://derakhtuser:secure-password-here@localhost:27017/derakhtekherad
JWT_SECRET=your-secure-random-string-at-least-32-chars
JWT_EXPIRY=7d
NEXT_PUBLIC_SITE_URL=https://derakhtekherad.com
DEFAULT_LOCALE=fa
AVAILABLE_LOCALES=fa,de
```

### 3.2 Install Dependencies and Build

```bash
# Install production dependencies
npm install --omit=dev

# Run the production build
NODE_ENV=production npm run build
```

### 3.3 Setup PM2 for Process Management

```bash
# Create PM2 ecosystem file
cat > ecosystem.config.js << 'EOL'
module.exports = {
  apps: [{
    name: 'derakhtekherad',
    script: 'npm',
    args: 'start',
    instances: 'max',
    exec_mode: 'cluster',
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
};
EOL

# Start the application with PM2
pm2 start ecosystem.config.js

# Save PM2 process list to be restored on reboot
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Run the command that PM2 outputs
```

## Phase 4: Web Server and Security Configuration

### 4.1 Configure Nginx as a Reverse Proxy

```bash
# Create Nginx site configuration
sudo nano /etc/nginx/sites-available/derakhtekherad.com
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name derakhtekherad.com www.derakhtekherad.com;

    # Security headers
    add_header X-XSS-Protection "1; mode=block";
    add_header X-Content-Type-Options "nosniff";
    add_header Referrer-Policy "strict-origin-when-cross-origin";
    add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self';";

    # Proxy to Node.js application
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Cache static assets
    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Increase upload size limit for admin image uploads
    client_max_body_size 10M;
}
```

Enable the site and test the configuration:

```bash
# Enable the site
sudo ln -s /etc/nginx/sites-available/derakhtekherad.com /etc/nginx/sites-enabled/

# Remove default site if necessary
sudo rm /etc/nginx/sites-enabled/default

# Test Nginx configuration
sudo nginx -t

# Reload Nginx to apply changes
sudo systemctl reload nginx
```

### 4.2 Set Up SSL with Let's Encrypt

```bash
# Install Certbot
sudo apt install -y certbot python3-certbot-nginx

# Obtain SSL certificate
sudo certbot --nginx -d derakhtekherad.com -d www.derakhtekherad.com

# Choose option 2 to redirect all traffic to HTTPS

# Test Nginx configuration
sudo nginx -t
sudo systemctl reload nginx
```

### 4.3 Database Backup Configuration

```bash
# Create a backup directory
sudo mkdir -p /var/backups/mongodb
sudo chown deployer:deployer /var/backups/mongodb

# Create a backup script
sudo nano /usr/local/bin/backup-mongodb.sh
```

Add the following to the backup script:

```bash
#!/bin/bash
DATE=$(date +"%Y-%m-%d-%H%M")
BACKUP_DIR="/var/backups/mongodb"
DATABASE="derakhtekherad"
USER="derakhtuser"
PASS="secure-password-here"  # Replace with your actual password

# Create backup
mongodump --uri="mongodb://$USER:$PASS@localhost:27017/$DATABASE" --out=$BACKUP_DIR/$DATE

# Compress backup
cd $BACKUP_DIR
tar -zcvf $DATE.tar.gz $DATE
rm -rf $DATE

# Delete backups older than 30 days
find $BACKUP_DIR -name "*.tar.gz" -type f -mtime +30 -delete

echo "Backup completed: $BACKUP_DIR/$DATE.tar.gz"
```

Make the script executable and schedule it:

```bash
# Make the script executable
sudo chmod +x /usr/local/bin/backup-mongodb.sh

# Test the backup script
sudo /usr/local/bin/backup-mongodb.sh

# Add a daily cron job for backups
echo "0 2 * * * /usr/local/bin/backup-mongodb.sh" | sudo tee -a /etc/crontab
```

## Phase 5: Post-Deployment Tasks

### 5.1 Setup Monitoring

```bash
# Install PM2 logrotate module
pm2 install pm2-logrotate

# Configure log rotation
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

# Install system monitoring tools
sudo apt install -y vnstat

# Start monitoring
pm2 monit
```

### 5.2 Create Initial Admin User

```bash
# Navigate to application directory
cd /var/www/derakhtekherad

# Run the create-admin script
NODE_ENV=production npm run create-admin
```

Follow the prompts to create an admin user with a secure password.

### 5.3 Testing and Verification

Verify that the following functionality works correctly:

- [ ] Homepage loads properly at https://derakhtekherad.com
- [ ] Multilingual support works (switch between Farsi and German)
- [ ] Authentication works (admin login)
- [ ] Blog posts display correctly
- [ ] Admin functionality works (create/edit/delete blog posts)
- [ ] Contact forms submit correctly
- [ ] Images and placeholders display properly
- [ ] SSL certificate is valid

Test URLs:
- Main site: https://derakhtekherad.com
- Admin login: https://derakhtekherad.com/fa/admin/login
- Blog page: https://derakhtekherad.com/fa/blog
- Courses page: https://derakhtekherad.com/fa/courses

### 5.4 Setup Automatic Updates (Optional)

```bash
# Create a deploy key for GitHub
ssh-keygen -t ed25519 -C "deploy@derakhtekherad.com"
cat ~/.ssh/id_ed25519.pub
```

Add the deploy key to your GitHub repository with read-only access.

Create a deployment script:

```bash
# Create a deployment script
nano /var/www/derakhtekherad/deploy.sh
```

Add the following content:

```bash
#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment at $(date)"
cd /var/www/derakhtekherad

# Pull latest changes
git pull origin main

# Install dependencies
npm install --omit=dev

# Build the application
npm run build

# Restart the application
pm2 reload derakhtekherad

echo "Deployment completed successfully at $(date)"
```

Make the script executable:

```bash
chmod +x /var/www/derakhtekherad/deploy.sh
```

To setup a webhook, you can use a tool like [webhook](https://github.com/adnanh/webhook) or a simple Express server.

## Phase 6: Security Hardening

### 6.1 Enable MongoDB Authentication

```bash
# Edit MongoDB configuration
sudo nano /etc/mongod.conf
```

Update the security section:

```yaml
security:
  authorization: enabled
```

Restart MongoDB:

```bash
sudo systemctl restart mongod
```

### 6.2 Server Hardening

```bash
# Install fail2ban to prevent brute force attacks
sudo apt install -y fail2ban

# Create fail2ban configuration
sudo nano /etc/fail2ban/jail.local
```

Add the following configuration:

```ini
[sshd]
enabled = true
port = ssh
filter = sshd
logpath = /var/log/auth.log
maxretry = 5
findtime = 600
bantime = 3600

[nginx-http-auth]
enabled = true
filter = nginx-http-auth
port = http,https
logpath = /var/log/nginx/error.log
maxretry = 5
findtime = 600
bantime = 3600
```

Restart fail2ban:

```bash
sudo systemctl restart fail2ban
```

### 6.3 Setup Automatic Security Updates

```bash
# Install unattended-upgrades
sudo apt install -y unattended-upgrades apt-listchanges

# Configure unattended-upgrades
sudo nano /etc/apt/apt.conf.d/50unattended-upgrades
```

Uncomment and modify these lines:

```
Unattended-Upgrade::Allowed-Origins {
  "${distro_id}:${distro_codename}";
  "${distro_id}:${distro_codename}-security";
  "${distro_id}ESMApps:${distro_codename}-apps-security";
  "${distro_id}ESM:${distro_codename}-infra-security";
};

Unattended-Upgrade::Remove-Unused-Kernel-Packages "true";
Unattended-Upgrade::Remove-Unused-Dependencies "true";
Unattended-Upgrade::Automatic-Reboot "true";
Unattended-Upgrade::Automatic-Reboot-Time "02:00";
```

Enable automatic updates:

```bash
sudo nano /etc/apt/apt.conf.d/20auto-upgrades
```

Add the following:

```
APT::Periodic::Update-Package-Lists "1";
APT::Periodic::Download-Upgradeable-Packages "1";
APT::Periodic::AutocleanInterval "7";
APT::Periodic::Unattended-Upgrade "1";
```

## Phase 7: Performance Optimization

### 7.1 Content Delivery Network Setup (Optional)

For a CDN, you can use Cloudflare:

1. Sign up for a Cloudflare account
2. Add your domain (derakhtekherad.com)
3. Update your domain nameservers to point to Cloudflare
4. Set up page rules:
   - Cache everything for static assets
   - Bypass cache for admin sections

### 7.2 Image Optimization

1. Install Sharp for better image optimization:
   ```bash
   npm install sharp
   ```

2. Configure Next.js for image optimization in `next.config.mjs`:
   ```javascript
   const nextConfig = {
     // ...existing config
     images: {
       formats: ['image/avif', 'image/webp'],
       deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048],
       imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
       domains: [],
       path: '/_next/image',
       loader: 'default',
       minimumCacheTTL: 60,
     },
   };
   ```

### 7.3 Enable Gzip Compression in Nginx

Update your Nginx configuration:

```bash
sudo nano /etc/nginx/sites-available/derakhtekherad.com
```

Add the following inside the server block:

```nginx
# Enable gzip compression
gzip on;
gzip_proxied any;
gzip_comp_level 6;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

Reload Nginx:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

## Essential Configurations

### Environment Variables Checklist

Make sure your `.env` file includes the following variables:

```
# Server
NODE_ENV=production
PORT=3000

# Database
MONGODB_URI=mongodb://derakhtuser:secure-password-here@localhost:27017/derakhtekherad

# Authentication
JWT_SECRET=your-secure-random-string-at-least-32-chars
JWT_EXPIRY=7d

# Application
NEXT_PUBLIC_SITE_URL=https://derakhtekherad.com
DEFAULT_LOCALE=fa
AVAILABLE_LOCALES=fa,de
```

### Regular Maintenance Tasks

Schedule these tasks for regular maintenance:

1. **Weekly**:
   - Check logs for errors: `pm2 logs derakhtekherad --lines 100`
   - Update npm dependencies: `npm update --production`
   - Verify database backups

2. **Monthly**:
   - Run system updates: `sudo apt update && sudo apt upgrade -y`
   - Check disk space: `df -h`
   - Rotate logs: `pm2 flush`

3. **Quarterly**:
   - Renew SSL certificates (if not auto-renewed): `sudo certbot renew`
   - Audit users and permissions
   - Review security settings

## Deployment Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| MongoDB connection failures | Implement robust connection retry logic; monitor database health |
| JWT secret exposure | Use environment variables and restrict access to `.env` files |
| Performance issues with image loading | Implement CDN and optimize the image loading component |
| Multi-language support breaks | Thoroughly test both languages after deployment; implement fallbacks |
| Server resource constraints | Monitor resource usage; set up alerts for high CPU/memory usage |
| SSL certificate expiration | Configure automatic renewal with certbot |
| Unauthorized access attempts | Use fail2ban; implement rate limiting; review access logs |

## Troubleshooting

### Application Won't Start

1. Check logs:
   ```bash
   pm2 logs derakhtekherad
   ```

2. Verify environment variables:
   ```bash
   cd /var/www/derakhtekherad
   cat .env
   ```

3. Check MongoDB connection:
   ```bash
   mongosh mongodb://derakhtuser:password@localhost:27017/derakhtekherad
   ```

### Database Connection Issues

1. Verify MongoDB is running:
   ```bash
   sudo systemctl status mongod
   ```

2. Check MongoDB logs:
   ```bash
   sudo tail -n 100 /var/log/mongodb/mongod.log
   ```

3. Test credentials:
   ```bash
   mongosh --eval "db.adminCommand('ping')"
   ```

### Nginx/SSL Issues

1. Check Nginx configuration:
   ```bash
   sudo nginx -t
   ```

2. Verify SSL certificate:
   ```bash
   sudo certbot certificates
   ```

3. Check Nginx logs:
   ```bash
   sudo tail -n 100 /var/log/nginx/error.log
   ```

### Performance Issues

1. Check server load:
   ```bash
   htop
   ```

2. Monitor Node.js memory usage:
   ```bash
   pm2 monit
   ```

3. Check disk space:
   ```bash
   df -h
   ```

4. Check network performance:
   ```bash
   curl -s -w "\nDNS: %{time_namelookup}s\nConnect: %{time_connect}s\nTTFB: %{time_starttransfer}s\nTotal: %{time_total}s\n" -o /dev/null https://derakhtekherad.com
   ```

---

This deployment guide provides comprehensive instructions for setting up the Derakhte Kherad educational platform on a production server. Following these steps will help ensure a secure, reliable, and performant deployment. 