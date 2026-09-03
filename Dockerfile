
# ─────────────────────────────────────────
# Stage 1: Frontend (Node/Vite builder)
# ─────────────────────────────────────────
FROM node:20-alpine AS frontend-builder
WORKDIR /app
COPY package.json package-lock.json* bun.lock* ./
RUN npm ci || npm install
COPY . .
RUN npm run build

# ─────────────────────────────────────────
# Stage 2: PHP/Composer builder
# ─────────────────────────────────────────
FROM composer:2.8 AS composer-builder
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --ignore-platform-reqs \
    --prefer-dist
COPY . .
RUN composer dump-autoload --optimize --no-dev

# ─────────────────────────────────────────
# Stage 3: Production image
# ─────────────────────────────────────────
FROM php:8.3-fpm-alpine AS production

LABEL maintainer="travel-app"

# Install system dependencies
RUN apk add --no-cache \
    bash \
    curl \
    git \
    supervisor

# Install PHP extensions using mlocati installer
COPY --from=mlocati/php-extension-installer /usr/bin/install-php-extensions /usr/local/bin/
RUN install-php-extensions gd pdo_pgsql pgsql pdo_mysql zip intl opcache pcntl bcmath redis

# OPcache tuning for production
RUN { \
    echo 'opcache.memory_consumption=256'; \
    echo 'opcache.interned_strings_buffer=16'; \
    echo 'opcache.max_accelerated_files=20000'; \
    echo 'opcache.revalidate_freq=0'; \
    echo 'opcache.validate_timestamps=0'; \
    echo 'opcache.enable_cli=1'; \
    echo 'opcache.jit_buffer_size=100M'; \
    echo 'opcache.jit=1255'; \
} > /usr/local/etc/php/conf.d/opcache.ini

# PHP-FPM tuning
RUN { \
    echo '[www]'; \
    echo 'pm = dynamic'; \
    echo 'pm.max_children = 20'; \
    echo 'pm.start_servers = 4'; \
    echo 'pm.min_spare_servers = 2'; \
    echo 'pm.max_spare_servers = 8'; \
    echo 'pm.max_requests = 500'; \
    echo 'clear_env = no'; \
} > /usr/local/etc/php-fpm.d/www-prod.conf

# Upload / memory limits
RUN { \
    echo 'upload_max_filesize=32M'; \
    echo 'post_max_size=32M'; \
    echo 'memory_limit=512M'; \
    echo 'max_execution_time=60'; \
} > /usr/local/etc/php/conf.d/limits.ini

WORKDIR /var/www/html

# Copy app and compiled frontend assets from builders
COPY --from=composer-builder /app .
COPY --from=frontend-builder /app/public/build ./public/build

# Storage & cache dirs
RUN mkdir -p storage/logs \
              storage/framework/cache \
              storage/framework/sessions \
              storage/framework/views \
              bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache public/build \
    && chmod -R 775 storage bootstrap/cache

# Supervisor config
COPY docker/supervisord.conf /etc/supervisord.conf

# Entrypoint
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

EXPOSE 9000

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
CMD ["php-fpm"]
