# Backend conventions

## Adding an endpoint

1. Model change goes in `models.py`. Then run `uv run manage.py makemigrations <app>` and commit the migration.
2. Put the read query in `selectors.py`. Annotate here, not in serializers, so lists stay N+1-free.
3. Put write logic in `services.py`: keyword-only args, `@transaction.atomic`, call `record_activity()` for user-visible changes.
4. Write serializers: one for output (read-only fields), one for input (`*WriteSerializer`).
5. In the view, set `required_permissions` for **every** action (the default is deny), plus `sort_fields`/`default_sort`, `filterset_class` and `search_fields` for lists.
6. Register the route in the app's `urls.py` with `ApiRouter` (no trailing slash).
7. Update [../api.md](../api.md) and the frontend types/MSW handlers if the contract changed.
8. Add tests. If a permission is involved, add the endpoint to `apps/core/tests/test_permissions_matrix.py`.

## Style

- Format and lint with `uv run ruff format . && uv run ruff check .` (line length 100).
- Type-hint public functions. Services take keyword-only arguments (`*, actor, ...`).
- Raise DRF exceptions (`ValidationError`, `PermissionDenied`, `NotFound`) or `core.exceptions.ConflictError`. Never return error `Response`s by hand. Messages must be user-readable sentences, because the UI shows them verbatim.
- Python stays snake_case. The camelCase renderer and parser handle the wire format. FilterSet field names are the exception (`propertyId`), because query params aren't converted.
- Don't put business rules in models' `save()` or in signals. Keep them in services, where they're explicit.

## Settings and secrets

- All configuration comes from the environment (see `.env.example`). Never commit `.env`.
- `config.settings.dev` is the default for `manage.py`. `config.settings.prod` is the default for WSGI/ASGI. `config.settings.test` is the default for pytest.

## Testing

- Use `pytest` + `pytest-django` + `factory_boy`, against real PostgreSQL (ArrayField, functional constraints).
- Use the shared fixtures in `apps/conftest.py`: `make_client(*roles)`, plus `admin_client`, `manager_client`, `agent_client` and `viewer_client`. They authenticate with **real JWTs**.
- Put factories in `apps/factories.py`.
- Test through HTTP (`/api/...`) for contract and permission behavior. Call selectors directly only for tricky computations (e.g. the occupancy trend).
- Guard list endpoints against N+1 with `CaptureQueriesContext`.

## Migrations

- One migration per logical change, named descriptively (`--name add_ticket_due_date`).
- Never edit a migration that has been applied in a shared environment. Add a new one instead.
- Data migrations go in `RunPython` with a reverse function.

## Running commands

Everything runs in Docker (see the root README). Execute management and tooling commands in the `api` container, e.g. `docker compose exec api python manage.py makemigrations` or `make migrations`. Add dependencies with `docker compose exec api uv add <pkg>`, then run `make rebuild` so the image picks them up. Commit both `pyproject.toml` and `uv.lock`.
