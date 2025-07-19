.PHONY: help dev stop build clean logs setup migrate seed test

# Default target
help:
	@echo "Available commands:"
	@echo "  make setup      - Initial setup (install dependencies, copy .env files)"
	@echo "  make dev        - Start all services in development mode"
	@echo "  make stop       - Stop all services"
	@echo "  make build      - Build all Docker images"
	@echo "  make clean      - Remove containers, volumes, and images"
	@echo "  make logs       - Show logs for all services"
	@echo "  make migrate    - Run database migrations"
	@echo "  make seed       - Seed the database"
	@echo "  make test       - Run tests"
	@echo "  make backend    - Access backend container shell"
	@echo "  make frontend   - Access frontend container shell"
	@echo "  make db         - Access PostgreSQL database"

# Initial setup
setup:
	@echo "Setting up FIDES Mentorship System..."
	@cp .env.example .env 2>/dev/null || true
	@cp .env.example backend/.env 2>/dev/null || true
	@cp .env.example frontend/.env.local 2>/dev/null || true
	@echo "Environment files created. Please update them with your values."
	@echo "Installing dependencies..."
	@cd backend && npm install
	@cd frontend && npm install
	@echo "Setup complete!"

# Start development environment
dev:
	docker-compose up -d
	@echo "Services starting..."
	@echo "Frontend: http://localhost:3000"
	@echo "Backend: http://localhost:3001"
	@echo "PostgreSQL: localhost:5432"
	@echo "Redis: localhost:6379"

# Stop all services
stop:
	docker-compose down

# Build Docker images
build:
	docker-compose build

# Clean everything
clean:
	docker-compose down -v --rmi all
	rm -rf backend/node_modules frontend/node_modules
	rm -rf backend/dist frontend/.next

# Show logs
logs:
	docker-compose logs -f

# Run database migrations
migrate:
	docker-compose exec backend npm run prisma:migrate:dev

# Seed database
seed:
	docker-compose exec backend npm run prisma:seed

# Run tests
test:
	docker-compose exec backend npm test
	docker-compose exec frontend npm test

# Access backend shell
backend:
	docker-compose exec backend sh

# Access frontend shell
frontend:
	docker-compose exec frontend sh

# Access database
db:
	docker-compose exec postgres psql -U fides_user -d fides_db