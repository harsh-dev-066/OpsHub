# OpsHub backend

The Django REST API for OpsHub: JWT authentication, role-based authorization on every endpoint, and PostgreSQL persistence. It implements the contract in [`.cursor/rules/api.md`](../.cursor/rules/api.md).

## Setup

Run it with Docker from the repo root:

```bash
docker compose up --build              # API on http://localhost:8000 (plus DB and web)
```

The `api` service builds the `dev` target of [`Dockerfile`](Dockerfile) and bind-mounts this folder, so `runserver` reloads on edits. On start, [`docker-entrypoint.sh`](docker-entrypoint.sh) waits for Postgres, applies migrations (`RUN_MIGRATIONS=1`) and seeds demo data if the database is empty (`SEED_DEMO=1`).

<details>
<summary>Without Docker</summary>

```bash
docker compose up -d db                # or any Postgres; set DATABASE_URL accordingly
cd backend
cp .env.example .env                   # set SECRET_KEY and DEMO_USER_PASSWORD
uv sync
uv run manage.py migrate && uv run manage.py seed_demo
uv run manage.py runserver
```

Prefix the commands below with `uv run` instead of `docker compose exec api`.
</details>

| URL | What |
| --- | --- |
| `/api/...` | REST API (see the contract doc) |
| `/api/docs` | Swagger UI (OpenAPI schema at `/api/schema`) |
| `/api/health` | Liveness, no database access (public; Render's health check) |
| `/api/health/ready` | Readiness: database reachable (public; Compose health checks) |
| `/admin/` | Django admin. The seeded `test` user is a superuser |

### Try it with curl

```bash
TOKEN=$(curl -s localhost:8000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"username":"test","password":"<DEMO_USER_PASSWORD>"}' | python3 -c 'import sys,json;print(json.load(sys.stdin)["access"])')
curl -s localhost:8000/api/tickets?priority=critical -H "Authorization: Bearer $TOKEN"
```

## Commands

Run these inside the container: `docker compose exec api <command>`. `make` shortcuts are shown where they exist.

| Command | Purpose |
| --- | --- |
| `pytest` (`make test-api`) | Test suite (creates a `test_opshub` database) |
| `ruff check . && ruff format --check .` | Lint and format check |
| `python manage.py makemigrations <app>` (`make migrations`) | New migration after a model change |
| `python manage.py seed_demo [--reset \| --if-empty] [--password X]` | Demo data |
| `python manage.py createsuperuser` | Admin user (gets the Admin role) |
| `uv add <pkg>`, then `make rebuild` | Add a dependency (updates `pyproject.toml` and `uv.lock`) |

## Configuration

All settings come from environment variables (or `backend/.env`). See [`.env.example`](.env.example).

| Variable | Default | Notes |
| --- | --- | --- |
| `SECRET_KEY` | — | Required. Long and random in production |
| `DATABASE_URL` | — | Required, e.g. `postgres://user:pass@host:5432/db` |
| `DJANGO_SETTINGS_MODULE` | `config.settings.dev` (manage.py) / `prod` (WSGI) | `config.settings.test` for pytest |
| `ALLOWED_HOSTS`, `CORS_ALLOWED_ORIGINS` | empty | Comma-separated; used in prod |
| `JWT_ACCESS_TOKEN_MINUTES` / `JWT_REFRESH_TOKEN_DAYS` | 15 / 7 | Lower the access lifetime locally to exercise refresh |
| `LOGIN_THROTTLE_RATE` | `10/min` | Per-IP login attempts |
| `DEMO_USER_PASSWORD` | — | Password given to seeded users |
| `DB_CONN_MAX_AGE` | `60` | Seconds to keep DB connections open; `0` on Render so Neon can scale to zero |
| `DISABLE_SERVER_SIDE_CURSORS` | `False` | Set `True` with transaction-mode poolers (Neon's pooled `-pooler` host) |

## Production

The `prod` target of the [`Dockerfile`](Dockerfile) contains runtime dependencies only, runs as a non-root user, includes collected static files (served by WhiteNoise) and starts gunicorn on port 8000.

`docker-compose.prod.yml` at the repo root runs it behind nginx (the `web` service). See the [root README](../README.md#production-like-stack). To run the image on its own:

```bash
docker build --target prod -t opshub-api backend
docker run --rm --env-file prod.env -e RUN_MIGRATIONS=1 -p 8000:8000 opshub-api
```

With more than one replica, run migrations as a separate release step (`python manage.py migrate`) rather than with `RUN_MIGRATIONS=1` on every container.

`config.settings.prod` enables the SSL redirect (except for `/api/health`), HSTS and secure cookies, and requires authentication for `/api/docs`.

| Variable | Notes |
| --- | --- |
| `NUM_PROXIES` | Number of reverse proxies in front (1 behind nginx). Rate limiting uses `X-Forwarded-For` only when this is set |
| `CSRF_TRUSTED_ORIGINS` | Public origin(s) for Django admin form posts, e.g. `https://ops.example.com` |
| `SECURE_SSL_REDIRECT`, `SESSION_COOKIE_SECURE`, `CSRF_COOKIE_SECURE` | Default `True`; set to `False` only for plain-HTTP local testing |

## Structure

See [backend architecture](../.cursor/rules/backend/architecture.md), [conventions](../.cursor/rules/backend/conventions.md) and [decisions](../.cursor/rules/backend/decisions.md).
