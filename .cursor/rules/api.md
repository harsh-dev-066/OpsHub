# API contract

This is the REST contract between `frontend/` and `backend/`. Both sides implement it:

- **Django** (`backend/`) is the real implementation, backed by PostgreSQL.
- **MSW** (`frontend/src/mocks`) is an in-browser copy used by frontend tests and offline mock mode (`VITE_USE_MOCKS=true`).

Change the contract here first, then update both implementations (and `frontend/src/types/domain.ts`). The live OpenAPI schema is served by the backend at `/api/schema`, with Swagger UI at `/api/docs`.

UI components never import seed arrays or handlers. They call typed helpers in `frontend/src/lib/api`.

## Conventions

- Base path is `/api`, with **no trailing slashes** (`/api/tickets`, not `/api/tickets/`).
- JSON bodies use **camelCase** (the backend converts to snake_case internally).
- IDs are opaque prefixed strings (`prop-…`, `unit-…`, `tkt-…`, `user-…`). Never parse them.
- Timestamps are ISO 8601 with time zone. Contract and move-in dates are `YYYY-MM-DD`.
- Money (`monthlyRate`) is a JSON number.

### Authentication

Every endpoint except `auth/login`, `auth/refresh`, `auth/logout` and `health` requires:

```
Authorization: Bearer <access token>
```

| Token   | Lifetime (default) | Notes |
| ------- | ------------------ | ----- |
| access  | 15 min             | Sent on every request. |
| refresh | 7 days             | Rotated on each refresh. The old one is blacklisted. |

- Changing a user's password or deactivating them invalidates all their existing tokens.
- On a `401`, the client refreshes once (single-flight) and retries. If the refresh fails, the session is over.

### Pagination

List endpoints return:

```ts
{ data: T[]; page: number; pageSize: number; total: number; totalPages: number }
```

- `page` defaults to 1 and `pageSize` defaults to 10 (max 100).
- Invalid values fall back to the defaults.
- A page past the end returns `data: []`, not a 404.
- `totalPages` is at least 1.

Exceptions: `GET /api/users` and `GET /api/meta/cities` return plain arrays.

### Query parameters

| Param           | Used by                                        |
| --------------- | ---------------------------------------------- |
| `search`        | properties, units, tickets, residents (case-insensitive contains) |
| `page`          | all paginated lists                            |
| `pageSize`      | all paginated lists                            |
| `status`        | properties, units, tickets, contracts          |
| `city`          | properties                                     |
| `priority`      | tickets                                        |
| `category`      | tickets                                        |
| `type`          | units                                          |
| `propertyId`    | units, tickets                                 |
| `assigneeId`    | tickets                                        |
| `sortBy`        | list endpoints (whitelisted per resource; unknown values use the default sort) |
| `sortDirection` | `asc` \| `desc`                                |

Ticket `sortBy=priority` sorts by severity (low → critical), not alphabetically.

### Errors

Every error body has this shape:

```json
{ "message": "Human-readable sentence", "code": "validation_error", "errors": { "title": ["…"] } }
```

`message` is always safe to show in a toast. `errors` is only present for `400` validation failures and maps camelCase field names to messages.

| Status | When |
| ------ | ---- |
| 400 | Validation failed |
| 401 | Missing, invalid or expired token; bad login |
| 403 | Authenticated but lacking the permission (see [domain-model.md](./domain-model.md)) |
| 404 | Unknown ID |
| 405 | Method not supported (e.g. DELETE) |
| 409 | Conflict (duplicate username/email) |
| 429 | Login throttled |

## Endpoints

