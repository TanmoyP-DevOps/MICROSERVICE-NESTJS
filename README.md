# Microservice NestJS

NestJS monorepo: HTTP **gateway-rest** in front of TCP microservices. Shared DTOs and message patterns live in `common/`. Deploy with Docker Compose via the root Makefile.

Template notes (rename, add a service, file map): [DEFAULT_TEMPLATE_README.md](./DEFAULT_TEMPLATE_README.md).

## Quick start

```bash
cp .env.example .env
make local
npm install
npm run start:dev:items
npm run start:dev:gateway:rest
```

| URL | Description |
|---|---|
| [http://localhost:3000/](http://localhost:3000/) | Liveness |
| [http://localhost:3000/docs](http://localhost:3000/docs) | Swagger |
| [http://localhost:3000/v1/items](http://localhost:3000/v1/items) | Sample CRUD |
| [http://localhost:3000/health](http://localhost:3000/health) | Terminus + TCP ping |
| [http://localhost:3000/v1/gateway/ready](http://localhost:3000/v1/gateway/ready) | Gateway ready |

Run **gateway** and **each TCP app** as separate processes (or containers).

## Layout

```
apps/gateway-rest     HTTP API, Swagger, health, ClientProxy
apps/items            Sample TCP microservice
common/               Ports, transports, MESSAGES, HTTP routes, DTOs
database/schemas      Mongoose models
deployment/docker     gb-base image, per-service Dockerfiles, compose
tests/                Jest (path aliases match tsconfig baseUrl)
```

## Scripts

| Script | What |
|---|---|
| `npm run start:dev:gateway:rest` | Gateway with watch |
| `npm run start:dev:items` | Items TCP service with watch |
| `npm run build` | Build default project (gateway) |
| `npm run build:watch:items` | Watch-build items |
| `npm test` | Jest (`make test-deps` up/down around the run) |
| `npm run lint` | ESLint `--fix` |

## Docker

Production env must use **container DNS**, not `127.0.0.1`:

```bash
GATEWAY_REST_HOST=ms-nestjs-gateway-rest
ITEMS_MICROSERVICE_HOST=ms-nestjs-items
REDIS_HOST=redis
```

```bash
make production              # build + redis → autoheal → gateway → items
make production-down
make deploy-items            # one service
make ps
```

Full target list: `make help`. Compose files: [deployment/README.md](./deployment/README.md).

## Request flow

```
HTTP  /v1/items  →  gateway ItemsService  →  TCP  items.create  →  Mongo
```

## Add a new service

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
