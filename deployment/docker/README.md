# Docker Assets

All images build from the repository root:

```bash
docker build -f deployment/docker/base.Dockerfile -t gb-base:latest .
docker build -f deployment/docker/services/items.Dockerfile --target runtime -t microservice-nestjs/items/production:latest .
```

Or use `make production`.
