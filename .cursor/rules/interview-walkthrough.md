# Interview walkthrough

OpsHub is a **fictional** property-operations console. It is an interview portfolio stand-in for proprietary work — **not** production software. Every `/api/*` call is served by **MSW** in development and tests. There is no real backend, identity provider, or server-side authorization.

Use this doc to rehearse. Be honest about what is mocked.

---

## 2-minute project overview

OpsHub is a React 19 + TypeScript SPA for property operations: dashboard KPIs, properties, units, and support tickets.

**What it demonstrates**

- Feature-oriented architecture with a clean API boundary
- TanStack Router + Query + Table for routing, server state, and lists
- URL-synced filters on properties and tickets
- Ticket create/edit with React Hook Form + Zod
- One carefully scoped optimistic update (ticket status) with rollback
- Frontend RBAC as **UX-only** (`can` / `hasPermission` / `<Can />`)
- Loading, error, and empty states; accessibility basics; Vitest + RTL + MSW

**What it does not pretend to be**

- Not authenticated
- Not authorized on the server
- Not persistent across full page reloads (in-memory mock DB)
- Not a full CRUD product (property/unit “Edit” is a gated UX demo toast)

**One-liner for interviewers**

> The UI only talks to `fetch('/api/...')` through a typed client. MSW implements that REST contract in memory. Session and RBAC are demo UX in `localStorage`; the mock API accepts ticket writes regardless of role.

---

## Architecture explanation

```text
Browser UI
  → typed API client (src/lib/api)
  → fetch('/api/...')
  → MSW handlers (src/mocks)  [dev + tests]
  → in-memory seed DB
```

| Layer | Responsibility |
| --- | --- |
| `src/app` | Router, providers, layout shell |
| `src/features/*` | Domain screens, columns, filters, schemas |
| `src/components` | Shared UI, DataTable, feedback, navigation |
| `src/lib` | API client, query keys, permissions, utils |
| `src/mocks` | Handlers + seed data |
| `src/theme` | Design tokens |
| `src/types` | Shared domain contracts |

**State ownership**

| Concern | Owner |
| --- | --- |
| Lists, details, dashboard payloads | TanStack Query |
| Property/ticket filters | URL search params (Zod-validated) |
| Unit search/status/page | Mostly local React state (`propertyId` is URL) |
| Dialogs, mobile nav | Local React state |
| Demo role | `SessionProvider` + `localStorage` |

Pages never import seed arrays. Swapping MSW for a real API should not require rewriting feature pages — only the network layer and auth.

Details: [architecture.md](./architecture.md), [decisions.md](./decisions.md).

---

## 5-minute technical walkthrough

Suggested live path (~5 minutes of coding screen).

### 1. Shell + routing (~45s)

- Open sidebar: primary nav filtered by permission (`nav-items.ts` + `hasPermission`)
- Mention route-level `lazy()` + Suspense in `src/app/router`
- Show Settings role in the header (demo session, not login)

### 2. Dashboard (~45s)

- Thin `DashboardPage`; each section owns its Query call
- Independent skeleton / error / empty per section
- Lazy-loaded Recharts; figcaption text summaries for screen readers

### 3. Properties list (~60s)

- URL-synced search, status, city, sort, pagination
- Shared `DataTable` with server-driven sort/pagination
- Open a property → summary metrics, tabs (units / tickets / activity)
- Note: “Edit property” is permission-gated and toast-only (demo)

### 4. Tickets + forms (~90s) — highlight

- List filters in the URL; create dialog with RHF + Zod
- Dependent unit field resets when property changes
- Detail: status select uses **optimistic update** + rollback on failure
- Create/edit wait for the server, then invalidate tickets + dashboard keys

### 5. RBAC (~45s)

- Settings → switch to Viewer → Create / Edit / status controls disappear
- Switch to Support Agent → no Edit property / Edit unit
- Say clearly: UX-only; backend would be the security boundary

### Closing (~15s)

- Point at tests (`pnpm test`) and docs under `.cursor/rules/`
- Offer to discuss production changes (auth, real API, E2E)

---

## Why each major technology was chosen

