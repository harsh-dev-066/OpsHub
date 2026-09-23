# API

OpsHub talks to a REST-shaped `/api` surface. In local development and tests, **MSW** intercepts those requests and serves an in-memory mock database.

UI components must never import seed arrays or handlers. They call typed helpers in `src/lib/api`, the same way they would call a real backend.

## Layout

```text
src/mocks/data/       # in-memory seed database
src/mocks/handlers/   # MSW route handlers
src/mocks/browser.ts  # browser worker bootstrap
src/mocks/server.ts   # Node/test server bootstrap
src/lib/api/          # typed client + service functions
```

## Seed volume (approximate)

| Entity     | Count |
| ---------- | ----- |
| Properties | 12    |
| Units      | ~46   |
| Residents  | ~36   |
| Contracts  | ~36   |
| Tickets    | ~42   |
| Users      | 4     |

Enough to exercise search, filters, sorting, and pagination.

## Conventions

- JSON request/response bodies
- List endpoints return:

```ts
{
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}
```

### Query parameters

| Param           | Used by                                      |
| --------------- | -------------------------------------------- |
| `search`        | properties, units, tickets, residents        |
| `page`          | all list endpoints (default `1`)             |
| `pageSize`      | all list endpoints (default `10`)            |
| `status`        | properties, units, tickets, contracts        |
| `city`          | properties                                   |
| `priority`      | tickets                                      |
| `category`      | tickets                                      |
| `sortBy`        | list endpoints                               |
| `sortDirection` | `asc` \| `desc`                              |
| `propertyId`    | units, tickets                               |
| `forceError`    | any endpoint — controlled failure (`1`)      |

## Network behavior

- **Latency**: ~200–600ms in development; disabled in tests
- **Random mutation failures**: ~5% on `POST`/`PATCH` tickets in development only (disabled in tests)
- **Controlled failures** (dev + tests):
  - query: `?forceError=1`
  - header: `X-Mock-Fail: 1`

Forced failures return HTTP 500 with:

```json
{ "message": "Forced mock failure for development/testing." }
```

Use these to exercise loading/error UI and optimistic-update rollback without relying on randomness.

## Endpoints

| Method | Path                                 | Purpose                                    |
| ------ | ------------------------------------ | ------------------------------------------ |
| GET    | `/api/dashboard/summary`             | KPI summary                                |
| GET    | `/api/dashboard/occupancy`           | Occupancy trend points                     |
| GET    | `/api/dashboard/tickets-by-priority` | Chart breakdown                            |
| GET    | `/api/dashboard/tickets-by-status`   | Chart breakdown                            |
| GET    | `/api/dashboard/activity`            | Recent activity feed                       |
| GET    | `/api/properties`                    | Paginated properties                       |
| GET    | `/api/properties/:id`                | Property detail                            |
| GET    | `/api/properties/:id/units`          | Property units                             |
| GET    | `/api/properties/:id/tickets`        | Property tickets                           |
| GET    | `/api/units`                         | Paginated units                            |
| GET    | `/api/units/:id`                     | Unit detail (+ resident/contract/property) |
| GET    | `/api/residents`                     | Paginated residents                        |
| GET    | `/api/contracts`                     | Paginated contracts                        |
| GET    | `/api/tickets`                       | Paginated tickets                          |
| GET    | `/api/tickets/:id`                   | Ticket detail (+ property/unit)            |
| POST   | `/api/tickets`                       | Create ticket                              |
| PATCH  | `/api/tickets/:id`                   | Update ticket fields/status                |
| GET    | `/api/users`                         | Assignee options                           |
| GET    | `/api/meta/cities`                   | City filter options                        |

## Frontend access

Typed service modules in [`src/lib/api/index.ts`](../src/lib/api/index.ts):

- `dashboardApi`
- `propertiesApi`
- `unitsApi`
- `residentsApi`
- `contractsApi`
- `ticketsApi`
- `usersApi`

Shared transport: `apiClient` + `ApiError` in [`src/lib/api/client.ts`](../src/lib/api/client.ts).

TanStack Query hooks in feature pages own caching; they call these services only.
