#!/bin/bash
#
# Vereinskasse - Restore Script
#

set -e

if [ -z "$1" ]; then
    echo "Usage: ./restore.sh <backup_file>"
    echo "Verfügbare Backups:"
    ls -lh /app/backups/*.dump
    exit 1
fi

BACKUP_FILE=$1

echo "==================================="
echo "Restore von: $BACKUP_FILE"
echo "==================================="

echo "⚠️  WARNUNG: Dies überschreibt die aktuelle Datenbank!"
read -p "Fortfahren? (ja/nein): " confirm

if [ "$confirm" != "ja" ]; then
    echo "Abgebrochen."
    exit 0
fi

# Copy backup into container
docker cp ${BACKUP_FILE} vereinskasse-db:/tmp/restore.dump

# Restore
echo "Stelle Datenbank wieder her..."
docker exec vereinskasse-db pg_restore \
    -U ${POSTGRES_USER} \
    -d ${POSTGRES_DB} \
    --clean \
    --if-exists \
    /tmp/restore.dump

echo "✅ Datenbank wiederhergestellt!"
echo "==================================="
