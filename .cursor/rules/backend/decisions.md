# Backend decisions

## Django + DRF + PostgreSQL

Mature auth, admin, migrations and ORM. DRF gives serializers, throttling and content negotiation. PostgreSQL enables `ArrayField` roles, functional unique constraints (`Lower(email)`) and filtered aggregates.

## Keep the existing frontend contract

The API reproduces the MSW contract exactly: paths without trailing slashes, camelCase, the `{data, page, …}` envelope, `{message}` errors and plain-array users/cities. This let the frontend switch backends with changes only to auth and the ticket assignee. The few intentional additions (`assigneeId`, `password`, `/auth/*`) are recorded in [../api.md](../api.md).

## Selectors / services split

Reads and writes have different concerns: query shape vs. invariants plus side effects. Separating them keeps views thin, makes business rules testable without HTTP, and gives one obvious place for each kind of change.

## Opaque prefixed string IDs

The frontend already treats IDs as strings, and the seed uses `prop-001`-style IDs. Prefixed random IDs (`tkt-3f9a…`) don't leak row counts, are self-describing in logs, and let the seed keep stable IDs for parity with the mock.

## Computed rollups instead of counters

`Property.totalUnits` and the other rollups are annotations, not columns. With ~50 units per property the aggregate costs little, and it removes a class of bugs: the old mock needed `recalculatePropertyOccupancy()` after every unit change.

## Multi-role users stored as an array

The UI already supports several roles per user. An `ArrayField` of role choices is simpler than Django Groups and Permissions for a fixed, code-defined matrix. The matrix lives in Python (`roles.py`) so it is versioned, reviewed and tested like code.

## Fail-closed authorization

`HasAppPermission` denies any action not listed in `required_permissions`. A forgotten entry produces a 403 in tests, never an accidental data leak.

## Field-level ticket authorization

Status changes (`tickets:transition`) and field edits (`tickets:edit`) are separate grants in the matrix, so the PATCH endpoint checks which fields are in the payload.

## JWT with rotation, blacklist and revoke-on-password-change

The SPA can be hosted on a different origin from the API (Netlify plus an API host), where cookie-based sessions need cross-site cookie and CSRF configuration. Short-lived access tokens, rotating refresh tokens and server-side blacklisting give a revocable session. The known trade-off is that the refresh token sits in `localStorage` (see the frontend architecture doc).

## Ticket assignee as a foreign key

Previously the assignee was a free-text name. It is now a foreign key to `User`, which guarantees referential integrity and active-only assignment. The API still returns the display name as `assignee` so existing UI rendering is unchanged.

## Not ported from MSW

Fault injection (`forceError`, `X-Mock-Fail`, random 5% failures) and artificial latency stay mock-only. They are frontend testing aids and would be harmful in a real API.

## Shared cache in PostgreSQL

Login throttling stores counters in the cache. Gunicorn runs several worker processes, and a per-process `LocMemCache` would multiply the effective limit by the worker count (observed: 3 workers allowed about 30 attempts/min instead of 10). The default cache is therefore Django's database cache (its table is created by `core.0001_create_cache_table`), which needs no new service. Set `CACHE_URL` to Redis when traffic warrants it.

## Trust X-Forwarded-For only from known proxies

`NUM_PROXIES` defaults to 0, so the client-supplied `X-Forwarded-For` header is ignored. Behind nginx it is 1, so DRF uses the address nginx appended. A spoofed header can't dodge the login throttle in either mode.

## Everything runs in Docker

`docker-compose.yml` is the dev stack: bind-mounted source with hot reload, and dependencies baked into images. `docker-compose.prod.yml` runs the `prod` image targets: gunicorn behind nginx on one origin. nginx re-resolves the `api` hostname through Docker DNS so a recreated API container is picked up without restarting nginx.
