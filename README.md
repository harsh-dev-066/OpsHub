# OpsHub — Property Operations Console

OpsHub is a **fictional** property-operations console: portfolio dashboard, properties, units, residents, tickets and user management. It's a full-stack portfolio project that runs entirely in Docker.

| Folder                            | What                | Stack                                                                                                                                                                                   |
| --------------------------------- | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| [`frontend/`](frontend/README.md) | Single-page console | React 19, Vite, TypeScript, TanStack Router/Query/Table, Tailwind, MSW for tests/demo                                                                                                   |
| [`backend/`](backend/README.md)   | REST API            | Django 5.2, Django REST Framework, PostgreSQL 16, SimpleJWT                                                                                                                             |
| [`.cursor/rules/`](.cursor/rules) | Engineering docs    | Shared [API contract](.cursor/rules/api.md) and [domain model](.cursor/rules/domain-model.md), plus [`frontend/`](.cursor/rules/frontend) and [`backend/`](.cursor/rules/backend) rules |

## Quickstart

The only prerequisite is Docker (Desktop or Engine with Compose v2).

```bash
docker compose up --build        # or: make up
```

| URL                            | What                                                |
| ------------------------------ | --------------------------------------------------- |
| http://localhost:5174          | Console (Vite dev server, hot reload)               |
| http://localhost:8000/api/docs | API docs (Swagger UI)                               |
| http://localhost:8000/admin/   | Django admin                                        |
| `localhost:5433`               | PostgreSQL (`opshub` / `opshub`) for local DB tools |

On first start the API applies migrations and seeds demo data. Sign in as **`test`** (Admin), or as `priya`, `chris` or `sam`. The password is `DEMO_USER_PASSWORD`, which defaults to `opshub-demo`; to change it, copy `.env.example` to `.env`.

### Day-to-day

Run `make help` for the full list.

| Task                        | Command                                        |
| --------------------------- | ---------------------------------------------- |
| Start / stop                | `make up` / `make down`                        |
| Logs                        | `make logs`                                    |
| All tests                   | `make test` (pytest in `api`, vitest in `web`) |
| Lint + typecheck            | `make lint`                                    |
| New migration               | `make migrations`                              |
| Reload demo data            | `make reseed`                                  |
| Django shell / psql         | `make shell-api` / `make shell-db`             |
| Wipe the database           | `make reset`                                   |
| After changing dependencies | `make rebuild`                                 |

Both `backend/` and `frontend/` are bind-mounted into their containers, so code edits reload immediately. Dependencies live inside the images. After changing `uv.lock` or `pnpm-lock.yaml`, run `make rebuild`, which rebuilds the images and refreshes the `node_modules` volume.

Add dependencies through the containers so lockfiles are produced on Linux:

```bash
docker compose exec api uv add <package>        # then: make rebuild
docker compose exec web pnpm add <package>      # then: make rebuild
```

### Troubleshooting

| Symptom                                | Fix                                                                                                                                          |
| -------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| The UI shows a different app or won't load | Another dev server is using the host port (often on IPv6 `::1`). Set `WEB_PORT` in `.env` to a free port and run `make up`. Change only the host side: Vite listens on 5173 inside the container |
| Port 5433 or 8000 already in use       | Set `POSTGRES_PORT` in `.env`, or stop the conflicting service                                                                               |
| `Cannot find module …` after pulling   | Dependencies changed: run `make rebuild`                                                                                                     |
| Want a clean database                  | Run `make reset && make up`; migrations and the seed run again on start                                                                      |

## Production-like stack

`docker-compose.prod.yml` builds the production images: the API runs under gunicorn, and nginx serves the built SPA and proxies `/api`, `/admin` and `/static` to it on the same origin. Only nginx is exposed.

```bash
cp .env.example .env             # set SECRET_KEY and POSTGRES_PASSWORD (SEED_DEMO=1 for demo data)
make prod-up                     # http://localhost:8080
```

