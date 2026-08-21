# Deployment

Docker deployment for the NestJS gateway + TCP microservices template.

Deploy via the repo root **Makefile** (`make help`).

## Quick start

```bash
cp .env.example .env
make production
```

**Deploy order:** redis → autoheal → gateway-rest → microservices (alphabetical)

In Docker, set TCP hosts to container names:

```bash
GATEWAY_REST_HOST=ms-nestjs-gateway-rest
ITEMS_MICROSERVICE_HOST=ms-nestjs-items
REDIS_HOST=redis
```
