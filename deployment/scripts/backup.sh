#!/bin/bash
#
# Vereinskasse - Backup Script
#

set -e

BACKUP_DIR="/app/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=60

echo "==================================="
echo "Backup gestartet: $TIMESTAMP"
echo "==================================="

# PostgreSQL Backup
echo "Sichere PostgreSQL Datenbank..."
docker exec vereinskasse-db pg_dump \
    -U ${POSTGRES_USER} \
    -d ${POSTGRES_DB} \
    -F c \
    -f /tmp/backup_${TIMESTAMP}.dump

docker cp vereinskasse-db:/tmp/backup_${TIMESTAMP}.dump \
    ${BACKUP_DIR}/db_backup_${TIMESTAMP}.dump

echo "✅ Datenbank gesichert: db_backup_${TIMESTAMP}.dump"

# Application Files Backup (optional)
echo "Sichere Uploads..."
if [ -d "./backend/uploads" ]; then
    tar -czf ${BACKUP_DIR}/uploads_${TIMESTAMP}.tar.gz \
        -C ./backend uploads
    echo "✅ Uploads gesichert: uploads_${TIMESTAMP}.tar.gz"
fi

# Clean old backups
echo "Lösche alte Backups (älter als ${RETENTION_DAYS} Tage)..."
find ${BACKUP_DIR} -name "*.dump" -mtime +${RETENTION_DAYS} -delete
find ${BACKUP_DIR} -name "*.tar.gz" -mtime +${RETENTION_DAYS} -delete

echo "==================================="
echo "Backup abgeschlossen!"
echo "==================================="