That file relaxes the HTTPS-only settings for plain-HTTP localhost. Put TLS in front of nginx and set `SECURE_SSL_REDIRECT=True` and `SECURE_COOKIES=True` for a real deployment. See [backend/README.md](backend/README.md#production).

## How the pieces fit

```text
 browser ──► web  (dev: Vite :5174 │ prod: nginx :8080)
                 │  /api/* proxied on the same origin
                 ▼
             api  (dev: runserver │ prod: gunicorn)  ──►  db (PostgreSQL 16)
             JWT auth · role-based permissions on every endpoint · validation
```

The backend is the security boundary. The frontend uses the same permissions (from `/api/auth/me`) only to hide actions a user can't take.

## Deploying to Render (+ Neon)

[`render.yaml`](render.yaml) is a Render Blueprint for the two app services. The database is a [Neon](https://neon.com) serverless Postgres project. Its free plan has no expiry, unlike Render's free Postgres.

| Resource | Where | Built from |
| --- | --- | --- |
| `opshub-api` | Render web service (Docker, Singapore) | `backend/Dockerfile`, last stage = `prod` (gunicorn) |
| `opshub-web` | Render static site | `frontend/`, `pnpm build` → `frontend/dist` |
| Database | Neon project, AWS Singapore (`ap-southeast-1`), PostgreSQL 18 | — |

The SPA calls the API directly at `https://opshub-api.onrender.com`, and CORS allows the SPA's origin. The JWT is sent in the `Authorization` header, so no cross-site cookies are involved.

### Neon connection strings

The repo is linked to the Neon project with the `neon` CLI (`neon init`). The project and branch IDs are in `.neon` (git-ignored). `neon env pull` writes the connection strings to **`.env.local`** (also git-ignored; never commit it):

| Variable | Use |
| --- | --- |
| `DATABASE_URL_UNPOOLED` | **Direct** connection. Use this value for Render's `DATABASE_URL` and the backup secret |
| `DATABASE_URL` | Pooled (`-pooler` host). Only use it with `DISABLE_SERVER_SIDE_CURSORS=True` |

Local development is unaffected: it uses the Docker Postgres. To check that the app can reach Neon (read-only, no migrations):

```bash
export DATABASE_URL=$(grep '^DATABASE_URL_UNPOOLED=' .env.local | cut -d= -f2- | tr -d '"')
docker compose run --rm --no-deps -e DATABASE_URL -e RUN_MIGRATIONS=0 -e SEED_DEMO=0 api \
  python manage.py wait_for_db
unset DATABASE_URL
```

To keep Neon's free compute usage low (100 compute-hours a month):

- Render's health check uses `/api/health`, which never queries the database.
- `DB_CONN_MAX_AGE=0` closes connections after each request, so Neon can scale to zero while the app is idle.
- `/api/health/ready` is the database-aware check.

### First deploy

1. Push this repo to GitHub (Render deploys from a Git provider).
2. In the Render dashboard, choose **New → Blueprint**, select the repo and confirm `render.yaml`.
3. When prompted, set:
   - `DATABASE_URL`: the `DATABASE_URL_UNPOOLED` value from `.env.local`;
   - `DEMO_USER_PASSWORD`: the password for the seeded `test` / `priya` / `chris` / `sam` users.
4. Apply. Render builds both services. On first start, the API migrates the empty Neon database and seeds demo data.
5. If either service didn't get exactly `opshub-api.onrender.com` / `opshub-web.onrender.com` (the name was taken), update `VITE_API_BASE_URL` on `opshub-web` and `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` on `opshub-api` to the real URLs, then redeploy both.

After that, every push to `main` redeploys only what changed (`buildFilter`), once the [CI workflow](.github/workflows/ci.yml) passes (`autoDeployTrigger: checksPass`).

### Backups

Free plans don't guarantee backups. [`.github/workflows/db-backup.yml`](.github/workflows/db-backup.yml) runs `pg_dump` every Sunday (or on demand), encrypts the dump with AES-256 and keeps it as a workflow artifact for 90 days. To enable it, add two repository secrets:

- `NEON_DATABASE_URL`: the direct connection string;
- `BACKUP_PASSPHRASE`: a long random passphrase, also saved in your password manager.

Restore instructions are at the top of the workflow file.

### Post-deploy checklist

- `https://opshub-api.onrender.com/api/health` returns `{"status":"ok"}`, and `/api/health/ready` returns `{"status":"ok","database":"ok"}`.
- The SPA loads, deep links such as `/tickets` work after a refresh, and you can sign in as `test`.
- **Login throttling is per client.** From one network, 11 bad logins in a minute should return 429; a different network (e.g. a phone hotspot) should still get 401. If both get 429, Render adds a different number of proxy hops than assumed, so adjust `NUM_PROXIES`.
- API responses include `Strict-Transport-Security`, which confirms Django sees requests as HTTPS behind Render's proxy.

### Free-plan limits

These are from the providers' docs and 2026 comparisons; check the current [Render](https://render.com/docs/free) and [Neon](https://neon.com/pricing) pages.

- **The API sleeps** after 15 minutes without traffic, and the next request takes about a minute (plus a brief Neon wake-up). The SPA pings `/api/health` on load to start waking it early, and shows a "server is starting" message instead of failing silently.
- **Neon free:** no expiry, small storage (0.5–1 GB; the demo data is a few MB) and 100 compute-hours a month. If those hours run out, the database is suspended until the next month.
- Free Render services run a single instance, have no shell access and no pre-deploy command. That's why migrations run on container start (`RUN_MIGRATIONS=1`).

## Without Docker

Both apps still run on the host if you prefer: `uv` plus a local Postgres for `backend/`, and `pnpm dev` for `frontend/` (its proxy defaults to `localhost:8000`). See each folder's README.
