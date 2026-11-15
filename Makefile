# Shortcuts for the Docker workflow. `make help` lists targets.

COMPOSE      := docker compose
COMPOSE_PROD := docker compose -f docker-compose.prod.yml
API          := $(COMPOSE) exec api
WEB          := $(COMPOSE) exec web

.DEFAULT_GOAL := help
.PHONY: help up down reset logs ps rebuild test test-api test-web lint migrations migrate \
        seed reseed shell-api shell-web shell-db prod-up prod-down prod-logs

help: ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | \
	  awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

up: ## Start the dev stack (UI :5174, API :8000, DB :5433)
	$(COMPOSE) up --build -d
	@echo "UI  http://localhost:5174   API docs http://localhost:8000/api/docs"

down: ## Stop the dev stack (keeps the database)
	$(COMPOSE) down

reset: ## Stop and DELETE the dev database volume
	$(COMPOSE) down -v

logs: ## Follow logs of all services
	$(COMPOSE) logs -f

ps: ## Show service status
	$(COMPOSE) ps

rebuild: ## Rebuild images and refresh dependency volumes (after lockfile changes)
	$(COMPOSE) up --build -d -V

test: test-api test-web ## Run backend and frontend test suites

test-api: ## Backend tests (pytest)
	$(API) pytest -q

test-web: ## Frontend tests (vitest)
	$(WEB) pnpm test

lint: ## Lint both apps
	$(API) ruff check .
	$(API) ruff format --check .
	$(WEB) pnpm lint
	$(WEB) pnpm typecheck

migrations: ## Create migrations after model changes
	$(API) python manage.py makemigrations

migrate: ## Apply migrations
	$(API) python manage.py migrate

seed: ## Load demo data (no-op if data exists)
	$(API) python manage.py seed_demo --if-empty

reseed: ## Wipe and reload demo data
	$(API) python manage.py seed_demo --reset

shell-api: ## Django shell
	$(API) python manage.py shell

shell-web: ## Shell in the frontend container
	$(WEB) sh

shell-db: ## psql in the database
	$(COMPOSE) exec db psql -U opshub -d opshub

prod-up: ## Start the production-like stack on :8080 (needs .env)
	$(COMPOSE_PROD) up --build -d
	@echo "OpsHub http://localhost:8080"

prod-down: ## Stop the production-like stack
	$(COMPOSE_PROD) down

prod-logs: ## Follow production-like stack logs
	$(COMPOSE_PROD) logs -f
