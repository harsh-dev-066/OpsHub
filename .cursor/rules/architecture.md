# Architecture

OpsHub is a Vite + React 19 SPA that talks to a mocked REST API through MSW.

## Layering

1. **Routes / pages** (`src/app/router`, `src/features/*/…-page.tsx`) compose screens.
2. **Feature modules** own page-specific tables, forms, and schemas.
3. **Shared components** (`src/components`) provide UI primitives, data-table, and feedback.
4. **API client** (`src/lib/api`) wraps `fetch` and returns typed payloads.
5. **Query layer** (`src/lib/query/keys.ts` + TanStack Query hooks in pages) owns server cache.
6. **Mocks** (`src/mocks`) implement network behavior and seed data.
7. **Theme** (`src/theme`) owns colors, radius, typography, and chart tokens.

Pages never import seed arrays. That keeps the UI portable to a real backend.

## Dashboard composition

`DashboardPage` is a thin layout. Data and UI live in focused sections:

- `dashboard-kpis.tsx` — summary KPIs
- `occupancy-trend-section.tsx` / `tickets-breakdown-sections.tsx` — Recharts (lazy-loaded)
- `recent-activity-section.tsx` — operational feed with deep links
- `dashboard-quick-links.tsx` — navigation to properties and tickets

Each section owns its TanStack Query call so loading and errors recover independently.

## State ownership

| Concern                                           | Owner                              |
| ------------------------------------------------- | ---------------------------------- |
| Properties/units/tickets/dashboard payloads       | TanStack Query                     |
| Filter inputs, dialog open state, pagination page | Local React state                  |
| Demo role                                         | `SessionProvider` + `localStorage` |

## Routing

TanStack Router defines:

- `/` → redirect to `/dashboard`
- `/dashboard`
- `/properties`, `/properties/$propertyId`
- `/units`, `/units/$unitId`
- `/tickets`, `/tickets/$ticketId`
- `/settings`
- not-found fallback

## Forms and validation

Ticket create/edit uses React Hook Form + Zod (`src/features/tickets/ticket-schema.ts`).

Unit options depend on the selected property and reset when the property changes.

## Permissions (frontend RBAC demo)

OpsHub demonstrates RBAC as a **UX layer only**. It is not secure authentication and must not be treated as authorization.

### Model (`src/lib/permissions.ts`)

- Typed `Permission` union and `PermissionUser` subject
- Single role → permission map (Admin, Operations Manager, Support Agent, Viewer)
- Reusable utilities — prefer these over role string checks in components:
  - `can(user, permission)`
  - `hasPermission(user, permission)`
  - `canAny` / `canAll`
  - `getPermissionsForRole(role)`

### UI wiring

| Concern | Mechanism |
| --- | --- |
| Hook / gate | `usePermissions()`, `<Can permission="…" />` in `src/features/auth/permissions.tsx` |
| Navigation visibility | `APP_NAV_ITEMS` + `getVisibleNavItems(hasPermission)` in `src/components/navigation/nav-items.ts` |
| Ticket creation | `<Can permission="tickets:create">` on Tickets page |
| Ticket edit / status | `<Can permission="tickets:edit">` / `tickets:transition` on ticket detail |
| Property modification | `<Can permission="properties:write">` Edit property action |
| Unit modification | `<Can permission="units:write">` Edit unit action |
| Demo role switcher | Settings page; stores role in `localStorage` |

Components should not hardcode `if (role === 'Admin')` checks.

### Demo vs real security

| Frontend demo | Real application |
| --- | --- |
| Role switcher in Settings | Identity provider (OIDC/SAML/etc.) |
| `can` / `hasPermission` hide buttons | API authorizes every mutation |
| MSW accepts requests that match handlers | Server validates identity + scopes |
| UX-only — forgeable from the browser | Backend is the security boundary |

Settings shows an explicit warning and an “effective permissions” list so interviewers can inspect the model live.

## Error and empty handling

Shared feedback components:

- `QueryErrorState` — recoverable API failures
- `EmptyState` — no matching rows
- table skeletons — loading rows
- Sonner toasts — mutation success/failure

API errors are normalized by `ApiError` so users see actionable messages rather than raw stack/network text.

## Security / real-world notes

If this were connected to production systems:

- backend authorization would be the source of truth
- API input validation would be required server-side
- authentication would come from an identity provider
- secrets would never live in frontend source
- third-party integrations would be isolated behind API/service boundaries
- frontend permission maps would remain a convenience for hiding unavailable actions — never the security boundary
