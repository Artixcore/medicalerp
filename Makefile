.PHONY: help install dev build test lint migrate docker-up docker-down clean

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

install: ## Install all dependencies
	npm install

dev: ## Start all services in development mode
	docker-compose up -d
	npm run dev

build: ## Build all services
	npm run build

test: ## Run all tests
	npm run test

lint: ## Run linter
	npm run lint

migrate: ## Run database migrations
	npm run migrate

docker-up: ## Start infrastructure services
	docker-compose up -d

docker-down: ## Stop infrastructure services
	docker-compose down

kong-setup: ## Setup Kong API Gateway
	./scripts/setup-kong.sh

kong-status: ## Check Kong API Gateway status
	@curl -s http://localhost:8001/status | python -m json.tool || echo "Kong is not running"

kong-logs: ## View Kong logs
	docker logs -f ehrms-kong

clean: ## Clean build artifacts
	rm -rf node_modules
	rm -rf dist
	rm -rf .next
	find . -name "*.log" -delete

