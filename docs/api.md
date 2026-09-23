# API

All endpoints are mocked by MSW under `/api`.

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

- Common query params: `search`, `page`, `pageSize`, `status`, `city`, `priority`, `category`, `sortBy`, `sortDirection`, `propertyId`
- Dev mode adds realistic latency
- Mutations may occasionally fail in development to exercise rollback/toasts
- Test mode disables latency and random failures

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
| GET    | `/api/tickets`                       | Paginated tickets                          |
| GET    | `/api/tickets/:id`                   | Ticket detail (+ property/unit)            |
| POST   | `/api/tickets`                       | Create ticket                              |
| PATCH  | `/api/tickets/:id`                   | Update ticket fields/status                |
| GET    | `/api/users`                         | Assignee options                           |
| GET    | `/api/meta/cities`                   | City filter options                        |

## Frontend access

Typed helpers live in `src/lib/api/index.ts` and are consumed through TanStack Query in feature pages.
