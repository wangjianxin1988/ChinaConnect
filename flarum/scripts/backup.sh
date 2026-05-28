#!/bin/bash
# ============================================================
# Flarum Backup Script
# Runs daily via cron: 0 3 * * * /opt/flarum/scripts/backup.sh
# ============================================================

set -e

# Configuration
BACKUP_DIR="/opt/backups/flarum"
FLARUM_DIR="/opt/flarum"
DATE=$(date +%Y%m%d_%H%M%S)
KEEP_DAYS=7

# Load environment variables
if [ -f "$FLARUM_DIR/.env" ]; then
    export $(grep -v '^#' "$FLARUM_DIR/.env" | xargs)
fi

log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1"
}

# Create backup directory
mkdir -p "$BACKUP_DIR"

log "Starting Flarum backup..."

# Check if containers are running
if ! docker ps | grep -q chinaconnect-flarum-db; then
    log "ERROR: MySQL container not running. Aborting backup."
    exit 1
fi

# Backup MySQL database
log "Backing up MySQL database..."
docker exec chinaconnect-flarum-db mysqldump \
    -u root -p"$MYSQL_ROOT_PASSWORD" \
    --single-transaction \
    --quick \
    --lock-tables=false \
    flarum 2>/dev/null | gzip > "$BACKUP_DIR/db_${DATE}.sql.gz"

if [ $? -eq 0 ]; then
    log "MySQL backup complete: db_${DATE}.sql.gz"
else
    log "ERROR: MySQL backup failed"
    exit 1
fi

# Backup Flarum files (only public assets, not vendor)
log "Backing up Flarum assets..."
tar -czf "$BACKUP_DIR/assets_${DATE}.tar.gz" \
    -C "$FLARUM_DIR" \
    html/assets \
    html//storage \
    2>/dev/null || log "WARNING: Some asset files could not be backed up"

if [ -f "$BACKUP_DIR/assets_${DATE}.tar.gz" ]; then
    log "Assets backup complete: assets_${DATE}.tar.gz"
fi

# Backup configuration
log "Backing up configuration..."
tar -czf "$BACKUP_DIR/config_${DATE}.tar.gz" \
    -C "$FLARUM_DIR" \
    .env \
    docker-compose.yml \
    2>/dev/null || true

# Cleanup old backups
log "Cleaning up backups older than $KEEP_DAYS days..."
find "$BACKUP_DIR" -name "*.sql.gz" -mtime +${KEEP_DAYS} -delete 2>/dev/null || true
find "$BACKUP_DIR" -name "*.tar.gz" -mtime +${KEEP_DAYS} -delete 2>/dev/null || true

# Count backups
BACKUP_COUNT=$(ls -1 "$BACKUP_DIR"/*.sql.gz 2>/dev/null | wc -l)
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)

log "Backup complete: $DATE"
log "Total backups: $BACKUP_COUNT"
log "Backup directory size: $BACKUP_SIZE"
log "Files:"
ls -lh "$BACKUP_DIR"/*${DATE}* 2>/dev/null || true