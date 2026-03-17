.PHONY: help install start stop restart logs clean db-reset test lint format

# Default target
help:
	@echo "Energy Dashboard - Local Development Commands"
	@echo ""
	@echo "Setup:"
	@echo "  make install          Install all dependencies"
	@echo "  make setup            Complete initial setup (install + start + db-init)"
	@echo ""
	@echo "Services:"
	@echo "  make start            Start all Docker services"
	@echo "  make stop             Stop all Docker services"
	@echo "  make restart          Restart all Docker services"
	@echo "  make logs             View logs from all services"
	@echo "  make logs-db          View database logs"
	@echo "  make logs-localstack  View LocalStack logs"
	@echo ""
	@echo "Development:"
	@echo "  make dev              Start frontend and backend dev servers"
	@echo "  make dev-frontend     Start frontend dev server only"
	@echo "  make dev-backend      Start backend dev server only"
	@echo ""
	@echo "Database:"
	@echo "  make db-init          Initialize database schema"
	@echo "  make db-seed          Load seed data"
	@echo "  make db-reset         Reset database (drop + recreate + seed)"
	@echo "  make db-shell         Open PostgreSQL shell"
	@echo "  make db-backup        Backup database"
	@echo ""
	@echo "Testing:"
	@echo "  make test             Run all tests"
	@echo "  make test-backend     Run backend tests"
	@echo "  make test-frontend    Run frontend tests"
	@echo "  make lint             Run linters"
	@echo "  make format           Format code"
	@echo ""
	@echo "Cleanup:"
	@echo "  make clean            Remove node_modules and build artifacts"
	@echo "  make clean-all        Remove everything including Docker volumes"

# Installation
install:
	@echo "Installing dependencies..."
	npm install
	cd infrastructure && npm install
	cd backend && npm install
	cd frontend && npm install
	@echo "Dependencies installed!"

# Complete setup
setup: install start
	@echo "Waiting for services to be ready..."
	sleep 10
	@$(MAKE) db-init
	@$(MAKE) db-seed
	@echo ""
	@echo "Setup complete! You can now run:"
	@echo "  make dev          # Start development servers"
	@echo ""
	@echo "Access points:"
	@echo "  Frontend:  http://localhost:3000"
	@echo "  Backend:   http://localhost:4000"
	@echo "  pgAdmin:   http://localhost:5050"
	@echo "  LocalStack: http://localhost:4566"

# Docker services
start:
	@echo "Starting Docker services..."
	docker-compose up -d
	@echo "Services started!"

stop:
	@echo "Stopping Docker services..."
	docker-compose down
	@echo "Services stopped!"

restart:
	@echo "Restarting Docker services..."
	docker-compose restart
	@echo "Services restarted!"

logs:
	docker-compose logs -f

logs-db:
	docker-compose logs -f postgres

logs-localstack:
	docker-compose logs -f localstack

# Development servers
dev:
	@echo "Starting development servers..."
	@echo "Frontend will be available at http://localhost:3000"
	@echo "Backend will be available at http://localhost:4000"
	@$(MAKE) -j2 dev-frontend dev-backend

dev-frontend:
	cd frontend && npm run dev

dev-backend:
	cd backend && npm run dev

# Database operations
db-init:
	@echo "Initializing database schema..."
	docker-compose exec -T postgres psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/01-schema.sql
	@echo "Database schema initialized!"

db-seed:
	@echo "Loading seed data..."
	docker-compose exec -T postgres psql -U postgres -d energy_dashboard -f /docker-entrypoint-initdb.d/02-seed.sql
	@echo "Seed data loaded!"

db-reset:
	@echo "Resetting database..."
	docker-compose exec -T postgres psql -U postgres -c "DROP DATABASE IF EXISTS energy_dashboard;"
	docker-compose exec -T postgres psql -U postgres -c "CREATE DATABASE energy_dashboard;"
	@$(MAKE) db-init
	@$(MAKE) db-seed
	@echo "Database reset complete!"

db-shell:
	docker-compose exec postgres psql -U postgres -d energy_dashboard

db-backup:
	@echo "Backing up database..."
	docker-compose exec -T postgres pg_dump -U postgres energy_dashboard > backup_$$(date +%Y%m%d_%H%M%S).sql
	@echo "Backup complete!"

# Testing
test:
	@echo "Running all tests..."
	cd backend && npm test
	cd frontend && npm test

test-backend:
	cd backend && npm test

test-frontend:
	cd frontend && npm test

# Code quality
lint:
	@echo "Running linters..."
	cd backend && npm run lint
	cd frontend && npm run lint

format:
	@echo "Formatting code..."
	cd backend && npm run format || true
	cd frontend && npm run format || true

# Cleanup
clean:
	@echo "Cleaning build artifacts..."
	rm -rf node_modules
	rm -rf infrastructure/node_modules infrastructure/cdk.out
	rm -rf backend/node_modules backend/dist
	rm -rf frontend/node_modules frontend/dist
	@echo "Clean complete!"

clean-all: stop clean
	@echo "Removing Docker volumes..."
	docker-compose down -v
	@echo "All cleaned!"