| Technology | Why |
| --- | --- |
| **React 19 + Vite + TS strict** | Current SPA baseline; fast feedback; type safety without ceremony |
| **pnpm** | Deterministic installs; common in serious FE shops |
| **TanStack Router** | Typed routes + search params as first-class state |
| **TanStack Query** | Server cache, invalidation, optimistic updates — right tool for resource UIs |
| **TanStack Table v8** | Headless table control; v8 matches common shadcn patterns |
| **Tailwind + Radix/shadcn-style** | Consistent primitives; accessible dialogs/selects without reinventing focus traps |
| **RHF + Zod** | Form draft state separate from server state; schema next to ticket feature |
| **Recharts** | Adequate for interview dashboards; lazy-loaded so list routes stay light |
| **MSW** | Honest network boundary in browser and tests; same handlers both places |
| **Vitest + RTL** | Behavior tests at the component/API boundary without a full E2E stack |

**Explicit non-choices**

- No Redux — Query covers server state; local UI state is small
- No real auth library — would imply production security we do not have
- No table virtualization yet — page sizes are small; DataTable stays swappable

---

## Likely interviewer questions (concise answers)

**Q: Why TanStack Query instead of Redux?**  
A: This UI is resource-driven. Query gives caching, stale times, retries, and invalidation without global action/reducer boilerplate. Local UI state stays in React.

**Q: Why is only ticket status optimistic?**  
A: Status is a single enum field — easy to patch in detail + list caches and roll back. Multi-field create/edit is harder to patch correctly and less latency-sensitive here, so those wait for the server then invalidate.

**Q: How would you replace MSW with a real API?**  
A: Keep `src/lib/api` and query keys. Point `fetch` at a real base URL, add auth headers, remove MSW from the production bootstrap. Feature pages should not care.

**Q: Is the RBAC secure?**  
A: No. It only hides UI. Roles live in `localStorage`. MSW does not check permissions. Production needs an IdP and server-side authorization on every mutation.

**Q: Why put filters in the URL?**  
A: Bookmarkable/shareable views; refresh-safe; keeps list state out of ephemeral component memory. Search is debounced before writing to the URL.

**Q: Why feature folders?**  
A: Interviewers (and teammates) navigate by product area. Ticket schema, columns, and pages live together; shared chrome stays in `components/`.

**Q: How do you handle errors?**  
A: `ApiError` normalizes HTTP failures. Lists/details use `QueryErrorState` with retry. Mutations toast failures. Create keeps the dialog open on failure so the user can retry.

**Q: What’s your testing strategy?**  
A: Behavior tests with RTL + MSW: validation, create success/fail, status update, permission-gated UI, property URL filters, API pagination helpers. No Playwright yet — listed as a production gap.

**Q: Any performance work?**  
A: Route and chart code-splitting, debounced search, paginated tables, Query `staleTime`, charts with animation disabled. Not virtualized — seed volume does not require it yet.

**Q: Why aren’t units filters fully URL-synced?**  
A: Honest inconsistency. Properties and tickets got the full URL treatment; units only sync `propertyId` for deep links. I’d align units in a follow-up if shareable unit views mattered.

---

## Trade-offs

| Choice | Benefit | Cost |
| --- | --- | --- |
| MSW in-memory DB | Realistic loading/error; clean API boundary | Resets on reload; mutable shared state in tests |
| Query calls in pages | Easy to read in interviews | Duplication if many screens share the same query shape |
| Optimistic status only | Clear story; safe rollback | Create/edit feel “slower” by design |
| Frontend RBAC | Demonstrates permission modeling | Easy to oversell as security — must not |
| Toast-only property/unit edit | Shows gated actions without fake full CRUD | Incomplete product surface |
| Broad query invalidation | Simple coherence after mutations | Over-refetch as the app grows |
| Units local filter state | Faster to ship deep-link `propertyId` | Inconsistent with properties/tickets |
| No E2E | Faster CI; focused unit/integration tests | No full browser regression net |

---

## What I would change in production

