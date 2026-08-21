# Microservice NestJS — Docker deployment via compose files.
# Run `make help` for targets.

.DEFAULT_GOAL := help

ROOT_DIR              := $(abspath $(dir $(lastword $(MAKEFILE_LIST))))
DEPLOY_DIR            := $(ROOT_DIR)/deployment
COMPOSE_PROD          := $(DEPLOY_DIR)/docker/compose/production
COMPOSE_LOCAL         := $(DEPLOY_DIR)/docker/compose/local
COMPOSE_TEST          := $(DEPLOY_DIR)/docker/compose/test

ENV_FILE              ?= $(ROOT_DIR)/.env
ENV_FILE              := $(abspath $(ENV_FILE))
REGISTRY              ?= microservice-nestjs
BRANCH                ?= production
PROJECT_NET           ?= microservice-nestjs-net
COMPOSE_PROJECT_NAME  ?= microservice-nestjs
SKIP_BUILD            ?= 0

export ENV_FILE REGISTRY BRANCH PROJECT_NET COMPOSE_PROJECT_NAME

DC                    := docker compose --env-file $(ENV_FILE)

COMPOSE_REDIS         := -f $(COMPOSE_PROD)/docker-compose-redis.yaml
COMPOSE_AUTOHEAL      := -f $(COMPOSE_PROD)/docker-compose-autoheal.yaml
COMPOSE_GATEWAY       := -f $(COMPOSE_PROD)/docker-compose-gateway.yaml
COMPOSE_LOCAL_FILES   := -f $(COMPOSE_LOCAL)/docker-compose-local-db.yaml -f $(COMPOSE_LOCAL)/docker-compose-redis-only.yaml
COMPOSE_TEST_FILES    := -f $(COMPOSE_TEST)/docker-compose-test.yaml

# Add new TCP services here (compose file suffix, alphabetical)
MICROSERVICES         := items

PROD_COMPOSE_FILES    := $(sort $(wildcard $(COMPOSE_PROD)/docker-compose-*.yaml))
COMPOSE_ALL_FLAGS     := $(foreach f,$(PROD_COMPOSE_FILES),-f $(f))

.PHONY: help
help: ## Show available targets
	@echo "Microservice NestJS — Docker Compose deployment"
	@echo ""
	@echo "Production (order: redis → autoheal → gateway → microservices):"
	@echo "  make production              build images + start all services"
	@echo "  make production-down         stop all application containers"
	@echo "  make production-redeploy     start all without rebuilding (SKIP_BUILD=1)"
	@echo "  make build-images            build base + all service images"
	@echo "  make deploy-<service>        build + start one service"
	@echo "  make stop-<service>          stop one service"
	@echo ""
	@echo "Local & test:"
	@echo "  make local                   MongoDB + Redis"
	@echo "  make local-down              stop local dependencies"
	@echo "  make test-deps               test MongoDB + Redis"
	@echo "  make test-deps-down          stop test dependencies"
	@echo ""
	@grep -E '^[a-zA-Z0-9_.-]+:.*## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*## "}; {printf "  %-28s %s\n", $$1, $$2}'

.PHONY: check-env
check-env:
	@test -f "$(ENV_FILE)" || (echo "Missing $(ENV_FILE) — run: cp .env.example .env" >&2 && exit 1)

.PHONY: network
network: ## Ensure Docker network exists
	@docker network inspect $(PROJECT_NET) >/dev/null 2>&1 || docker network create $(PROJECT_NET)
	@echo "Network $(PROJECT_NET) ready"

.PHONY: ensure-infra
ensure-infra: check-env network ## Start redis + autoheal if not already running
	@docker ps --format '{{.Names}}' | grep -qx redis || { \
		echo "Starting redis..."; \
		$(DC) $(COMPOSE_REDIS) up -d --force-recreate --wait; \
	}
	@docker ps --format '{{.Names}}' | grep -qx autoheal || { \
		echo "Starting autoheal..."; \
		$(DC) $(COMPOSE_AUTOHEAL) up -d --force-recreate; \
	}

.PHONY: build-base
build-base: ## Build shared gb-base image
	@echo "Building base image..."
	docker build -f $(DEPLOY_DIR)/docker/base.Dockerfile -t gb-base:latest $(ROOT_DIR)

.PHONY: build-images
build-images: build-base ## Build all application Docker images
	@$(MAKE) build-gateway-rest build-items
	@echo "All images built."

.PHONY: build-gateway-rest build-items