| Method | Path                                 | Permission | Purpose |
| ------ | ------------------------------------ | ---------- | ------- |
| POST   | `/api/auth/login`                    | public     | `{username, password}` → `{access, refresh, user}` |
| POST   | `/api/auth/refresh`                  | public     | `{refresh}` → `{access, refresh}` |
| POST   | `/api/auth/logout`                   | public     | `{refresh}` → 204 (blacklists the token) |
| GET    | `/api/auth/me`                       | signed in  | Current user, plus `role` and `permissions[]` |
| GET    | `/api/health`                        | public     | Liveness only (never touches the DB; used by platform health checks) |
| GET    | `/api/health/ready`                  | public     | Readiness: process up and DB reachable (503 otherwise) |
| GET    | `/api/dashboard/summary`             | `dashboard:read` | KPI summary |
| GET    | `/api/dashboard/occupancy`           | `dashboard:read` | Last 12 months `{month, occupancyRate}` |
| GET    | `/api/dashboard/tickets-by-priority` | `dashboard:read` | `{name, value}[]`, zero-filled |
| GET    | `/api/dashboard/tickets-by-status`   | `dashboard:read` | `{name, value}[]`, zero-filled |
| GET    | `/api/dashboard/activity`            | `dashboard:read` | Latest 12 activity items |
| GET    | `/api/properties`                    | `properties:read` | Paginated properties (with unit rollups) |
| POST   | `/api/properties`                    | `properties:write` | Create property |
| GET    | `/api/properties/:id`                | `properties:read` | Property detail |
| PATCH  | `/api/properties/:id`                | `properties:write` | Update property |
| GET    | `/api/properties/:id/units`          | `units:read` | Units of a property (404 if the property is unknown) |
| GET    | `/api/properties/:id/tickets`        | `tickets:read` | Tickets of a property (404 if the property is unknown) |
| GET    | `/api/meta/cities`                   | `properties:read` | Distinct cities (`string[]`) |
| GET    | `/api/units`                         | `units:read` | Paginated units |
| POST   | `/api/units`                         | `units:write` | Create unit |
| GET    | `/api/units/:id`                     | `units:read` | Unit plus `residentDetail`, `contract`, `property` |
| PATCH  | `/api/units/:id`                     | `units:write` | Update unit |
| GET    | `/api/residents`                     | `units:read` | Paginated residents |
| GET    | `/api/contracts`                     | `units:read` | Paginated contracts |
| GET    | `/api/tickets`                       | `tickets:read` | Paginated tickets |
| POST   | `/api/tickets`                       | `tickets:create` | Create ticket |
| GET    | `/api/tickets/:id`                   | `tickets:read` | Ticket plus `property`, `unit` |
| PATCH  | `/api/tickets/:id`                   | `tickets:edit` / `tickets:transition` | Update fields / status (checked per field) |
| GET    | `/api/users`                         | `users:read` | All users (plain array) |
| POST   | `/api/users`                         | `users:write` | Create user (with password) |
| GET    | `/api/users/:id`                     | `users:read` | User detail |
| PATCH  | `/api/users/:id`                     | `users:write` | Update name/email/roles/status, or reset the password |

### Request bodies

**Ticket create / update**

```ts
{
  title: string           // 3–120 chars
  description?: string    // ≤ 2000 chars
  category: TicketCategory
  priority: TicketPriority
  status?: TicketStatus   // update only (needs tickets:transition)
  propertyId: string
  unitId?: string | null  // must belong to propertyId
  assigneeId?: string | null  // an active user's id
}
```

Ticket responses include both `assignee` (display name, read-only) and `assigneeId`.

**User create / update**

```ts
{
  name: string
  email: string                // unique, case-insensitive
  username: string             // create only; immutable; stored lowercase
  password: string             // create: required; update: optional reset (≥ 8 chars, Django validators)
  roles: Role[]                // ≥ 1; 'Admin' cannot be assigned
  status?: 'active' | 'inactive'
}
```

Admin accounts cannot be modified through the API (403).

## Mock-only behaviour (MSW)

These exist only in `frontend/src/mocks` to exercise UI states. The real API does not implement them.

- **Latency**: about 200–600 ms in development, disabled in tests.
- **Random mutation failures**: about 5% on ticket `POST`/`PATCH` in development.
- **Forced failures**: `?forceError=1` or the `X-Mock-Fail: 1` header returns a 500.
- **Mock tokens** look like `mock-access.<userId>`. Seeded mock users all use the password `test`.

## Seed volume

Both `manage.py seed_demo` and the MSW seed produce about 12 properties, 46 units, 42 tickets and 4 users (`test` = Admin, `priya`, `chris`, `sam`).
