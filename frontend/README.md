# OpsHub frontend

The React SPA for OpsHub. See the [root README](../README.md) for the full-stack quickstart and the [backend](../backend/README.md) for the API.

OpsHub is a **fictional** property-operations console built as an interview-ready public portfolio project.

It is **not** production software. It demonstrates how a production-style, data-dense React frontend can be structured when real proprietary work cannot be shared.

## Why this exists

Real production apps are often confidential. OpsHub gives interviewers something concrete to explore:

- frontend architecture and feature boundaries
- React 19 + TypeScript
- routing, server-state, forms, tables, and accessibility
- mocked API integration patterns
- loading / error / empty states
- testing and documentation habits

## Key features

- **Dashboard** — occupancy/available/maintenance/open-ticket KPIs, Recharts occupancy trend and ticket breakdowns, recent activity, quick links to properties and tickets; composed from feature sections with skeleton, error, and empty states
- **Properties** — URL-synced search/city/status/sort/pagination, row actions, shareable filters, and property detail (summary, occupancy, units, tickets, activity)
- **Units** — portfolio unit listing + resident/contract detail
- **Tickets** — URL-synced search/status/priority/category/pagination; RHF+Zod create/edit; optimistic status updates with rollback; toast success/error feedback
- **Auth** — JWT sign-in against the Django API, silent token refresh, server-computed permissions driving `can`/`Can` gates
- **Users** — admin-only user management with role transfer list and password set/reset
- **Settings** — profile and effective permissions list
- **App shell** — responsive sidebar, top bar, breadcrumbs, consistent feedback states

## Tech stack

- React 19, Vite, TypeScript (strict)
- pnpm
- TanStack Router, TanStack Query, TanStack Table
- Tailwind CSS + Radix/shadcn-style primitives
- React Hook Form + Zod
- Recharts
- MSW (tests and static demo mode)
- Vitest + React Testing Library
- ESLint + Prettier

## Architecture overview

Feature-oriented structure:

- `src/app` — router, providers, layouts
- `src/features/*` — domain screens and feature-local forms/schemas
- `src/components` — shared UI, data-table, navigation, feedback
- `src/lib` — API client (JWT + refresh), auth token storage, query keys, permissions, utils
- `src/mocks` — MSW handlers and seed data
- `src/types` — shared domain contracts

Server state is owned by TanStack Query. Local React state is limited to UI concerns (filters, dialogs, debounced search). Pages call typed API helpers; they never import mock seed arrays.

See [architecture](../.cursor/rules/frontend/architecture.md) for details.

## Local setup

Run it with Docker from the repo root (this starts the API and database too):

```bash
docker compose up --build        # http://localhost:5174
```

The `web` service builds the `dev` target of [`Dockerfile`](Dockerfile), bind-mounts this folder for hot reload, and keeps its own Linux `node_modules` in a volume. Vite proxies `/api` to the `api` service. Run commands inside it with `docker compose exec web pnpm <script>` (for example `make test-web`). After changing dependencies, run `make rebuild`.

In production, the `prod` target builds the bundle and serves it with nginx ([`nginx/default.conf.template`](nginx/default.conf.template)), which also reverse-proxies `/api` to Django on the same origin.

Without Docker: `pnpm install && cp .env.example .env.local && pnpm dev`, with the API on `localhost:8000`.

| Mode               | `.env.local`           | Backend needed                                                      |
| ------------------ | ---------------------- | ------------------------------------------------------------------- |
| Real API (default) | `VITE_USE_MOCKS=false` | Yes: Vite proxies `/api` → `http://localhost:8000`                  |
| Demo / offline     | `VITE_USE_MOCKS=true`  | No: MSW serves `/api` in the browser (sign in with `test` / `test`) |

For a production build served from a different origin than the API, set `VITE_API_BASE_URL` (e.g. `https://api.example.com`) and add that origin to the backend's `CORS_ALLOWED_ORIGINS`.

## Available scripts

| Script              | Purpose                        |
| ------------------- | ------------------------------ |
| `pnpm dev`          | Start Vite dev server          |
| `pnpm build`        | Typecheck + production build   |
| `pnpm preview`      | Preview production build       |
| `pnpm typecheck`    | TypeScript project build check |
| `pnpm lint`         | ESLint                         |
| `pnpm format`       | Prettier write                 |
| `pnpm format:check` | Prettier check                 |
| `pnpm test`         | Vitest once                    |
| `pnpm test:watch`   | Vitest watch mode              |

## Project structure

```text
src/
  app/            # shell, router, providers
  features/       # auth, dashboard, properties, units, tickets, users, settings
  components/     # ui, data-table, feedback, navigation
  lib/            # api client, auth token storage, env, query keys, permissions, utils
  mocks/          # handlers + seed data + MSW worker bootstrap
  types/          # shared domain types
  theme/          # colors, tokens, Tailwind theme, chart colors
  test/           # test setup + helpers
```

Project docs live at the repo root in `.cursor/rules/` (shared contract and domain, plus `frontend/` and `backend/` subfolders).

## Mock API approach

The real backend is Django (`../backend`). MSW implements the same contract ([api.md](../.cursor/rules/api.md)) for tests and for demo mode, intercepting `/api/*` requests in the browser and in Node.

- Handlers live in `src/mocks/handlers`
- Seed data lives in `src/mocks/data`
- Network latency is simulated in development
- Occasional mutation failures are simulated in development to exercise error UX
- Query params support search, filters, sort, and pagination

The UI treats MSW like a real backend.

## Testing approach

Vitest + React Testing Library focus on behavior:

- dashboard KPI rendering
- property search/filter
- ticket form validation
- successful and failed ticket creation
- ticket status updates
- permission-based UI
- error-state rendering

MSW is reused in tests so components exercise the same API boundary.

## Accessibility considerations

- semantic landmarks and page headings
- labeled form controls
- keyboard-accessible dialogs/menus
- visible focus styles
- status communicated with text + badges (not color alone)
- recoverable error/empty states

## Performance considerations

- server-side pagination simulation (no huge DOM tables)
- debounced search inputs
- stable query keys
- lazy-loaded chart modules on the dashboard
- route-level feature modules kept small and focused

## Major engineering decisions

- Feature folders over pure type-based folders
- TanStack Query for all server state (no Redux)
- Zod schemas co-located with ticket forms
- Shared data-table primitive separated from page business logic
- Frontend RBAC hides UI only; the backend enforces it on every request

More in [decisions](../.cursor/rules/frontend/decisions.md).

## Trade-offs

- In demo mode, mock data is in-memory and resets on reload
- The refresh token is stored in `localStorage` (see architecture for the XSS trade-off)
- Table virtualization is designed for, not implemented

## Future improvements

- virtualized tables for very large datasets
- richer ticket timelines / comments
- E2E coverage with Playwright
- dark theme tokens if product needs them

## Documentation

- [Architecture](../.cursor/rules/frontend/architecture.md)
- [Decisions](../.cursor/rules/frontend/decisions.md)
- [Interview walkthrough](../.cursor/rules/frontend/interview-walkthrough.md)
- [Theme](../.cursor/rules/frontend/theme.md)
- Shared: [API contract](../.cursor/rules/api.md), [Domain model](../.cursor/rules/domain-model.md)
