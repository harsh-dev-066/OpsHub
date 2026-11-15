# Backend architecture

`backend/` is a Django 5.2 + Django REST Framework API on PostgreSQL. It implements the contract in [../api.md](../api.md) for the domain in [../domain-model.md](../domain-model.md). Paths below are relative to `backend/`.

## Layout

```text
config/
  settings/base.py   # shared settings; everything env-driven via django-environ
  settings/dev.py    # DEBUG, localhost CORS, browsable API
  settings/test.py   # fast hashing, relaxed throttles
  settings/prod.py   # HTTPS/HSTS, secure cookies, whitenoise manifest storage
  urls.py            # mounts every app under /api, plus /api/schema and /api/docs
apps/
  core/        # shared plumbing, no tables: IDs, pagination, errors, sorting, permissions, health, seed_demo
  accounts/    # custom User, roles/permission matrix, JWT auth views, user management
  properties/  # Property, occupancy rollups, /meta/cities
  units/       # Unit, current-lease annotations, /properties/:id/units
  leasing/     # Resident, Contract (read-only lists)
  tickets/     # Ticket workflow, field-level authorization, /properties/:id/tickets
  activity/    # ActivityItem feed + record_activity()
  dashboard/   # read-only aggregates (no models)
  conftest.py, factories.py   # shared test fixtures
```

## Layers inside an app

Each domain app has the same files, and each file has one job:

| File | Responsibility | May import |
| --- | --- | --- |
| `models.py` | Schema, constraints, indexes, tiny computed properties | `core.models` |
| `selectors.py` | **Reads**: querysets with annotations/`select_related`; `get_x()` raises 404 | models, other apps' selectors |
| `services.py` | **Writes** and business rules, in `transaction.atomic`; records activity | models, `activity.services` |
| `serializers.py` | Input validation (`*WriteSerializer`) and output shape (`*Serializer`) | selectors (for nested detail) |
| `filters.py` | django-filter `FilterSet` for query params | models |
| `views.py` | Thin HTTP glue: declare permissions, validate, call service, serialize | everything above |
| `urls.py` | Routes (no trailing slash) | views |

Views never call `.save()` or `.objects.create()`. Services never touch `request`.

Read flow:

```
request → JWTAuthentication → HasAppPermission → FilterSet/Search/CamelSortFilter → selector queryset → StandardPagination → Serializer → CamelCaseJSONRenderer
```

Write flow:

```
request → JWTAuthentication → HasAppPermission → *WriteSerializer.is_valid → (field-level checks) → service (atomic + activity) → read serializer
```

## Cross-cutting pieces (`apps/core`)

- **`HasAppPermission`**: a default DRF permission. Each view declares `required_permissions = {action_or_method: perm | (any_of, …)}`. Missing entries are **denied** (fail closed).
- **`StandardPagination`**: produces the `{data, page, pageSize, total, totalPages}` envelope. It clamps bad input and returns an empty page past the end.
- **`CamelSortFilter`**: reads `sortBy`/`sortDirection` against a per-view `sort_fields` whitelist, with `default_sort`. It always adds `pk` as a tie-breaker.
- **`api_exception_handler`**: shapes every error as `{message, code, errors?}`. Unhandled exceptions are logged and returned as a generic 500.
- **`PrefixedId`**: generates string primary keys like `tkt-3f9a1c0b7e2d`.
- **`seed_demo`**: a deterministic port of the frontend mock seed, with dates relative to today.

## Authentication

SimpleJWT handles tokens:

- Access tokens last 15 min and refresh tokens 7 days.
- Refresh tokens rotate, and used ones are blacklisted (`token_blacklist`).
- `CHECK_REVOKE_TOKEN` embeds a hash of the password in each token, so a password reset invalidates all of the user's tokens.
- Inactive users are rejected at login, on refresh and on every request.
- Login is throttled per IP (`LOGIN_THROTTLE_RATE`). Usernames are normalized to lowercase.

## Runtime

- **Dev** (`docker compose up`): the `dev` image target runs `runserver` with the source bind-mounted.
- **Prod** (`docker-compose.prod.yml`): the `prod` target runs gunicorn (3 workers) behind nginx.
- On start, `docker-entrypoint.sh` runs `wait_for_db`, then `migrate` if `RUN_MIGRATIONS=1`, then `seed_demo --if-empty` if `SEED_DEMO=1`.
- The cache (`CACHES`) is shared across workers (PostgreSQL by default) because login throttling depends on it.

## Data integrity

- Unique constraints: case-insensitive `username` and `email`; `(property, unit_number)`.
- Check constraint: `contract.end_date >= start_date`.
- `PROTECT` on property → units/tickets and unit → contracts: history can't be silently cascaded away.
- Property rollups and unit lease fields are annotations (`Count(filter=…)`, `Subquery`). They can't drift and stay sortable.
- Indexes back every filter and sort column.

## Performance

- List endpoints run in a constant number of queries: auth user, count and page. Tests assert this.
- Detail endpoints run a handful of queries for the embedded objects.
- The dashboard runs one aggregate query per widget. The occupancy trend is a single query with 12 conditional `Count`s.
