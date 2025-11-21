#!/bin/bash
#
# Vereinskasse - SSL Setup mit LetsEncrypt
#

set -e

DOMAIN="kasse.ihredomain.de"
EMAIL="admin@ihredomain.de"

echo "==================================="
echo "SSL Setup für: $DOMAIN"
echo "==================================="

# Certbot installieren
if ! command -v certbot &> /dev/null; then
    echo "Installiere Certbot..."
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
fi

# Zertifikat erstellen
echo "Erstelle LetsEncrypt Zertifikat..."
certbot certonly \
    --standalone \
    --preferred-challenges http \
    --email ${EMAIL} \
    --agree-tos \
    --no-eff-email \
    -d ${DOMAIN}

# Copy Zertifikat für Docker
mkdir -p ./docker/nginx/ssl
cp /etc/letsencrypt/live/${DOMAIN}/fullchain.pem ./docker/nginx/ssl/
cp /etc/letsencrypt/live/${DOMAIN}/privkey.pem ./docker/nginx/ssl/

echo "✅ SSL Zertifikat erstellt!"

# Auto-Renewal Cron
echo "Richte Auto-Renewal ein..."
(crontab -l 2>/dev/null; echo "0 3 * * 1 certbot renew --quiet && cp /etc/letsencrypt/live/${DOMAIN}/*.pem ./docker/nginx/ssl/ && docker restart vereinskasse-nginx") | crontab -

echo "==================================="
echo "SSL Setup abgeschlossen!"
echo "Zertifikat: ./docker/nginx/ssl/"
echo "==================================="
