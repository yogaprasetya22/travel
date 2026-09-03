#!/bin/bash
set -e

echo "[entrypoint] Waiting for PostgreSQL..."
until php artisan db:show --json > /dev/null 2>&1; do
  sleep 1
done

echo "[entrypoint] Running migrations..."
php artisan migrate --force

echo "[entrypoint] Caching config, routes, views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache
php artisan event:cache

echo "[entrypoint] Creating storage link..."
php artisan storage:link || true

echo "[entrypoint] Fixing storage permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

echo "[entrypoint] Starting supervisord..."
exec supervisord -c /etc/supervisord.conf