build-gateway-rest: build-base
	$(call docker_build,gateway-rest,gateway-rest)

build-items: build-base
	$(call docker_build,items,items)

define docker_build
	@echo "Building $(2) -> $(REGISTRY)/$(2)/$(BRANCH):latest"
	docker build \
		-f $(DEPLOY_DIR)/docker/services/$(1).Dockerfile \
		--target runtime \
		-t $(REGISTRY)/$(2)/$(BRANCH):latest \
		$(ROOT_DIR)
endef

build-gateway: build-gateway-rest

.PHONY: production
production: check-env network ## Build and deploy all application services
ifeq ($(SKIP_BUILD),0)
	$(MAKE) build-images
endif
	@echo "Starting redis..."
	$(DC) $(COMPOSE_REDIS) up -d --force-recreate --wait
	@echo "Starting autoheal..."
	$(DC) $(COMPOSE_AUTOHEAL) up -d --force-recreate
	@echo "Starting gateway-rest..."
	$(DC) $(COMPOSE_GATEWAY) up -d --force-recreate --wait
	@$(foreach svc,$(MICROSERVICES),\
		echo "Starting $(svc)..." && \
		$(DC) -f $(COMPOSE_PROD)/docker-compose-$(svc).yaml up -d --force-recreate --wait || exit 1;)
	@echo ""
	@echo "Deploy complete. Check: make ps"

.PHONY: production-down
production-down: check-env ## Stop all application containers
	@echo "Stopping application containers..."
	$(DC) $(COMPOSE_ALL_FLAGS) down --remove-orphans
	@echo "Application containers stopped."

.PHONY: production-redeploy
production-redeploy: ## Redeploy without rebuilding images
	$(MAKE) production SKIP_BUILD=1

.PHONY: deploy-%
deploy-%: check-env ensure-infra ## Deploy one service (e.g. make deploy-items)
	@$(call deploy_service,$*)

.PHONY: stop-%
stop-%: check-env ## Stop one service (e.g. make stop-gateway-rest)
	@suffix=$$( $(call resolve_suffix,$*) ); \
	if [ "$$suffix" = "UNKNOWN" ]; then \
		echo "Unknown service: $*" >&2; \
		exit 1; \
	fi; \
	echo "Stopping $$suffix..."; \
	$(DC) -f $(COMPOSE_PROD)/docker-compose-$$suffix.yaml down --remove-orphans

deploy-gateway: deploy-gateway-rest
stop-gateway: stop-gateway-rest

define resolve_suffix
case "$1" in \
	gateway|gateway-rest) echo gateway ;; \
	items) echo items ;; \
	*) echo UNKNOWN ;; \
esac
endef

define resolve_build_target
case "$1" in \
	gateway|gateway-rest) echo build-gateway-rest ;; \
	items) echo build-items ;; \
	*) echo UNKNOWN ;; \
esac
endef

define deploy_service
suffix=$$( $(call resolve_suffix,$1) ); \
build_target=$$( $(call resolve_build_target,$1) ); \
if [ "$$suffix" = "UNKNOWN" ]; then \
	echo "Unknown service: $1" >&2; \
	echo "Services: gateway-rest, items" >&2; \
	exit 1; \
fi; \
$(MAKE) $$build_target; \
echo "Starting $$suffix..."; \
$(DC) -f $(COMPOSE_PROD)/docker-compose-$$suffix.yaml up -d --force-recreate --wait; \
echo "$$suffix is up."
endef

.PHONY: local
local: network ## Start MongoDB + Redis for local development
	$(DC) $(COMPOSE_LOCAL_FILES) up -d --force-recreate
	@echo "Local dependencies running (MongoDB :27017, Redis from .env REDIS_PORT)"

.PHONY: local-down
local-down: ## Stop local MongoDB + Redis
	$(DC) $(COMPOSE_LOCAL_FILES) down

.PHONY: test-deps
test-deps: network ## Start MongoDB + Redis for Jest
	$(DC) $(COMPOSE_TEST_FILES) up -d --force-recreate
	@echo "Test dependencies running (MongoDB :27963, Redis :6378)"

.PHONY: test-deps-down
test-deps-down: ## Stop test MongoDB + Redis
	$(DC) $(COMPOSE_TEST_FILES) down

.PHONY: ps
ps: ## List containers on the project network
	@docker ps --filter network=$(PROJECT_NET) --format 'table {{.Names}}\t{{.Status}}\t{{.Ports}}'
