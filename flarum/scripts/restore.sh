#!/bin/bash
# ============================================================
# Flarum Restore Script
# Usage: ./restore.sh BACKUP_DATE
# Example: ./restore.sh 20260528_030000
# ============================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Usage: $0 BACKUP_DATE${NC}"
    echo "Example: $0 20260528_030000"
    echo ""
    echo "Available backups:"
    ls -1 /opt/backups/flarum/*.sql.gz 2>/dev/null | sed 's/.*\///' | sed 's/db_//' | sed 's/.sql.gz//' || echo "No backups found"
    exit 1
fi

BACKUP_DATE="$1"
BACKUP_DIR="/opt/backups/flarum"
FLARUM_DIR="/opt/flarum"

log() {
    echo -e "$1"
}

log_info() {
    echo -e "${YELLOW}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if backup exists
DB_BACKUP="$BACKUP_DIR/db_${BACKUP_DATE}.sql.gz"
ASSETS_BACKUP="$BACKUP_DIR/assets_${BACKUP_DATE}.tar.gz"

if [ ! -f "$DB_BACKUP" ]; then
    log_error "Database backup not found: $DB_BACKUP"
    exit 1
fi

if [ ! -f "$ASSETS_BACKUP" ]; then
    log_info "Assets backup not found: $ASSETS_BACKUP (skipping)"
fi

# Load environment variables
if [ -f "$FLARUM_DIR/.env" ]; then
    export $(grep -v '^#' "$FLARUM_DIR/.env" | xargs)
fi

log_info "Starting restore from backup: $BACKUP_DATE"
log_info "WARNING: This will stop the current Flarum instance"

read -p "Are you sure you want to continue? (yes/no): " CONFIRM
if [ "$CONFIRM" != "yes" ]; then
    log "Restore cancelled"
    exit 0
fi

# Change to Flarum directory
cd "$FLARUM_DIR"

# Stop services
log_info "Stopping Flarum containers..."
docker-compose down

# Restore database
log_info "Restoring database..."
gunzip < "$DB_BACKUP" | docker exec -i chinaconnect-flarum-db \
    mysql -u root -p"$MYSQL_ROOT_PASSWORD" flarum

if [ $? -eq 0 ]; then
    log_success "Database restored successfully"
else
    log_error "Database restore failed"
    exit 1
fi

# Restore assets
if [ -f "$ASSETS_BACKUP" ]; then
    log_info "Restoring assets..."
    tar -xzf "$ASSETS_BACKUP" -C "$FLARUM_DIR"
    log_success "Assets restored"
fi

# Restart services
log_info "Starting Flarum containers..."
docker-compose up -d

# Wait for startup
log_info "Waiting for Flarum to start..."
for i in {1..30}; do
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8080/ 2>/dev/null || echo "000")
    if [ "$HTTP_CODE" = "200" ]; then
        log_success "Flarum is back online (HTTP $HTTP_CODE)"
        break
    fi
    echo -ne "  Waiting... $i/30\r"
    sleep 3
done

# Clear cache
log_info "Clearing Flarum cache..."
docker exec chinaconnect-flarum php flarum cache:clear 2>/dev/null || true

log_success "Restore completed!"
log_info "Access your forum at: https://community.chinaconnect.com"