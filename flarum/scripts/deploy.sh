#!/bin/bash
# ============================================================
# Flarum Deployment Script
# Usage: ./deploy.sh [options]
# Options:
#   --no-backup    Skip backup before deployment
#   --force        Force recreate containers
# ============================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
FLARUM_DIR="/opt/flarum"
LOG_FILE="$FLARUM_DIR/deploy.log"

log() {
    echo -e "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
    echo "[SUCCESS] $1" >> "$LOG_FILE"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    echo "[ERROR] $1" >> "$LOG_FILE"
}

log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
    echo "[INFO] $1" >> "$LOG_FILE"
}

# Parse arguments
SKIP_BACKUP=false
FORCE_RECREATE=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --no-backup)
            SKIP_BACKUP=true
            shift
            ;;
        --force)
            FORCE_RECREATE=true
            shift
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Check if running as root
if [ "$EUID" -ne 0 ]; then
    log_error "Please run as root (use sudo)"
    exit 1
fi

# Change to Flarum directory
cd "$FLARUM_DIR" || { log_error "Directory not found: $FLARUM_DIR"; exit 1; }

log_info "Starting Flarum deployment..."

# Backup before deployment
if [ "$SKIP_BACKUP" = false ]; then
    log_info "Creating backup..."
    ./scripts/backup.sh
    log_success "Backup complete"
fi

# Pull latest images
log_info "Pulling latest Docker images..."
docker-compose pull

# Recreate containers
if [ "$FORCE_RECREATE" = true ]; then
    log_info "Force recreating containers..."
    docker-compose up -d --force-recreate
else
    log_info "Starting containers..."
    docker-compose up -d
fi

# Wait for Flarum to be ready
log_info "Waiting for Flarum to initialize..."
for i in {1..30}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/ 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        log_success "Flarum is ready (HTTP $HTTP_CODE)"
        break
    fi
    echo -ne "  Attempt $i/30... HTTP $HTTP_CODE\r"
    sleep 5
done

if [ "$HTTP_CODE" != "200" ]; then
    log_error "Flarum failed to start. Check logs: docker-compose logs -f"
    docker-compose logs --tail=50
    exit 1
fi

# Clear Flarum cache
log_info "Clearing Flarum cache..."
docker exec chinaconnect-flarum php flarum cache:clear 2>/dev/null || true

# Verify deployment
log_info "Verifying deployment..."
CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' chinaconnect-flarum 2>/dev/null || echo "unknown")
DB_STATUS=$(docker inspect --format='{{.State.Status}}' chinaconnect-flarum-db 2>/dev/null || echo "unknown")
REDIS_STATUS=$(docker inspect --format='{{.State.Status}}' chinaconnect-flarum-redis 2>/dev/null || echo "unknown")

if [ "$CONTAINER_STATUS" = "running" ] && [ "$DB_STATUS" = "running" ] && [ "$REDIS_STATUS" = "running" ]; then
    log_success "All containers are running"
else
    log_error "Some containers are not running. Check with: docker-compose ps"
    exit 1
fi

# Reload Nginx if configured
if command -v systemctl &> /dev/null && systemctl is-active --quiet nginx; then
    log_info "Reloading Nginx..."
    systemctl reload nginx && log_success "Nginx reloaded" || log_error "Failed to reload Nginx"
fi

log_success "Flarum deployment completed!"
log_info "Access your forum at: https://community.chinaconnect.com"
log_info "Admin panel: https://community.chinaconnect.com/admin"