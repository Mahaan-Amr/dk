#!/bin/bash

# Exit on any error
set -e

echo "Starting deployment at $(date)"

# Define directories
APP_DIR="/var/www/derakhtekherad"
BACKUP_DIR="/var/backups/derakhtekherad/$(date +%Y%m%d_%H%M%S)"

# Create backup directory
mkdir -p $BACKUP_DIR

echo "1. Creating backup..."
# Backup current deployment (excluding node_modules and .next)
cd $APP_DIR && tar --exclude='node_modules' --exclude='.next' -czf $BACKUP_DIR/code_backup.tar.gz .

# Backup database
echo "2. Backing up database..."
mongodump --uri="$MONGODB_URI" --out=$BACKUP_DIR/db_backup

echo "3. Pulling latest changes..."
# Pull latest changes from the repository
cd $APP_DIR
git pull origin main

echo "4. Installing dependencies..."
# Install production dependencies
npm install --omit=dev

echo "5. Running clean-logs script..."
# Comment out console.log statements for production
bash clean-logs.sh || echo "Warning: clean-logs.sh failed but continuing deployment"

echo "6. Building the application..."
# Build the application
NODE_ENV=production npm run build

echo "7. Restarting application..."
# Restart the application with PM2
pm2 reload derakhtekherad

echo "8. Testing health check..."
# Simple health check
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health || echo "Failed")
if [ "$HEALTH_CHECK" == "200" ]; then
  echo "Health check passed: $HEALTH_CHECK"
else
  echo "Warning: Health check returned $HEALTH_CHECK. Please check application logs."
fi

echo "Deployment completed successfully at $(date)"
echo "Backup stored at: $BACKUP_DIR" 