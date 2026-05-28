#!/bin/bash
# ============================================================
# Flarum Health Check Script
# Runs every 5 minutes via cron: */5 * * * * /opt/flarum/scripts/healthcheck.sh
# ============================================================

set -e

# Configuration
FLARUM_DIR="/opt/flarum"
FLARUM_URL="${FLARUM_URL:-https://community.chinaconnect.com}"
LOG_FILE="/var/log/flarum-health.log"

# Load environment variables
if [ -f "$FLARUM_DIR/.env" ]; then
    export $(grep -v '^#' "$FLARUM_DIR/.env" | xargs)
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

ERRORS=0

# Check Docker containers
log "Checking Docker containers..."

if ! docker ps | grep -q chinaconnect-flarum; then
    log "ERROR: Flarum container not running"
    ERRORS=$((ERRORS + 1))
else
    log "OK: Flarum container running"
fi

if ! docker ps | grep -q chinaconnect-flarum-db; then
    log "ERROR: MySQL container not running"
    ERRORS=$((ERRORS + 1))
else
    log "OK: MySQL container running"
fi

if ! docker ps | grep -q chinaconnect-flarum-redis; then
    log "WARNING: Redis container not running"
    # Redis is optional, don't count as error
else
    log "OK: Redis container running"
fi

# Check MySQL connectivity
log "Checking MySQL connectivity..."
if docker exec chinaconnect-flarum-db mysqladmin ping -h localhost -u root -p"$MYSQL_ROOT_PASSWORD" 2>/dev/null; then
    log "OK: MySQL responding to ping"
else
    log "ERROR: Cannot connect to MySQL"
    ERRORS=$((ERRORS + 1))
fi

# Check HTTP response
log "Checking HTTP response..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$FLARUM_URL/" 2>/dev/null || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    log "OK: Flarum responding (HTTP $HTTP_CODE)"
else
    log "ERROR: Flarum returned HTTP $HTTP_CODE"
    ERRORS=$((ERRORS + 1))
fi

# Check HTTPS (if using SSL)
HTTPS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "https://community.chinaconnect.com/" 2>/dev/null || echo "000")
if [ "$HTTPS_CODE" = "200" ]; then
    log "OK: HTTPS working (HTTP $HTTPS_CODE)"
else
    log "WARNING: HTTPS returned HTTP $HTTPS_CODE"
fi

# Report results
if [ $ERRORS -eq 0 ]; then
    log "STATUS: OK - All checks passed"
    echo "OK"
    exit 0
else
    log "STATUS: ERROR - $ERRORS check(s) failed"
    echo "ERROR: $ERRORS check(s) failed"
    exit 1
fi