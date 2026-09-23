# Decisions

## Feature-based folders

Chosen over a pure `components/hooks/pages` split so domain concerns stay close together and interviewers can navigate by product area.

## TanStack Query only for server state

Avoids Redux ceremony for a resource-driven UI. Query keys, invalidation, and optimistic updates demonstrate the patterns that matter here.

## MSW instead of in-component mocks

Keeps loading/error behavior honest and preserves a clean API boundary for a future real backend.

## Optimistic updates for ticket status only

Status transitions are frequent and reversible. Create/edit still invalidate on success to keep complexity proportional.

## Frontend RBAC as UX

Roles change what controls appear. Documentation and Settings copy make clear this is not authorization. Backend checks would be required in production.

## Shared data-table primitive

Sorting/pagination/loading/empty/error are reusable. Column definitions and filters stay in features. Manual server sorting/pagination keeps the door open for virtualization later.

## Zod next to ticket forms

Validation schema is domain-specific. Shared entity types remain in `src/types` to avoid duplication while keeping form rules local.

## TanStack Table v8

v9’s API changed significantly; v8 matches common shadcn/data-table patterns and keeps the table layer readable for interviews.

## Documentation over inline comments

Architecture and decisions live in Markdown. Source comments are reserved for non-obvious constraints.
