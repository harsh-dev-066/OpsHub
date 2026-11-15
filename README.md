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

## Deploying to Render

[`render.yaml`](render.yaml) is a Render Blueprint that creates the whole stack on free plans in the Singapore region:

| Resource | Render type | Built from |
| --- | --- | --- |
| `opshub-db` | PostgreSQL 16 | — |
| `opshub-api` | Web service (Docker) | `backend/Dockerfile`, last stage = `prod` (gunicorn) |
| `opshub-web` | Static site | `frontend/`, `pnpm build` → `frontend/dist` |

The SPA calls the API directly at `https://opshub-api.onrender.com`; CORS allows the SPA's origin. The JWT is sent in the `Authorization` header, so no cross-site cookies are involved.

### First deploy

1. Push this repo to GitHub (Render deploys from a Git provider).
2. In the Render dashboard, choose **New → Blueprint**, select the repo and confirm `render.yaml`.
3. When prompted, set `DEMO_USER_PASSWORD` (the password for the seeded `test` / `priya` / `chris` / `sam` users).
4. Apply. Render creates the database, builds both services, and on first start the API migrates and seeds demo data.
5. If either service didn't get exactly `opshub-api.onrender.com` / `opshub-web.onrender.com` (the name was taken), update `VITE_API_BASE_URL` on `opshub-web` and `CORS_ALLOWED_ORIGINS` / `CSRF_TRUSTED_ORIGINS` on `opshub-api` to the real URLs, then redeploy both.

After that, every push to `main` redeploys only what changed (`buildFilter`), once the [CI workflow](.github/workflows/ci.yml) passes (`autoDeployTrigger: checksPass`).

### Post-deploy checklist

- `https://opshub-api.onrender.com/api/health` returns `{"status":"ok","database":"ok"}`.
- The SPA loads, deep links such as `/tickets` work after a refresh, and you can sign in as `test`.
- **Login throttling is per client.** From one network, 11 bad logins in a minute should return 429; a different network (e.g. a phone hotspot) should still get 401. If both get 429, Render adds a different number of proxy hops than assumed, so adjust `NUM_PROXIES`.
- API responses include `Strict-Transport-Security`, which confirms Django sees requests as HTTPS behind Render's proxy.

### Free-plan limits

These are from Render's docs as of November 2026; check the current [free plan page](https://render.com/docs/free).

- **The API sleeps** after 15 minutes without traffic, and the next request takes about a minute. The SPA pings `/api/health` on load to start waking it early, and shows a "server is starting" message instead of failing silently.
- **The free database expires 30 days after creation** and is deleted 14 days later, with no backups. Before relying on the data, upgrade `opshub-db`'s plan, or point `DATABASE_URL` at another Postgres (e.g. Neon) and remove the `databases` entry.
- Free services run a single instance, have no shell access and no pre-deploy command. That's why migrations run on container start (`RUN_MIGRATIONS=1`).

## Without Docker

Both apps still run on the host if you prefer: `uv` plus a local Postgres for `backend/`, and `pnpm dev` for `frontend/` (its proxy defaults to `localhost:8000`). See each folder's README.
