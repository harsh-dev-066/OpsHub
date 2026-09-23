# OpsHub — Property Operations Console

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
- **Settings** — demo role switcher + effective permissions list; typed `can`/`hasPermission`/`Can` gates (UX-only, not auth)
- **App shell** — responsive sidebar, top bar, breadcrumbs, consistent feedback states

## Tech stack

- React 19, Vite, TypeScript (strict)
- pnpm
- TanStack Router, TanStack Query, TanStack Table
- Tailwind CSS + Radix/shadcn-style primitives
- React Hook Form + Zod
- Recharts
- MSW
- Vitest + React Testing Library
- ESLint + Prettier

## Architecture overview

Feature-oriented structure:

- `src/app` — router, providers, layouts
- `src/features/*` — domain screens and feature-local forms/schemas
- `src/components` — shared UI, data-table, navigation, feedback
- `src/lib` — API client, query keys, permissions, utils
- `src/mocks` — MSW handlers and seed data
- `src/types` — shared domain contracts

Server state is owned by TanStack Query. Local React state is limited to UI concerns (filters, dialogs, debounced search). Pages call typed API helpers; they never import mock seed arrays.

See [.cursor/rules/architecture.md](.cursor/rules/architecture.md) for details.

## Local setup

```bash
pnpm install
pnpm dev
```

Open the printed local URL (typically `http://localhost:5173`).

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
  features/       # dashboard, properties, units, tickets, settings
  components/     # ui, data-table, feedback, navigation
  lib/            # api, query keys, permissions, utils
  mocks/          # handlers + seed data + MSW worker bootstrap
  types/          # shared domain types
  theme/          # colors, tokens, Tailwind theme, chart colors
  test/           # test setup + helpers
.cursor/rules/    # architecture, domain, API, decisions, walkthrough, theme
```

## Mock API approach

MSW intercepts `/api/*` requests in the browser and in tests.

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
- Frontend RBAC is UX-only (documented explicitly)

More in [.cursor/rules/decisions.md](.cursor/rules/decisions.md).

## Trade-offs

- Mock data is in-memory and resets on reload
- Auth is simulated via a settings role switcher
- No real backend authorization or persistence
- Table virtualization is designed for, not implemented

## Future improvements

- authenticated session against a real API
- virtualized tables for very large datasets
- richer ticket timelines / comments
- E2E coverage with Playwright
- dark theme tokens if product needs them

## Documentation

- [Architecture](.cursor/rules/architecture.md)
- [Domain model](.cursor/rules/domain-model.md)
- [API](.cursor/rules/api.md)
- [Decisions](.cursor/rules/decisions.md)
- [Interview walkthrough](.cursor/rules/interview-walkthrough.md)
- [Theme](.cursor/rules/theme.md)
