# Flarum Forum Deployment Guide

> **Version:** 1.0 | **Date:** 2026-05-27 | **Project:** ChinaConnect

This guide covers the complete deployment of Flarum forum with SSO integration for ChinaConnect.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Docker Deployment](#docker-deployment)
4. [MySQL Configuration](#mysql-configuration)
5. [Flarum Installation](#flarum-installation)
6. [SSO Configuration](#sso-configuration)
7. [SSL & Domain Setup](#ssl--domain-setup)
8. [ChinaConnect Integration](#chinaconnect-integration)
9. [Environment Variables](#environment-variables)
10. [Troubleshooting](#troubleshooting)

---

## Overview

### Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ChinaConnect                              │
│                     (Astro + Supabase)                           │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   User Auth  │───▶│  SSO Client │───▶│  Flarum API  │      │
│  │  (Supabase)  │    │             │    │              │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Flarum Forum                              │
│              (forum.chinaconnect.example.com)                    │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │  SSO Plugin  │───▶│   MySQL DB   │    │   Redis      │      │
│  │  (fof/links) │    │              │    │  (optional)  │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

### Required Components

| Component | Version | Purpose |
|-----------|---------|---------|
| Flarum Core | 1.8+ | Forum software |
| PHP | 8.1+ | Runtime |
| MySQL | 8.0+ | Database |
| nginx | 1.20+ | Web server |
| SSL | - | HTTPS encryption |
| fof/links extension | latest | SSO integration |

---

## Prerequisites

### Server Requirements

- **CPU:** 2 vCPU minimum (4 recommended)
- **RAM:** 4 GB minimum (8 GB recommended)
- **Storage:** 20 GB minimum
- **OS:** Ubuntu 22.04 LTS or similar
- **Docker:** 24.0+ with docker-compose plugin

### Domain Requirements

- Registered domain (e.g., `forum.chinaconnect.example.com`)
- DNS configured with A record pointing to server IP
- SSL certificate (Let's Encrypt recommended)

---

## Docker Deployment

### 1. Create Project Directory

```bash
# SSH into your server
ssh root@your-server-ip

# Create Flarum directory
mkdir -p /opt/flarum
cd /opt/flarum
```

### 2. Create docker-compose.yml

```yaml
version: "3.8"

services:
  flarum:
    image: ghcr.io/mondedie/flarum:latest
    container_name: flarum
    restart: always
    ports:
      - "8080:80"
    environment:
      - DEBUG=false
    volumes:
      - ./html:/var/www/html
      - ./assets:/var/www/html/assets
    depends_on:
      - mysql
    networks:
      - flarum-network

  mysql:
    image: mysql:8.0
    container_name: flarum-mysql
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=${MYSQL_DATABASE}
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - mysql-data:/var/lib/mysql
    networks:
      - flarum-network

networks:
  flarum-network:
    driver: bridge

volumes:
  mysql-data:
```

### 3. Create Environment File

```bash
# Create .env file
cat > /opt/flarum/.env << 'EOF'
MYSQL_ROOT_PASSWORD=your_secure_root_password
MYSQL_DATABASE=flarum
MYSQL_USER=flarum
MYSQL_PASSWORD=your_secure_db_password
EOF

# Secure the file
chmod 600 /opt/flarum/.env
```

### 4. Start Services

```bash
cd /opt/flarum

# Pull and start containers
docker-compose pull
docker-compose up -d

# Follow logs during initial setup
docker-compose logs -f
```

---

## MySQL Configuration

### Database Setup

The Docker container will automatically create the database. Verify:

```bash
# Connect to MySQL
docker exec -it flarum-mysql mysql -u flarum -p

# Verify database
SHOW DATABASES;
USE flarum;
SHOW TABLES;
```

### Performance Tuning

Add to MySQL configuration in `docker-compose.yml`:

```yaml
mysql:
  # ... existing config ...
  command: --default-authentication-plugin=mysql_native_password
           --character-set-server=utf8mb4
           --collation-server=utf8mb4_unicode_ci
           --max_connections=200
           --innodb_buffer_pool_size=512M
```

---

## Flarum Installation

### 1. Initial Setup via Web

1. Open browser to `http://your-server-ip:8080`
2. Fill in admin account credentials
3. Set forum title: "ChinaConnect Community"
4. Complete installation wizard

### 2. Configure Base URL

```bash
# SSH into container
docker exec -it flarum bash

# Set forum URL
cd /var/www/html
php flarum url:set https://forum.chinaconnect.example.com
```

### 3. Install Required Extensions

```bash
# Install via Flarum admin or CLI
docker exec -it flarum composer require fof/links

# Enable extension
docker exec -it flarum php flarum extension:enable fof/links
```

### 4. Recommended Extensions

| Extension | Command | Purpose |
|-----------|---------|---------|
| fof/links | `composer require fof/links` | Navigation links |
| fof/pages | `composer require fof/pages` | Static pages |
| flarum-lang/chinese-simplified | `composer require flarum-lang/chinese-simplified` | Chinese language |
| fof/username-request | `composer require fof/username-request` | Custom usernames |
| fof/reactions | `composer require fof/reactions` | Reaction system |

---

## SSO Configuration

### 1. Generate SSO Secret

```bash
# Generate a secure random string
openssl rand -hex 32
```

Example output: `a1b2c3d4e5f6...`

### 2. Configure SSO in Flarum Admin

1. Log into Flarum admin panel
2. Navigate to **Settings > Authentication**
3. Enable "Single Sign-On"
4. Enter SSO secret key
5. Set callback URL: `https://chinaconnect.example.com/api/flarum/callback`

### 3. Flarum SSO Settings

```
SSO Endpoint: https://chinaconnect.example.com/api/flarum/sso
SSO Secret: [generated-secret-key]
Allow SSO Registration: Yes
SSO Force Redirect: No
```

### 4. Update ChinaConnect Environment

Add to ChinaConnect `.env`:

```bash
# Flarum SSO Configuration
PUBLIC_FLARUM_URL=https://forum.chinaconnect.example.com
FLARUM_SSO_SECRET=a1b2c3d4e5f6...
FLARUM_API_KEY=your-flarum-api-key
```

---

## SSL & Domain Setup

### 1. Install Nginx

```bash
apt update
apt install nginx
```

### 2. Create Nginx Configuration

```bash
cat > /etc/nginx/sites-available/flarum << 'EOF'
server {
    listen 80;
    server_name forum.chinaconnect.example.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name forum.chinaconnect.example.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/forum.chinaconnect.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/forum.chinaconnect.example.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;

    # HSTS
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Proxy to Docker container
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # WebSocket support (for real-time features)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Logging
    access_log /var/log/nginx/flarum_access.log;
    error_log /var/log/nginx/flarum_error.log;
}
EOF
```

### 3. Enable Site and SSL

```bash
# Enable site
ln -s /etc/nginx/sites-available/flarum /etc/nginx/sites-enabled/

# Test configuration
nginx -t

# Reload nginx
systemctl reload nginx

# Obtain SSL certificate (if not already available)
apt install certbot python3-certbot-nginx
certbot --nginx -d forum.chinaconnect.example.com
```

### 4. Auto-renewal Setup

```bash
# Test auto-renewal
certbot renew --dry-run

# Add to crontab
crontab -e
# Add line:
# 0 0 * * * certbot renew --quiet
```

---

## ChinaConnect Integration

### 1. Integration Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                    ChinaConnect Astro                        │
│                                                              │
│  ┌─────────────┐     ┌────────────────┐                    │
│  │ Auth Page   │────▶│ SSO Client     │                    │
│  │ /auth       │     │ lib/flarum/    │                    │
│  └─────────────┘     │ sso-client.ts  │                    │
│                      └───────┬────────┘                    │
│                              │                             │
│                              ▼                             │
│                      ┌────────────────┐                    │
│                      │ Redirect to    │                    │
│                      │ Flarum + SSO  │                    │
│                      └────────────────┘                    │
└──────────────────────────────────────────────────────────────┘
```

### 2. Integration Points

| Page/Component | Integration | File |
|----------------|-------------|------|
| `/community` | Main forum page | `src/pages/community.astro` |
| `CommunityWidget` | Reusable component | `src/components/flarum/CommunityWidget.tsx` |
| Navigation | Forum link | `src/layouts/*` |
| User Profile | Forum badge | `src/components/user/*` |

### 3. SSO Flow

1. User logs into ChinaConnect via Supabase Auth
2. User navigates to `/community`
3. `CommunityWidget` detects authenticated user
4. SSO client generates Flarum-compatible token:
   - Payload: `{ userId, email, displayName, avatarUrl, timestamp }`
   - Signature: HMAC-SHA256 of payload
5. User redirected to Flarum with SSO parameters
6. Flarum validates signature and creates session

### 4. Required Code Files

```
src/
├── lib/flarum/
│   ├── sso-client.ts      # SSO token generation
│   └── api-client.ts      # Flarum API client
├── components/flarum/
│   └── CommunityWidget.tsx # Integration component
└── pages/
    └── community.astro     # Forum entry page
```

### 5. Testing Integration

```bash
# Local testing
cd /path/to/chinaconnect

# Set test environment
export PUBLIC_FLARUM_URL=https://forum.chinaconnect.example.com
export FLARUM_SSO_SECRET=your-test-secret
export FLARUM_API_KEY=your-test-api-key

# Start dev server
pnpm dev

# Navigate to /community
# Verify SSO redirect works
```

---

## Environment Variables

### ChinaConnect (.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `PUBLIC_FLARUM_URL` | Flarum forum URL | `https://forum.chinaconnect.example.com` |
| `FLARUM_SSO_SECRET` | SSO secret key (32+ chars) | `a1b2c3d4...` |
| `FLARUM_API_KEY` | Flarum API key | `flarum-api-key-from-admin` |

### Flarum (flarum/.env)

| Variable | Description | Example |
|----------|-------------|---------|
| `MYSQL_ROOT_PASSWORD` | MySQL root password | `secure-root-pass` |
| `MYSQL_DATABASE` | Database name | `flarum` |
| `MYSQL_USER` | Database user | `flarum` |
| `MYSQL_PASSWORD` | Database password | `secure-db-pass` |

---

## Troubleshooting

### Common Issues

#### 1. SSO Login Fails

**Symptoms:** User redirected but not logged in

**Solutions:**
```bash
# Verify SSO secret matches
# Check Flarum admin panel: Settings > Authentication

# Verify timestamp
# SSO tokens expire after 5 minutes

# Check signature
# Use browser dev tools to inspect sso= and sig= parameters
```

#### 2. Cannot Connect to Flarum

**Symptoms:** Connection timeout or 502 error

**Solutions:**
```bash
# Check if container is running
docker ps | grep flarum

# Check container logs
docker-compose logs flarum

# Verify port binding
netstat -tlnp | grep 8080

# Restart services
docker-compose restart
```

#### 3. Database Connection Error

**Symptoms:** "Unable to connect to database"

**Solutions:**
```bash
# Verify MySQL is running
docker ps | grep mysql

# Check MySQL logs
docker-compose logs mysql

# Test connection
docker exec -it flarum-mysql mysql -u flarum -p
```

#### 4. SSL Certificate Issues

**Symptoms:** Mixed content warnings, redirect loops

**Solutions:**
```bash
# Check certificate
certbot certificates

# Force renewal if expired
certbot renew --force-renewal

# Verify nginx config
nginx -t

# Reload nginx
systemctl reload nginx
```

### Debug Commands

```bash
# View all logs
docker-compose logs -f

# View specific service
docker-compose logs -f flarum

# Enter container shell
docker exec -it flarum bash

# Check PHP version
docker exec -it flarum php -v

# Clear Flarum cache
docker exec -it flarum php flarum cache:clear

# Rebuild assets
docker exec -it flarum php flarum assets:publish
```

### Health Check

```bash
# Create health check script
cat > /opt/flarum/healthcheck.sh << 'EOF'
#!/bin/bash
set -e

# Check Docker containers
docker ps | grep -q flarum
docker ps | grep -q flarum-mysql

# Check HTTP response
curl -sf https://forum.chinaconnect.example.com/api/health || exit 1

echo "All checks passed"
EOF

chmod +x /opt/flarum/healthcheck.sh

# Add to crontab for monitoring
# */5 * * * * /opt/flarum/healthcheck.sh >> /var/log/flarum-health.log 2>&1
```

---

## Security Checklist

- [ ] MySQL root password changed from default
- [ ] MySQL user password is strong (32+ random chars)
- [ ] Flarum admin password is strong
- [ ] SSO secret is unique and secure
- [ ] SSL certificate is valid and auto-renewing
- [ ] Nginx configured with modern TLS protocols
- [ ] HSTS header enabled
- [ ] Firewall configured (only 80, 443, 22 open)
- [ ] Docker containers running with `--restart always`
- [ ] Regular backups configured

---

## Backup & Recovery

### Backup Script

```bash
cat > /opt/flarum/backup.sh << 'EOF'
#!/bin/bash
set -e
BACKUP_DIR=/opt/backups/flarum
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p $BACKUP_DIR

# Backup MySQL
docker exec flarum-mysql mysqldump -u root -p$MYSQL_ROOT_PASSWORD flarum > $BACKUP_DIR/db_$DATE.sql

# Backup files
tar -czf $BACKUP_DIR/files_$DATE.tar.gz -C /opt/flarum html assets

# Keep only last 7 backups
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup complete: $DATE"
EOF

chmod +x /opt/flarum/backup.sh
```

### Restore Procedure

```bash
# Stop services
cd /opt/flarum
docker-compose down

# Restore database
docker exec -i flarum-mysql mysql -u root -p$MYSQL_ROOT_PASSWORD flarum < /opt/backups/flarum/db_YYYYMMDD_HHMMSS.sql

# Restore files
tar -xzf /opt/backups/flarum/files_YYYYMMDD_HHMMSS.tar.gz -C /opt/flarum

# Restart services
docker-compose up -d
```

---

## Support Resources

- **Flarum Documentation:** https://docs.flarum.org/
- **Flarum Forum:** https://discuss.flarum.org/
- **Docker Hub:** https://hub.docker.com/r/mondedie/flarum
- **SSO Plugin:** https://github.com/Flamarke/flarum-sso

---

_Last updated: 2026-05-27_
