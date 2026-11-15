# Architecture

OpsHub's frontend (`frontend/`) is a Vite + React 19 SPA. It talks to the Django REST API in `backend/` via JWT auth. MSW serves the same contract for tests and offline mock mode (`VITE_USE_MOCKS=true`). All paths below are relative to `frontend/`.

The HTTP contract shared with the backend lives in [../api.md](../api.md); entities and roles are in [../domain-model.md](../domain-model.md).

## Layering

1. **Routes / pages** (`src/app/router`, `src/features/*/…-page.tsx`) compose screens.
2. **Feature modules** own page-specific tables, forms, and schemas.
3. **Shared components** (`src/components`) provide UI primitives, data-table, and feedback.
4. **API client** (`src/lib/api`) wraps `fetch` and returns typed payloads.
5. **Query layer** (`src/lib/query/keys.ts` + TanStack Query hooks in pages) owns server cache.
6. **Mocks** (`src/mocks`) implement the same contract in-browser for tests and demo mode.
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
| JWT pair (access + refresh)                       | `src/lib/auth/token-storage.ts` (`localStorage`) |
| Signed-in user + permissions                      | `SessionProvider` ← `GET /api/auth/me` |

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

## Authentication

- `AuthProvider` (`src/features/auth/auth-context.tsx`) logs in via `POST /api/auth/login` and stores `{access, refresh}`.
- `apiClient` (`src/lib/api/client.ts`) attaches `Authorization: Bearer <access>`. On a 401 it runs **one shared refresh** (`POST /api/auth/refresh`) and retries once.
- If the refresh fails, the client clears the session and dispatches `opshub:auth-expired`. `AppLayout` then routes to `/login`.
- Logout blacklists the refresh token server-side and clears the TanStack Query cache, so the next user never sees stale data.
- The route guard (`src/app/router`) only checks that a session exists. The backend rejects anything invalid.

Storage trade-off: a refresh token in `localStorage` is reachable by XSS. Short access lifetimes, rotation and blacklisting limit the blast radius. An httpOnly cookie is the next hardening step when the SPA and API share a site.

## Permissions (UI gating)

The **backend is the security boundary**. Every endpoint enforces the role → permission matrix server-side. The frontend only hides actions the user can't perform.

- `SessionProvider` exposes `can(permission)`, backed by the `permissions` array that **the server returns** from `/api/auth/me`.
- `src/lib/permissions.ts` keeps the typed `Permission` union, role descriptions and a mirror of the matrix. Settings, the MSW mock and unit tests use it. Keep it in sync with `backend/apps/accounts/roles.py`.
- Components use `usePermissions()` / `<Can permission="…" />`, never `role === 'Admin'`.

| Concern | Mechanism |
| --- | --- |
| Hook / gate | `usePermissions()`, `<Can permission="…" />` in `src/features/auth/permissions.tsx` |
| Navigation visibility | `APP_NAV_ITEMS` + `getVisibleNavItems(hasPermission)` in `src/components/navigation/nav-items.ts` |
| Ticket creation | `<Can permission="tickets:create">` on Tickets page |
| Ticket edit / status | `<Can permission="tickets:edit">` / `tickets:transition` on ticket detail |
| User management | `canManageUsers` (= `users:write`) on Users page |

## Error and empty handling

Shared feedback components:

- `QueryErrorState` — recoverable API failures
- `EmptyState` — no matching rows
- table skeletons — loading rows
- Sonner toasts — mutation success/failure

API errors are normalized by `ApiError` so users see actionable messages rather than raw stack/network text.

## Security notes

- Backend authorization and validation are the source of truth. The UI mirrors them for usability only.
- Secrets never live in frontend source. `VITE_*` variables are public at build time.
- SSO through an identity provider (OIDC/SAML) would replace username/password login in a larger deployment.
