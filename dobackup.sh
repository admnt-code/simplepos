cd /home/pos/+git/ClaudeColoursPOS

# Datenbank-Backup
docker compose exec postgres pg_dump -U vereinskasse vereinskasse_db > backup_$(date +%Y%m%d_%H%M%S).sql

# Code + DB Backup
tar -czf backup_complete_$(date +%Y%m%d_%H%M%S).tar.gz \
  backend/ frontend/ docker-compose.yml backup_*.sql

echo "✅ Backup erstellt!"