1. **Real API + auth** — env-based base URL; IdP session (OIDC); remove demo role switcher from production builds.
2. **Server authorization** — every mutation checked server-side; keep frontend `can()` as UX convenience only.
3. **Persistence** — real database; idempotent writes; conflict handling beyond enum status.
4. **Complete or remove demos** — implement property/unit write APIs or drop the Edit buttons.
5. **Scale** — virtualized tables or cursor pagination; typeahead for large property/unit sets; narrower invalidation.
6. **Assignee model** — store `userId`, not display name strings.
7. **Quality** — Playwright E2E, jsx-a11y / axe in CI, isolated mock state per test, error monitoring, CSP.
8. **Align units list** — URL-synced search/status/sort/page like properties and tickets.
9. **Mobile nav** — full focus trap (Sheet/Dialog) if drawer remains custom.
10. **MSW** — dev/test only; never ship random failure injection to production users.

---

## Known limitations

**Mocked / simplified (intentional)**

- MSW handles all `/api/*` traffic
- In-memory seed data; mutations lost on full reload
- Simulated latency and occasional mutation failures in development only
- Occupancy trend chart data is generated, not derived from live unit history
- Demo session via `localStorage` role switcher
- Frontend permissions are UX-only; mock API does not enforce roles
- Property/unit Edit actions are toasts, not real PATCH flows
- Ticket assignee is a free-text name matched to seed users

**Gaps / weaknesses to admit**

- Units filters are not fully URL-synced
- No E2E suite
- No automated accessibility lint plugin
- Mobile drawer: Escape + focus return, but not a full focus trap
- Test router eagerly imports pages; production uses lazy routes — lazy loading is untested in integration tests
- Shared mutable mock DB can make tests order-sensitive if not careful
- Optimistic status **rollback** path exists in code but is not separately asserted in tests
- Table virtualization is a future option, not implemented
- Seed scale (~12 properties, ~40–50 units, ~40 tickets) — not a large-data stress demo

**What is solid for interviews**

- Clear feature boundaries and typed API client
- Query key design and invalidation story
- URL-synced list state (properties/tickets)
- RHF + Zod ticket forms with dependent fields
- Selective optimistic updates with documented rationale
- Honest RBAC documentation and gated UI tests
- Shared loading/error/empty and table primitives
- Theme tokens centralized under `src/theme`

---

## Review checklist (Senior FE interviewer lens)

### Strongest architectural decisions

1. Feature folders + pages that never import mocks
2. Typed REST client + MSW at the network boundary
3. TanStack Query as the only server-state store
4. URL-backed list state for properties/tickets
5. Optimistic updates scoped to ticket status with rollback
6. Permission utilities instead of scattered `role ===` checks
7. Shared DataTable / feedback / theme primitives

### Important trade-offs

See table above — especially MSW vs real API, Query-in-pages vs hooks, UX RBAC vs security theater.

### Weaknesses

Incomplete write surfaces, units URL inconsistency, test isolation, no E2E/a11y automation, assignee as string.

### Scalability limitations

Page-sized tables without virtualization; `pageSize: 100` dropdown loads; broad invalidation; synthetic occupancy history.

### Accessibility decisions

Skip link, landmarks, labeled forms with `aria-invalid`/`aria-describedby`, Radix dialogs/selects, table `aria-sort`, text+badge status, chart text summaries, global `:focus-visible`. Gaps: drawer focus trap, no axe CI.

### Performance decisions

Route/chart code splitting, debounced search, pagination, Query staleTime, charts without animation. Not a perf showcase for 10k-row tables.

### API design decisions

Paginated list envelope; shared filter/sort query params; enriched detail payloads; JSON error `{ message }`; test hooks `forceError` / `X-Mock-Fail`. No auth headers, versioning, or OpenAPI.

### State-management decisions

Query for server; URL for shareable list state; React for ephemeral UI; session context for demo role only.

### Testing strategy

Vitest + RTL + MSW behavior tests across API, permissions, dashboard, properties, tickets. Strength: same network boundary as the app. Gap: E2E, rollback assertion, units page, charts.

### Production changes

See “What I would change in production” — do not claim any of that is already done.

---

## Quality commands before an interview

```bash
pnpm typecheck
pnpm lint
pnpm test
pnpm build
```
