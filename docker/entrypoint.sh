#!/bin/bash
set -e

# Ensure directories exist
mkdir -p /var/www/html/storage/logs \
         /var/www/html/storage/framework/cache \
         /var/www/html/storage/framework/sessions \
         /var/www/html/storage/framework/views \
         /var/www/html/bootstrap/cache

# Auto-generate APP_KEY if missing
if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "base64:" ] || [ "$APP_KEY" = "" ]; then
  echo "[entrypoint] Generating application encryption key..."
  php artisan key:generate --force || true
fi

echo "[entrypoint] Waiting for database connection..."
MAX_TRIES=30
TRIES=0
until php artisan db:show > /dev/null 2>&1 || [ $TRIES -eq $MAX_TRIES ]; do
  echo "[entrypoint] Database not ready yet, waiting 2s... ($TRIES/$MAX_TRIES)"
  sleep 2
  TRIES=$((TRIES+1))
done

echo "[entrypoint] Running database migrations..."
php artisan migrate --force || true

echo "[entrypoint] Creating storage symlink..."
php artisan storage:link || true

echo "[entrypoint] Optimizing caches..."
php artisan config:cache || true
php artisan route:cache || true
php artisan view:cache || true

echo "[entrypoint] Fixing storage permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "[entrypoint] Starting supervisord..."
exec supervisord -c /etc/supervisord.conf
