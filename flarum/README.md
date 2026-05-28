# ChinaConnect Flarum Forum - Deployment Guide

> **Version:** 1.0 | **Date:** 2026-05-28 | **Project:** ChinaConnect

This directory contains all configuration and scripts for deploying Flarum forum.

---

## Quick Start

```bash
# 1. SSH into server
ssh root@YOUR_SERVER_IP

# 2. Navigate to Flarum directory
cd /opt/flarum

# 3. Edit .env with secure passwords
nano .env

# 4. Start Flarum
docker-compose up -d

# 5. Follow the web installer
# Open http://YOUR_SERVER_IP:8080 in browser

# 6. Configure Nginx + SSL
cp nginx/flarum.conf /etc/nginx/sites-available/flarum
ln -s /etc/nginx/sites-available/flarum /etc/nginx/sites-enabled/
certbot --nginx -d community.chinaconnect.com

# 7. Reload Nginx
systemctl reload nginx
```

---

## Directory Structure

```
flarum/
├── docker-compose.yml    # Docker services definition
├── .env                  # Environment variables (generate passwords!)
├── nginx/
│   └── flarum.conf      # Nginx reverse proxy config
├── scripts/
│   ├── deploy.sh        # Deployment script
│   ├── backup.sh        # Daily backup script
│   ├── healthcheck.sh   # Health monitoring script
│   └── restore.sh       # Restore from backup
└── README.md            # This file
```

---

## Prerequisites

1. **Server:** Ubuntu 22.04 LTS with 2+ vCPU, 4GB RAM, 40GB storage
2. **Docker:** Installed and running (`docker --version`)
3. **Docker Compose:** v2+ (`docker-compose --version`)
4. **Nginx:** Installed (`apt install nginx`)
5. **Certbot:** For SSL (`apt install certbot python3-certbot-nginx`)
6. **Domain:** DNS A record pointing to server IP

---

## Initial Setup

### 1. Generate Secure Passwords

```bash
# SSH into server
ssh root@YOUR_SERVER_IP

# Generate passwords
openssl rand -hex 32   # Use for MYSQL_ROOT_PASSWORD
openssl rand -hex 32   # Use for MYSQL_PASSWORD
openssl rand -hex 32   # Use for FLARUM_SSO_SECRET
```

### 2. Edit .env File

```bash
cd /opt/flarum
nano .env
```

Update these values:
- `MYSQL_ROOT_PASSWORD` → First generated password
- `MYSQL_PASSWORD` → Second generated password
- `FLARUM_SSO_SECRET` → Third generated password

### 3. Configure DNS

In Cloudflare Dashboard:
```
Type    Name                    Content              Proxy
A       community              SERVER_PUBLIC_IP     Proxied
```

### 4. Start Flarum

```bash
cd /opt/flarum
docker-compose up -d

# Check logs
docker-compose logs -f
# Wait until "Flarum is ready" message
```

### 5. Complete Web Installation

1. Open browser: `http://YOUR_SERVER_IP:8080`
2. Fill in admin account details
3. Set forum title: "ChinaConnect Community"
4. Complete installation

### 6. Install Extensions

```bash
# SSH into Flarum container
docker exec -it chinaconnect-flarum bash

# Install required extensions
cd /var/www/html
composer require fof/links fof/pages flarum-lang/chinese-simplified byblomming/flarum-sso

# Enable extensions
php flarum extension:enable fof-links
php flarum extension:enable fof-pages
php flarum extension:enable chinese-simplified
php flarum extension:enable byblomming-sso

# Clear cache
php flarum cache:clear
```

### 7. Configure SSO

1. Login to Flarum admin: `https://community.chinaconnect.com/admin`
2. Navigate to **Settings → Authentication**
3. Configure:
   - SSO Endpoint: `https://chinaconnect.com/api/flarum/sso`
   - SSO Secret: [your generated secret]
   - Allow SSO Registration: Yes
   - Auto-create accounts: Yes

### 8. Configure Nginx + SSL

```bash
# Copy Nginx config
cp /opt/flarum/nginx/flarum.conf /etc/nginx/sites-available/flarum
ln -s /etc/nginx/sites-available/flarum /etc/nginx/sites-enabled/

# Test and reload Nginx
nginx -t
systemctl reload nginx

# Obtain SSL certificate
certbot --nginx -d community.chinaconnect.com

# Auto-renewal
certbot renew --dry-run
```

---

## Daily Operations

### Check Status

```bash
docker-compose ps
```

### View Logs

```bash
# All logs
docker-compose logs -f

# Specific service
docker-compose logs -f flarum
docker-compose logs -f flarum-db
```

### Restart Services

```bash
docker-compose restart
```

### Update Flarum

```bash
cd /opt/flarum
./scripts/deploy.sh
```

### Backup (Manual)

```bash
./scripts/backup.sh
```

### Restore from Backup

```bash
./scripts/restore.sh 20260528_030000
```

---

## Maintenance

### Health Check

```bash
# Run manually
./scripts/healthcheck.sh

# View health log
cat /var/log/flarum-health.log
```

### Cron Setup

```bash
# Edit crontab
crontab -e

# Add these lines:
# Health check every 5 minutes
*/5 * * * * /opt/flarum/scripts/healthcheck.sh >> /var/log/flarum-health.log 2>&1

# Daily backup at 3 AM
0 3 * * * /opt/flarum/scripts/backup.sh >> /var/log/flarum-backup.log 2>&1
```

### Clean Up Docker

```bash
# Remove unused containers and images
docker system prune -f

# Clean old backups
find /opt/backups/flarum -name "*.sql.gz" -mtime +30 -delete
```

---

## Troubleshooting

### Flarum Not Starting

```bash
# Check logs
docker-compose logs flarum

# Common issues:
# - Port 8080 already in use: change port mapping
# - MySQL not ready: wait longer for health check
```

### Database Connection Error

```bash
# Check MySQL
docker exec -it chinaconnect-flarum-db mysql -u root -p

# Verify credentials
grep MYSQL .env
```

### SSL Certificate Issues

```bash
# Check certificate
certbot certificates

# Force renewal
certbot renew --force-renewal

# Test Nginx config
nginx -t
systemctl reload nginx
```

### SSO Not Working

1. Verify SSO secret matches in Flarum admin and ChinaConnect .env
2. Check Edge Function logs in Supabase dashboard
3. Verify timestamp is within 5 minutes

---

## Integration with ChinaConnect

After deployment, update ChinaConnect:

1. Deploy Supabase Edge Function:
   ```bash
   supabase functions deploy flarum-sso
   ```

2. Update ChinaConnect `.env`:
   ```bash
   PUBLIC_FLARUM_URL=https://community.chinaconnect.com
   FLARUM_SSO_SECRET=your-secret-here
   ```

3. Add to Cloudflare Pages Environment Variables:
   ```
   FLARUM_SSO_SECRET=your-secret-here
   ```

4. Create `/community` page with SSO redirect

---

## Security Checklist

- [ ] All passwords in `.env` are unique and secure
- [ ] SSL certificate is valid and auto-renewing
- [ ] Nginx configured with modern TLS protocols
- [ ] HSTS header enabled
- [ ] Firewall configured (only 80, 443, 22 open)
- [ ] Docker containers running with `--restart always`
- [ ] Regular backups configured and tested
- [ ] SSO secret is 32+ characters

---

_Last updated: 2026-05-28_