# Decisions

## Feature-based folders

Chosen over a pure `components/hooks/pages` split so domain concerns stay close together and interviewers can navigate by product area.

## TanStack Query only for server state

Avoids Redux ceremony for a resource-driven UI. Query keys, invalidation, and optimistic updates demonstrate the patterns that matter here.

## MSW instead of in-component mocks

Keeps loading/error behavior honest and preserves a clean API boundary for a future real backend.

## Optimistic updates for ticket status only

Status transitions are frequent, single-field, and easy to roll back. Create/edit still wait for the server and invalidate queries on success so multi-field payloads never need speculative cache patching.

Safe because:

- the value domain is a closed enum
- detail + list caches can be patched with the same status
- failure restores the previous detail snapshot and invalidates lists

## Frontend RBAC as UX

Roles map to typed permissions in one module. UI uses `can` / `hasPermission` / `<Can />` instead of scattering `role === '...'` checks. Navigation, create/edit actions, and property/unit modification affordances are gated this way.

This is intentionally **not** authentication and **not** security. Backend authorization would remain the source of truth in production.

## Shared data-table primitive

Sorting/pagination/loading/empty/error are reusable. Column definitions and filters stay in features. Manual server sorting/pagination keeps the door open for virtualization later.

Embedded read-only tables (property detail panels) pass `enableSorting={false}` so headers do not look interactive without wired sort state. Virtualization is intentionally not implemented while page size stays small.

## URL-synced property filters

Property list filters (`search`, `status`, `city`, `page`, `pageSize`, `sortBy`, `sortDirection`) live in the TanStack Router search params. That makes filtered views bookmarkable/shareable and keeps list state out of ephemeral React-only memory. Search input is debounced before writing to the URL to avoid noisy history updates.

## Zod next to ticket forms

Validation schema is domain-specific. Shared entity types remain in `src/types` to avoid duplication while keeping form rules local.

## TanStack Table v8

v9’s API changed significantly; v8 matches common shadcn/data-table patterns and keeps the table layer readable for interviews.

## Documentation over inline comments

Architecture and decisions live in Markdown. Source comments are reserved for non-obvious constraints.
