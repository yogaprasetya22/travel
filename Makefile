.DEFAULT_GOAL := help

# Styling colors for terminal output
CYAN  := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

.PHONY: help dev serve vite reverb queue build setup install migrate migrate-fresh seed seed-crm test format format-all lint clean cache-clear tinker route-list docker-up docker-down docker-logs

help: ## Tampilkan daftar target perintah yang tersedia
	@echo "$(GREEN)Travel / HajjFlow Pro - Makefile Commands$(RESET)"
	@echo "Usage: make [target]"
	@echo ""
	@echo "$(YELLOW)Development & Build:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^(dev|serve|vite|reverb|queue|build|setup|install):.*?## / {printf "  $(CYAN)%-16s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Database & Seeder:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^(migrate|migrate-fresh|seed|seed-crm):.*?## / {printf "  $(CYAN)%-16s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Testing & Code Quality:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^(test|format|format-all|lint):.*?## / {printf "  $(CYAN)%-16s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)
	@echo ""
	@echo "$(YELLOW)Utilities & Docker:$(RESET)"
	@awk 'BEGIN {FS = ":.*?## "} /^(clean|cache-clear|tinker|route-list|docker-up|docker-down|docker-logs):.*?## / {printf "  $(CYAN)%-16s$(RESET) %s\n", $$1, $$2}' $(MAKEFILE_LIST)

dev: ## Jalankan server, vite, websocket (reverb), dan queue worker secara bersamaan
	@npx concurrently -k --names "server,vite,reverb,queue" -c "blue,magenta,cyan,yellow" "php artisan serve" "bun dev" "php artisan reverb:start" "php artisan queue:listen --tries=1"

serve: ## Jalankan server backend Laravel (php artisan serve)
	@php artisan serve

vite: ## Jalankan Vite development server frontend (bun dev)
	@bun dev

reverb: ## Jalankan WebSocket server Reverb (port 8080)
	@php artisan reverb:start

queue: ## Jalankan queue worker (proses broadcast & async jobs)
	@php artisan queue:listen --tries=1

build: ## Build frontend assets untuk production (tsc && vite build)
	@npm run build

setup: ## Setup awal proyek (composer, .env, key, migrate, install, build)
	@composer run setup

install: ## Install dependensi PHP (Composer) & JS (Bun)
	@composer install
	@bun install

migrate: ## Jalankan migrasi database
	@php artisan migrate

migrate-fresh: ## Reset database dan jalankan ulang semua migrasi beserta seeder
	@php artisan migrate:fresh --seed

seed: ## Jalankan database seeders bawaan
	@php artisan db:seed

seed-crm: ## Seed data simulasi lengkap CRM (leads, stage log, berkas KTP/KK, pembayaran)
	@php artisan crm:seed-test-data

test: ## Jalankan automated test PHPUnit
	@php artisan test --compact

format: ## Format file PHP yang baru diubah dengan Laravel Pint
	@vendor/bin/pint --dirty --format agent

format-all: ## Format seluruh file PHP dengan Laravel Pint
	@vendor/bin/pint

lint: ## Jalankan ESLint untuk file frontend TypeScript/React
	@npm run lint

clean: cache-clear ## Alias untuk cache-clear

cache-clear: ## Bersihkan semua cache (config, route, view, optimize)
	@php artisan optimize:clear

tinker: ## Buka interactive shell Laravel (Tinker)
	@php artisan tinker

route-list: ## Tampilkan daftar route aplikasi
	@php artisan route:list

docker-up: ## Jalankan service Docker di background (Postgres, Redis, dsb.)
	@docker compose up -d

docker-down: ## Matikan container Docker
	@docker compose down

docker-logs: ## Pantau logs dari container Docker
	@docker compose logs -f
