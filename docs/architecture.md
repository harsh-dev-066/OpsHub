# Architecture

OpsHub is a Vite + React 19 SPA that talks to a mocked REST API through MSW.

## Layering

1. **Routes / pages** (`src/app/router`, `src/features/*/…-page.tsx`) compose screens.
2. **Feature modules** own page-specific tables, forms, and schemas.
3. **Shared components** (`src/components`) provide UI primitives, data-table, and feedback.
4. **API client** (`src/lib/api`) wraps `fetch` and returns typed payloads.
5. **Query layer** (`src/lib/query/keys.ts` + TanStack Query hooks in pages) owns server cache.
6. **Mocks** (`src/mocks`) implement network behavior and seed data.

Pages never import seed arrays. That keeps the UI portable to a real backend.

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

## Permissions (frontend only)

`src/lib/permissions.ts` maps roles to capabilities. The UI hides/disables actions accordingly.

**This is not security.** A real system must enforce authorization on the backend. Frontend checks exist only for usable UX and interview demonstration.

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
