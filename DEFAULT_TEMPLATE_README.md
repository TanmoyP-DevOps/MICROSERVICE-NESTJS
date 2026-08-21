# MICROSERVICE-NESTJS

Opinionated NestJS monorepo template: an HTTP **gateway-rest** in front of TCP microservices, shared contracts, Mongoose, and Makefile/Docker deploy. Drop this directory into a new repo, then rename placeholders.

Auth, billing, and extra domain apps are not included — add them when the product needs them.

## Contents

### Applications — `apps/`

| App | Transport | Role |
|---|---|---|
| `gateway-rest` | HTTP (Express) + TCP client | Public API, Swagger (`/docs`), health, `ClientProxy` to microservices |
| `items` | TCP | Sample CRUD microservice (`@MessagePattern`) |

Each app has `src/main.ts`, a module, controller, service, and `tsconfig.app.json`. Gateway feature modules live under `apps/gateway-rest/src/<feature>/`.

### Shared contracts — `common/`

| Path | Purpose |
|---|---|
| `constants/global/` | Ports, hosts, Mongo URL, `MICROSERVICE` enum, TCP transports, `ClientsModule.register` |
| `constants/database/` | `MongooseModule.forRoot` (`mainMongooseModule`) |
| `constants/logger/` | Winston console logger; optional Loki |
| `constants/helpers/` | `PROJECT_NAME` (logger app name) |
| `constants/health/` | Terminus heap / RSS / disk thresholds |
| `helpers/global/` | `getMicroservicesConfigurations()` — transport + Winston per service |
| `helpers/database/` | `getMongooseModule()` — `forFeatureAsync` schema registration |
| `microservices/messages.ts` | TCP command map (`MESSAGES.ITEMS.*`) |
| `microservices/services/items/` | DTOs, message patterns, error strings |
| `microservices/services/gateway-rest/rest-routes/` | HTTP path constants (`API_ENDPOINTS`) |
| `microservices/services/gateway-rest/constants/` | URI version (`v1`) and resource names |
| `microservices/services/gateway-rest/guards/` | Throttler TTL/limits |
| `class-models/` | `{ data, message }` HTTP wrapper |
| `microservices/dto-standards/` | Count request/response, logger context |

### Data — `database/schemas/`

- `item.schema.ts` — sample Mongoose model (`name`, `description`, timestamps)
- `base-schema/standard.schema.ts` — `_id` / timestamps shape for new models

### Deploy — `deployment/docker/`

| Path | Purpose |
|---|---|
| `base.Dockerfile` | Shared `gb-base:latest` (Node 22 Alpine, `npm ci`) |
| `services/*.Dockerfile` | Per-app build (`--target runtime`) |
| `compose/production/` | Redis, autoheal, gateway, items |
| `compose/local/` | MongoDB `:27017` + Redis for `make local` |
| `compose/test/` | MongoDB `:27963` + Redis `:6378` for Jest |

Root **Makefile** is the deploy CLI (`make help`). Order: redis → autoheal → gateway-rest → microservices (alphabetical).

### Tooling

- `nest-cli.json` — monorepo `projects`, webpack, Swagger plugin
- `package.json` — `start:dev:*`, `start:prod:*`, `build:watch:*`
- `eslint.config.mjs` + `.prettierrc` — ESLint flat config, Prettier (4-space, single quotes, 120 cols)
- `jest.config.ts` — path aliases `common/`, `apps/`, `database/`, `tests/`
- `.env.example` — copy to `.env` (gitignored)
- `.vscode/launch.json` — debug gateway and items

### Tests — `tests/`

Gateway `ItemsService` unit test (mocked `ClientProxy`). `npm test` starts/stops test Mongo + Redis via Make.

## Architecture

```
Client ──HTTP──► gateway-rest ──TCP──► items
                      │
                      ├── MongoDB (Mongoose)
                      └── Redis (compose; optional Loki)
```

The gateway does not own writes. It `send()`s a message pattern; the TCP service talks to Mongo and returns a DTO. HTTP paths and TCP commands stay in `common/` so both sides share one contract.

## Local development

```bash
cp .env.example .env
make local                          # MongoDB + Redis
npm install
npm run start:dev:items
npm run start:dev:gateway:rest
```

| URL | What |
|---|---|
| `http://localhost:3000/` | Liveness (`It is working`) |
| `http://localhost:3000/v1/gateway/ready` | Docker healthcheck |
| `http://localhost:3000/health` | Terminus + TCP ping of microservices |
| `http://localhost:3000/docs` | Swagger |
| `http://localhost:3000/v1/items` | Sample CRUD |

