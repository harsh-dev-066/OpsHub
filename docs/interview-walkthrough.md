# Interview walkthrough

Suggested 8–10 minute tour.

## 1. Position the project (1 min)

- Public portfolio stand-in for proprietary production work
- Fictional OpsHub property operations console
- Goal: show architecture judgment, not tutorial tricks

## 2. App shell and navigation (1 min)

- Sidebar + responsive mobile drawer
- Role shown in the top bar
- Routes via TanStack Router with not-found handling

## 3. Dashboard (1–2 min)

- KPI cards from query endpoints
- Lazy-loaded Recharts visualizations
- Explicit loading/error/empty paths

## 4. Properties table (2 min)

- Debounced search, status/city filters
- Server-driven sort + pagination
- Shared `DataTable` with feature-owned columns
- Detail page with tabs (units / tickets / activity)

## 5. Tickets + forms (2–3 min)

- Create ticket dialog: React Hook Form + Zod
- Dependent unit select after property choice
- Detail page status transitions with optimistic update + rollback
- Toast feedback on success/failure

## 6. RBAC demo (1 min)

- Settings → switch to Viewer
- Create/edit/status controls disappear
- Emphasize: frontend checks are UX only; backend auth is required in real systems

## 7. Testing and quality (1 min)

- Vitest + RTL behavior tests with MSW
- Scripts: `typecheck`, `lint`, `test`, `build`
- Docs describe architecture/API/decisions intentionally

## Talking points if asked

- Why Query over Redux here
- How query keys are structured
- How you’d swap MSW for a real API
- What you’d add next (auth, E2E, virtualization)
