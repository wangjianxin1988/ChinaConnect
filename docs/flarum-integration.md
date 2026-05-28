# ChinaConnect Flarum Integration Plan

> **Version:** 1.1 | **Date:** 2026-05-28 | **Project:** ChinaConnect
> **Status:** Decision Made - Standalone Deployment Recommended

---

## Table of Contents

1. [Decision Summary](#decision-summary)
2. [Architecture Overview](#architecture-overview)
3. [Deployment Options Comparison](#deployment-options-comparison)
4. [Recommended Solution: Standalone Flarum](#recommended-solution-standalone-flarum)
5. [Docker Configuration](#docker-configuration)
6. [SSO Integration with Supabase](#sso-integration-with-supabase)
7. [Domain & SSL Setup](#domain--ssl-setup)
8. [ChinaConnect Main Site Integration](#chinaconnect-main-site-integration)
9. [Deployment Commands](#deployment-commands)
10. [Monitoring & Backup](#monitoring--backup)
11. [Cost Analysis](#cost-analysis)

---

## Decision Summary

### Chosen Approach: Standalone Flarum Deployment

**Rationale:**
| Factor | Standalone Flarum | Embedded React | Verdict |
|--------|-----------------|----------------|---------|
| SEO for forum content | Excellent (own URL) | Poor (no index) | Standalone wins |
| AI agent indexing | Natural (web crawlers) | Requires API | Standalone wins |
| Maintenance burden | Higher (PHP + DB) | Lower (pure JS) | React wins |
| Feature richness | Full forum features | Limited UI | Standalone wins |
| User experience | Seamless SSO | Seamless SSO | Tie |
| Data isolation | Complete separation | Shared DB | Tie |

**Decision:** Standalone Flarum at `community.chinaconnect.com` with Supabase SSO

**Key Benefits:**
- AI agents (GPTBot, ClaudeBot) can index community content natively
- Full Flarum extension ecosystem (gamification, SEO, moderation)
- Complete data isolation (forum data separate from main DB)
- Professional forum experience with proper threading, search, user ranks

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    ChinaConnect Main Site                       │
│                 (Astro + Cloudflare Pages)                       │
│                      https://chinaconnect.com                    │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │   Supabase  │───▶│  SSO Client  │───▶│  Flarum API  │     │
│  │    Auth     │    │  (Edge Fn)   │    │              │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS (SSO redirect)
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Flarum Forum (Standalone)                   │
│               https://community.chinaconnect.com                │
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│  │  SSO Plugin  │───▶│    MySQL     │    │    Redis     │     │
│  │ (byBlomming) │    │  (Flarum DB) │    │   (Cache)    │     │
│  └──────────────┘    └──────────────┘    └──────────────┘     │
└─────────────────────────────────────────────────────────────────┘
```

### Data Flow

```
1. User logs into ChinaConnect (Supabase Auth)
                    ↓
2. User clicks "Community" nav link
                    ↓
3. Edge Function generates SSO token:
   - Payload: { userId, email, displayName, avatarUrl, timestamp }
   - Signature: HMAC-SHA256(secret)
                    ↓
4. Redirect to Flarum with SSO parameters:
   https://community.chinaconnect.com?sso=BASE64&sig=SIGNATURE
                    ↓
5. Flarum validates signature, creates/matches user session
                    ↓
6. User lands on forum as authenticated user
```

---

## Deployment Options Comparison

### Option A: Traditional VPS (Recommended for this scale)

| Provider | Spec | Monthly Cost | Notes |
|----------|------|-------------|-------|
| Vultr | 4 vCPU / 8GB RAM / 160GB SSD | ~$48/mo | Los Angeles or Tokyo |
| DigitalOcean | 4 vCPU / 8GB RAM / 160GB SSD | ~$48/mo | NYC or SF |
| Hetzner | 4 vCPU / 8GB RAM / 160GB SSD | ~€25/mo | Nuremberg (EU) |
| 阿里云 ECS | 2 vCPU / 4GB RAM / 80GB SSD | ~¥150/mo | 北京/上海 |

**Pros:** Full control, predictable cost, good performance
**Cons:** Requires manual server management

### Option B: Cloudflare Workers + Durable Objects

| Component | Cost |
|-----------|------|
| Workers | Free (10ms CPU time limit per request) |
| Durable Objects | $0.15/million ops |
| R2 Database (if used) | $0.021/GB/mo |

**Pros:** Serverless, auto-scaling, global CDN
**Cons:** Workers PHP support limited, would need PHP-compatible runtime

### Option C: Fly.io / Render / Railway

| Provider | Free Tier | Paid Tier |
|----------|----------|-----------|
| Render | 750h/month | $7/mo for hobby instance |
| Fly.io | 3 shared VMs | $2/mo extra |
| Railway | $5 credit/month | Pay-as-you-go |

**Pros:** Easy deployment, managed infrastructure
**Cons:** Free tier often insufficient for forum

### Option D: Docker on Existing Infrastructure

If you have an existing server running other services:

```yaml
# Add to existing docker-compose.yml
flarum:
  image: ghcr.io/mondedie/flarum:latest
  restart: always
  ports:
    - "8080:80"
  volumes:
    - ./flarum/html:/var/www/html
    - ./flarum/assets:/var/www/html/assets
  depends_on:
    - flarum-db
  environment:
    - DEBUG=false
  networks:
    - app-network

flarum-db:
  image: mysql:8.0
  restart: always
  environment:
    - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
    - MYSQL_DATABASE=flarum
    - MY_DATABASE=${MYSQL_USER}
    - MYSQL_PASSWORD=${MYSQL_PASSWORD}
  volumes:
    - flarum-mysql-data:/var/lib/mysql
  networks:
    - app-network
```

---

## Recommended Solution: Standalone Flarum

### Server Requirements

| Resource | Minimum | Recommended | For ChinaConnect |
|----------|---------|-------------|-----------------|
| CPU | 2 vCPU | 4 vCPU | 2 vCPU (start) |
| RAM | 2 GB | 4 GB | 2 GB |
| Storage | 20 GB | 40 GB | 40 GB (growth) |
| Bandwidth | Unlimited | Unlimited | Unlimited |

### Domain Configuration

```
# DNS Records (Cloudflare)
A    community.chinaconnect.com    → SERVER_IP    (Proxied)
TXT  _flarum-verification         → (if needed)

# Future SSL will be auto-managed by certbot/Let's Encrypt
```

---

## Docker Configuration

### Directory Structure

```
D:\suoyouxiangmu\chinaconnect\
├── flarum\
│   ├── docker-compose.yml
│   ├── .env
│   ├── nginx\
│   │   └── flarum.conf
│   ├── ssl\
│   │   └── (certbot will populate)
│   ├── backup\
│   │   └── (daily backups)
│   ├── scripts\
│   │   ├── deploy.sh
│   │   ├── backup.sh
│   │   ├── restore.sh
│   │   └── healthcheck.sh
│   └── README.md
└── docs\
    └── flarum-integration.md  ← This file
```

### docker-compose.yml

```yaml
version: "3.8"

services:
  flarum:
    image: ghcr.io/mondedie/flarum:latest
    container_name: chinaconnect-flarum
    restart: always
    ports:
      - "8080:80"
    volumes:
      - ./html:/var/www/html
      - ./assets:/var/www/html/assets
    depends_on:
      flarum-db:
        condition: service_healthy
    environment:
      - DEBUG=false
    networks:
      - flarum-net
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost/"]
      interval: 30s
      timeout: 10s
      retries: 3
      start_period: 60s

  flarum-db:
    image: mysql:8.0
    container_name: chinaconnect-flarum-db
    restart: always
    environment:
      - MYSQL_ROOT_PASSWORD=${MYSQL_ROOT_PASSWORD}
      - MYSQL_DATABASE=flarum
      - MYSQL_USER=${MYSQL_USER}
      - MYSQL_PASSWORD=${MYSQL_PASSWORD}
    volumes:
      - flarum-mysql-data:/var/lib/mysql
    networks:
      - flarum-net
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    command: >
      --default-authentication-plugin=mysql_native_password
      --character-set-server=utf8mb4
      --collation-server=utf8mb4_unicode_ci
      --max_connections=200
      --innodb_buffer_pool_size=512M

  redis:
    image: redis:7-alpine
    container_name: chinaconnect-flarum-redis
    restart: always
    networks:
      - flarum-net
    volumes:
      - flarum-redis-data:/data

networks:
  flarum-net:
    driver: bridge

volumes:
  flarum-mysql-data:
  flarum-redis-data:
```

### .env File

```bash
# Flarum Docker Environment
# Location: D:\suoyouxiangmu\chinaconnect\flarum\.env

# MySQL Configuration
MYSQL_ROOT_PASSWORD=CHANGE_ME_generate_with_openssl_rand_hex_32
MYSQL_DATABASE=flarum
MYSQL_USER=flarum_user
MYSQL_PASSWORD=CHANGE_ME_generate_with_openssl_rand_hex_32

# Site Configuration
SITE_NAME=ChinaConnect Community
SITE_URL=https://community.chinaconnect.com
SITE_EMAIL=admin@chinaconnect.com

# Flarum SSO (for Supabase integration)
FLARUM_SSO_SECRET=CHANGE_ME_generate_with_openssl_rand_hex_32
```

### Nginx Configuration (for reverse proxy + SSL)

```nginx
# D:\suoyouxiangmu\chinaconnect\flarum\nginx\flarum.conf

# HTTP → HTTPS redirect
server {
    listen 80;
    server_name community.chinaconnect.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS main server
server {
    listen 443 ssl http2;
    server_name community.chinaconnect.com;

    # SSL Configuration (certbot will update this)
    ssl_certificate /etc/letsencrypt/live/community.chinaconnect.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/community.chinaconnect.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # Access/Error logs
    access_log /var/log/nginx/flarum_access.log;
    error_log /var/log/nginx/flarum_error.log;

    # Proxy to Flarum Docker container
    location / {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;

        # WebSocket support (for Flarum real-time)
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    # Static assets caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        proxy_pass http://127.0.0.1:8080;
        proxy_set_header Host $host;
        proxy_cache_valid 200 7d;
        expires 7d;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## SSO Integration with Supabase

### Architecture

```
┌──────────────────────────────────────────────────────────┐
│              ChinaConnect (Cloudflare Pages)              │
│                                                           │
│  1. User authenticates via Supabase Auth                  │
│  2. Frontend requests SSO token from Edge Function        │
│  3. Edge Function generates signed SSO payload            │
│  4. Redirect user to Flarum with SSO params               │
└──────────────────────────────────────────────────────────┘
                            │
              GET /flarum/sso?return_url=...
                            ▼
┌──────────────────────────────────────────────────────────┐
│           Cloudflare Workers (Edge Function)              │
│                                                           │
│  import { createHmac } from 'crypto'                       │
│                                                           │
│  const payload = JSON.stringify({                         │
│    userId: supabase_user_id,                              │
│    email: user_email,                                     │
│    displayName: user_display_name,                         │
│    avatarUrl: user_avatar_url,                            │
│    groups: user_badges || [],                             │
│    timestamp: Date.now()                                  │
│  });                                                      │
│                                                           │
│  const signature = createHmac('sha256', SSO_SECRET)        │
│    .update(payload).digest('hex');                         │
│                                                           │
│  const ssoToken = Buffer.from(payload).toString('base64'); │
│  const redirectUrl = `${FLARUM_URL}?sso=${ssoToken}&sig=${signature}`; │
└──────────────────────────────────────────────────────────┘
                            │
              https://community.chinaconnect.com?sso=...&sig=...
                            ▼
┌──────────────────────────────────────────────────────────┐
│                    Flarum Forum                           │
│                                                           │
│  5. Flarum SSO extension validates token                  │
│  6. Creates or matches user in Flarum DB                  │
│  7. Establishes session, redirects to intended page       │
└──────────────────────────────────────────────────────────┘
```

### Flarum SSO Extension

Install **byBlomming/flarum-sso** extension on Flarum:

```bash
# SSH into Flarum container
docker exec -it chinaconnect-flarum bash
cd /var/www/html

# Install SSO extension
composer require byblomming/flarum-sso

# Enable extension
php flarum extension:enable byblomming-sso

# Clear cache
php flarum cache:clear
```

### Flarum Admin SSO Configuration

1. Login to Flarum admin: `https://community.chinaconnect.com/admin`
2. Navigate to **Settings → Authentication**
3. Configure SSO:

```
SSO Endpoint: https://chinaconnect.com/api/flarum/sso
SSO Secret: [32+ character random string]
Allow SSO Registration: Yes
Auto-create accounts: Yes
Force SSO Redirect: No
```

### Required Environment Variables

**ChinaConnect (.env):**
```bash
# Flarum SSO Configuration
PUBLIC_FLARUM_URL=https://community.chinaconnect.com
FLARUM_SSO_SECRET=CHANGE_ME_generate_with_openssl_rand_hex_32
```

**Cloudflare Pages (Dashboard → Settings → Environment Variables):**
```bash
FLARUM_SSO_SECRET=your-secret-here
```

---

## Domain & SSL Setup

### Cloudflare DNS Configuration

```
# Cloudflare Dashboard → chinaconnect.com → DNS
Type    Name                    Content              Proxy
A       community               SERVER_PUBLIC_IP     Proxied (orange)
```

### Let's Encrypt SSL (on server)

```bash
# SSH into server
ssh root@SERVER_IP

# Install certbot
apt update && apt install certbot python3-certbot-nginx

# Obtain certificate
certbot --nginx -d community.chinaconnect.com

# Auto-renewal (should already be configured)
certbot renew --dry-run
```

### SSL Certificate Auto-Renewal

```bash
# Add to crontab
crontab -e
# Add line:
0 0 * * * certbot renew --quiet --deploy-hook "systemctl reload nginx"
```

---

## ChinaConnect Main Site Integration

### Navigation Integration

**File:** `src/layouts/Layout.astro` (or header component)

```astro
<!-- Add to navigation -->
<a href="/community" class="nav-link">
  Community
</a>
```

### Community Page

**File:** `src/pages/community.astro`

```astro
---
// Redirect to Flarum with SSO
import { redirect } fromastro:transitions/client';

const flarumUrl = import.meta.env.PUBLIC_FLARUM_URL || 'https://community.chinaconnect.com';
---

<html>
<head>
  <meta http-equiv="refresh" content={`0;url=${flarumUrl}`} />
</head>
<body>
  <p>Redirecting to community... <a href={flarumUrl}>Click here</a></p>
</body>
</html>
```

**Better approach - Client-side SSO redirect:**

**File:** `src/components/community/CommunityRedirect.tsx`

```typescript
import { useEffect } from 'react';
import { supabase } from '@/supabase/config';

export function CommunityRedirect() {
  useEffect(() => {
    const redirectToForum = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        // Call edge function to get SSO token
        const response = await fetch('/api/flarum-sso', {
          headers: { 'Authorization': `Bearer ${session.access_token}` }
        });
        const { ssoUrl } = await response.json();
        window.location.href = ssoUrl;
      } else {
        // Redirect to Flarum login page
        window.location.href = 'https://community.chinaconnect.com';
      }
    };
    
    redirectToForum();
  }, []);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-lg text-gray-600">Connecting to community...</p>
        <p className="text-sm text-gray-400 mt-2">You will be redirected to our forum</p>
      </div>
    </div>
  );
}
```

### SSO Edge Function

**File:** `functions/flarum-sso/index.ts` (Supabase Edge Function)

```typescript
// Supabase Edge Function for Flarum SSO
import { createClient } from '@supabase/supabase-js';
import { createHmac, timingSafeEqual } from 'crypto';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DenoEnv {
  FLARUM_URL: string;
  FLARUM_SSO_SECRET: string;
}

interface SSOPayload {
  userId: string;
  email: string;
  displayName: string;
  avatarUrl: string | null;
  groups: string[];
  timestamp: number;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const flarumUrl = Deno.env.get('FLARUM_URL') || 'https://community.chinaconnect.com';
    const ssoSecret = Deno.env.get('FLARUM_SSO_SECRET')!;

    // Verify auth
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('display_name, avatar_url, badges')
      .eq('id', user.id)
      .single();

    // Build SSO payload
    const payload: SSOPayload = {
      userId: user.id,
      email: user.email || '',
      displayName: profile?.display_name || user.email?.split('@')[0] || 'User',
      avatarUrl: profile?.avatar_url || null,
      groups: profile?.badges || [],
      timestamp: Math.floor(Date.now() / 1000),
    };

    // Sign payload
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString('base64');
    const signature = createHmac('sha256', ssoSecret)
      .update(payloadStr)
      .digest('hex');

    // Build redirect URL
    const returnUrl = new URL(req.url).searchParams.get('return_url') || '/';
    const ssoUrl = new URL(`${flarumUrl}/auth/SSOLogin`);
    ssoUrl.searchParams.set('sso', payloadStr);
    ssoUrl.searchParams.set('sig', signature);

    return new Response(JSON.stringify({
      ssoUrl: ssoUrl.toString(),
      payload,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

### Deploy Edge Function

```bash
cd D:\suoyouxiangmu\chinaconnect
supabase functions deploy flarum-sso
```

---

## Deployment Commands

### Initial Deployment

```bash
# 1. Copy Flarum directory to server
scp -r D:\suoyouxiangmu\chinaconnect\flarum\ root@SERVER_IP:/opt/

# 2. SSH into server
ssh root@SERVER_IP

# 3. Navigate to Flarum directory
cd /opt/flarum

# 4. Generate secure passwords
openssl rand -hex 32   # Use for MYSQL_ROOT_PASSWORD and MYSQL_PASSWORD
openssl rand -hex 32   # Use for FLARUM_SSO_SECRET

# 5. Edit .env with generated passwords
nano .env

# 6. Start containers
docker-compose up -d

# 7. Wait for Flarum to initialize (check logs)
docker-compose logs -f flarum
# Wait until you see "Starting Apache" or "Flarum is ready"

# 8. Complete Flarum web installation
# Open browser to http://SERVER_IP:8080
# Fill in admin account details
# Set forum title: "ChinaConnect Community"

# 9. Install required extensions
docker exec -it chinaconnect-flarum bash -c "composer require fof/links fof/pages flarum-lang/chinese-simplified"
docker exec -it chinaconnect-flarum bash -c "php flarum extension:enable fof-links fof-pages chinese-simplified"

# 10. Configure SSO in Flarum admin panel
# Settings → Authentication → SSO
# Enter the endpoint and secret

# 11. Configure Nginx + SSL
cp nginx/flarum.conf /etc/nginx/sites-available/flarum
ln -s /etc/nginx/sites-available/flarum /etc/nginx/sites-enabled/
certbot --nginx -d community.chinaconnect.com

# 12. Restart services
systemctl reload nginx
docker-compose restart
```

### Update Deployment

```bash
cd /opt/flarum
docker-compose pull
docker-compose up -d --force-recreate flarum
docker exec chinaconnect-flarum php flarum cache:clear
```

### Rollback

```bash
cd /opt/flarum
docker-compose down
docker-compose -f docker-compose.backup.yml up -d
```

---

## Monitoring & Backup

### Health Check Script

**File:** `scripts/healthcheck.sh`

```bash
#!/bin/bash
# D:\suoyouxiangmu\chinaconnect\flarum\scripts\healthcheck.sh

set -e

FLARUM_URL="${FLARUM_URL:-https://community.chinaconnect.com}"
LOG_FILE="/var/log/flarum-health.log"

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Check Docker containers
if ! docker ps | grep -q chinaconnect-flarum; then
    log "ERROR: Flarum container not running"
    exit 1
fi

if ! docker ps | grep -q chinaconnect-flarum-db; then
    log "ERROR: MySQL container not running"
    exit 1
fi

# Check HTTP response
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FLARUM_URL/")
if [ "$HTTP_CODE" != "200" ]; then
    log "ERROR: Flarum returned HTTP $HTTP_CODE"
    exit 1
fi

# Check database connectivity
if ! docker exec chinaconnect-flarum-db mysqladmin ping -h localhost -u root -p"$MYSQL_ROOT_PASSWORD" 2>/dev/null; then
    log "ERROR: Cannot ping MySQL"
    exit 1
fi

log "OK: All health checks passed"
exit 0
```

### Backup Script

**File:** `scripts/backup.sh`

```bash
#!/bin/bash
# D:\suoyouxiangmu\chinaconnect\flarum\scripts\backup.sh

set -e

BACKUP_DIR="/opt/backups/flarum"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=7

mkdir -p "$BACKUP_DIR"

# Backup MySQL
log "Backing up MySQL database..."
docker exec chinaconnect-flarum-db mysqldump \
    -u root -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    flarum | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"

# Backup files
log "Backing up Flarum files..."
tar -czf "$BACKUP_DIR/files_${DATE}.tar.gz" \
    -C /opt/flarum html assets vendor 2>/dev/null || true

# Backup extensions
tar -czf "$BACKUP_DIR/vendor_${DATE}.tar.gz" \
    -C /opt/flarum vendor 2>/dev/null || true

# Upload to Cloudflare R2 (optional)
# rclone copy "$BACKUP_DIR/db_${DATE}.sql.gz" r2:chinaconnect-backups/flarum/

# Cleanup old backups
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${KEEP_DAYS} -delete
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +${KEEP_DAYS} -delete

log "Backup complete: $DATE"
```

### Restore Procedure

```bash
#!/bin/bash
# Restore from backup
cd /opt/flarum

# Stop services
docker-compose down

# Restore database
gunzip < /opt/backups/flarum/db_YYYYMMDD_HHMMSS.sql.gz | \
    docker exec -i chinaconnect-flarum-db mysql -u root -p"$MYSQL_ROOT_PASSWORD" flarum

# Restore files
tar -xzf /opt/backups/flarum/files_YYYYMMDD_HHMMSS.tar.gz -C /opt/flarum

# Restart services
docker-compose up -d

# Clear Flarum cache
docker exec chinaconnect-flarum php flarum cache:clear
```

### Cron Schedule

```bash
# Add to crontab (crontab -e)
# Health check every 5 minutes
*/5 * * * * /opt/flarum/scripts/healthcheck.sh >> /var/log/flarum-health.log 2>&1

# Daily backup at 3 AM
0 3 * * * /opt/flarum/scripts/backup.sh >> /var/log/flarum-backup.log 2>&1

# SSL certificate check weekly
0 0 * * 0 certbot certificates | grep -q "community.chinaconnect.com" || certbot renew
```

---

## Cost Analysis

### Monthly Cost Breakdown (VPS Option)

| Item | Cost | Notes |
|------|------|-------|
| VPS (Vultr 4vCPU/8GB) | $48/mo | or ~¥150/mo on 阿里云 |
| Domain (community.chinaconnect.com) | $0 | Already have chinaconnect.com |
| SSL Certificate | $0 | Let's Encrypt (free) |
| Cloudflare CDN | $0 | Free tier includes proxy |
| Backup storage (R2) | ~$0.50/mo | ~50GB/month usage |
| **Total** | **~$48.50/mo** | ~¥350/mo |

### Supabase Cost (if on paid plan)

| Item | Free | Pro ($25/mo) |
|------|------|--------------|
| Users | 50k MAU | 100k MAU |
| Database | 500MB | 8GB |
| API requests | Unlimited | Unlimited |
| Bandwidth | Unlimited | Unlimited |

### Comparison with Embedded React

| Item | Standalone Flarum | Embedded React | Difference |
|------|------------------|----------------|------------|
| Server cost | +$48/mo | $0 | +$48/mo |
| Maintenance | +2h/month | +0.5h/month | +1.5h/month |
| SEO value | High | Low | Significant |
| AI indexing | Native | Requires API | Significant |

---

## Migration Path from Current Mock Community

The current React-based community components (CommunityHub, PostCard, Leaderboard, etc.) are **not replaced** by Flarum. Instead:

1. **Forum content** → Flarum (travel discussions, Q&A, user interactions)
2. **Check-in/points system** → Keep current Supabase-based system (integrates with main site)
3. **Community Hub page** → Redirect to Flarum OR show a hybrid widget

### Hybrid Approach

```typescript
// src/components/community/CommunityHub.tsx

// Show check-in leaderboard from Supabase (main site feature)
// But link to Flarum for detailed discussions

<a href="https://community.chinaconnect.com" class="...">
  Join the discussion on our forum →
</a>
```

### Data Migration Plan (if switching fully to Flarum)

| Data Type | Source | Destination | Method |
|----------|--------|-------------|--------|
| User profiles | Supabase profiles | Flarum users | SSO auto-creates |
| Travel diaries | Supabase posts | Flarum discussions | Manual export+import or API |
| Check-ins | Supabase check_ins | Flarum posts | Keep Supabase (main site feature) |
| Q&A posts | Supabase posts | Flarum Q&A extension | Manual export |

---

## Implementation Checklist

### Pre-Deployment
- [ ] Choose hosting provider and provision server
- [ ] Configure DNS: `community.chinaconnect.com` A record
- [ ] Generate all secrets (MySQL passwords, SSO secret)
- [ ] Update docker-compose.yml with secure passwords

### Deployment
- [ ] Deploy Docker containers
- [ ] Complete Flarum web installer
- [ ] Install extensions: fof/links, fof/pages, flarum-lang/chinese-simplified, byblomming-sso
- [ ] Configure SSO in Flarum admin
- [ ] Configure Nginx + obtain SSL certificate
- [ ] Verify HTTPS is working

### Integration
- [ ] Deploy Supabase Edge Function for SSO
- [ ] Update ChinaConnect .env with Flarum URL and SSO secret
- [ ] Create /community page with SSO redirect
- [ ] Add "Community" link to navigation
- [ ] Test complete SSO flow (login → redirect → auto-login)

### Post-Deployment
- [ ] Configure backup script and verify backups
- [ ] Configure health check and monitoring
- [ ] Document server access credentials in password manager
- [ ] Update ARCHITECTURE.md with Flarum status

---

## References

- [Flarum Documentation](https://docs.flarum.org/)
- [mondedie/flarum Docker Image](https://hub.docker.com/r/mondedie/flarum)
- [byBlomming SSO Extension](https://github.com/byblomming/flarum-sso)
- [Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

_Last updated: 2026-05-28_