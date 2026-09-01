# Password Manager

FastAPI-based password manager.

## Running with Docker

Copy `env.example` to `.env` and fill in real values first:

```sh
cp env.example .env
```

All variants build the `Dockerfile` with `uv` and run Alembic migrations
automatically on container start (`docker/entrypoint.sh`).

### Production (app + Postgres, port 8000 published)

```sh
docker compose up -d --build
```

### Development (hot reload, source mounted from ./app)

```sh
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

### Production behind nginx (port 80)

```sh
docker compose -f docker-compose.yml -f docker-compose.nginx.yml up -d --build
```

### Production behind Traefik (port 80, dashboard on 8080)

```sh
docker compose -f docker-compose.yml -f docker-compose.traefik.yml up -d --build
```

Tear down with `docker compose ... down` (add `-v` to also drop the Postgres
volume).
