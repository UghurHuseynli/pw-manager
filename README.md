# Password Manager

FastAPI-based password manager.

## Configuration profiles

Settings are split by profile — `.env.dev`, `.env.test`, `.env.prod` — selected
by the `ENVIRONMENT` variable (`app/core/config.py`), the same idea as Spring's
`spring.profiles.active` + `application-{profile}.yml`. `ENVIRONMENT` defaults
to `dev` and has to come from outside the file it selects (shell env, or a
Docker Compose `environment:` block) since it decides which file gets read.

Copy the matching example first:

```sh
cp env.example.dev .env.dev    # local dev (also what `uv run pytest` uses by default)
cp env.example.test .env.test  # only needed for ENVIRONMENT=test runs, e.g. CI
cp env.example.prod .env.prod  # fill in on the actual prod host, never commit
```

Each Docker Compose stack already points at the right profile: the base
`docker-compose.yml` uses `.env.prod`, `docker-compose.dev.yml` overrides that
to `.env.dev`. Running locally without Docker, just `export ENVIRONMENT=dev`
(or leave it unset — same default).

## Running with Docker

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