Keep **two processes** running locally (gateway + each TCP app). In Docker they are separate containers.

## Make targets

| Command | What it does |
|---|---|
| `make help` | List targets |
| `make local` / `make local-down` | Dev Mongo + Redis |
| `make test-deps` / `make test-deps-down` | Jest Mongo + Redis |
| `make production` | Build images + start redis, autoheal, gateway, items |
| `make production-down` | Stop application compose |
| `make production-redeploy` | Start without rebuild (`SKIP_BUILD=1`) |
| `make build-images` | `gb-base` + all service images |
| `make deploy-<service>` | Build + start one service (`gateway-rest`, `items`) |
| `make stop-<service>` | Stop one service |
| `make ps` | Containers on `PROJECT_NET` |

Variables: `REGISTRY`, `BRANCH`, `ENV_FILE`, `PROJECT_NET`, `SKIP_BUILD=1`.

## Environment

Copy `.env.example`. Local hosts are `127.0.0.1`. In Docker use **container names**:

```bash
GATEWAY_REST_HOST=ms-nestjs-gateway-rest
ITEMS_MICROSERVICE_HOST=ms-nestjs-items
REDIS_HOST=redis
```

| Variable | Used for |
|---|---|
| `GATEWAY_REST_HOST` / `GATEWAY_REST_PORT` | HTTP listen + TCP self-config |
| `ITEMS_MICROSERVICE_HOST` / `ITEMS_MICROSERVICE_PORT` | Gateway `ClientProxy` → items |
| `MONGO_URL` / `MONGO_DB_NAME` | Mongoose |
| `REDIS_HOST` / `REDIS_PORT` / `REDIS_PASSWORD` | Compose Redis |
| `LOKI_URL` / `LOKI_ENABLED` | Optional Winston Loki (non-localhost URL in staging/production) |
| `NODE_ENV` | Logger labels; Loki gate |

## Rename this project

Search-replace before first commit:

| Placeholder | Default | Where |
|---|---|---|
| npm name / logger | `microservice-nestjs` | `package.json`, `common/constants/helpers/helpers.constants.ts` |
| Docker registry / network | `microservice-nestjs`, `microservice-nestjs-net` | `Makefile` |
| Container prefix | `ms-nestjs-*` | compose files, `.env` hosts |
| Sample entity | `items` | `apps/items`, gateway `items` module, `MICROSERVICE.ITEMS` |

Swagger title lives in `apps/gateway-rest/src/main.ts`.

## Add a TCP microservice

Copying `apps/items` is the starting point for the TCP process, not the whole job. Duplicate that app, rename it, then wire the same name through the shared contracts, gateway, env, and Docker.

**1. Copy and rename the app**

- `apps/items` → `apps/<name>`
- Rename module / controller / service / `MICROSERVICE.<NAME>` in `main.ts`

**2. Register the Nest project**

- `nest-cli.json` → `projects.<name>`
- `package.json` → `start:dev:<name>`, `start:prod:<name>`, `build:watch:<name>`

**3. Shared TCP + HTTP contract in `common/`**

- Enum + host/port + `ClientsModule` in `common/constants/global/`
- Message patterns + DTOs under `common/microservices/services/<name>/`
- HTTP paths under `common/microservices/services/gateway-rest/rest-routes/`
- `.env.example` → `<NAME>_MICROSERVICE_HOST` / `_PORT`

**4. Gateway HTTP facade**

- Copy `apps/gateway-rest/src/items` → `apps/gateway-rest/src/<name>`
- Inject `@Inject(MICROSERVICE.<NAME>)` `ClientProxy`
- Import the module in `app.module.ts`

**5. Data + deploy**

- Schema in `database/schemas` and `getMongooseModule()`
- `deployment/docker/services/<name>.Dockerfile`
- `compose/production/docker-compose-<name>.yaml`
- Makefile: `MICROSERVICES`, `build-<name>`, `resolve_suffix` / `resolve_build_target`

Local hosts stay `127.0.0.1`. In Docker, set `<NAME>_MICROSERVICE_HOST` to the container name (same pattern as `ms-nestjs-items`).

## What this template does not include

Not included: extra domain apps, JWT / roles / permission decorators, a shared query-parser package, Sentry, Stripe, S3, email, cron, BullMQ. Add those when you need them.

For org CI, Slack, Husky, and commitlint, overlay **Github-Default-Repo-Template**.

## License

Internal use. Adapt `package.json` `license` when you publish a new repo.
