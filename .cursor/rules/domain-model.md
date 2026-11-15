# Domain model

OpsHub models a flexible-living / property-operations domain.

## Entities

### Property

Portfolio asset with occupancy rollups. The rollups (`totalUnits`, `occupiedUnits`, …) are computed from units on every read, never stored.

Fields: `id`, `name`, `city`, `country`, `address`, `status`, `totalUnits`, `occupiedUnits`, `availableUnits`, `maintenanceUnits`, `manager`, `createdAt`

Statuses: `active` | `inactive` | `maintenance`

### Unit

Assignable space inside a property.

Fields: `id`, `propertyId`, `unitNumber`, `type`, `floor`, `status`, `resident`, `monthlyRate`, `contractStart`, `contractEnd`

`resident` and the contract dates come from the unit's current (`active` or `pending`) contract. `unitNumber` is unique within a property.

Statuses: `occupied` | `available` | `maintenance` | `reserved`

Types: `studio` | `1br` | `2br` | `3br` | `shared`

### Resident

Person assigned to a unit (detail view).

Fields: `id`, `name`, `email`, `phone`, `nationality`, `moveInDate`, `unitId`

### Contract

Agreement linking resident and unit.

Fields: `id`, `residentId`, `unitId`, `startDate`, `endDate`, `status`

### Ticket

Operational support request.

Fields: `id`, `propertyId`, `unitId`, `title`, `description`, `category`, `priority`, `status`, `assignee` (display name), `assigneeId` (user id), `createdAt`, `updatedAt`

- `unitId`, if set, must belong to `propertyId`.
- The assignee must be an active user.

Categories: `maintenance`, `cleaning`, `noise`, `billing`, `access`, `other`  
Priorities: `low`, `medium`, `high`, `critical`  
Statuses: `open`, `in_progress`, `waiting`, `resolved`, `closed`

### User / Role

Console operator. Fields: `id`, `name`, `email`, `username`, `roles`, `status`, `createdAt`

- `username` is unique, case-insensitive, stored lowercase and immutable.
- `email` is unique (case-insensitive).
- `status`: `active` | `inactive`. Inactive users can't sign in, and their tokens stop working immediately.
- A user may hold **several roles**. Effective permissions are the union.
- Passwords are hashed by Django (PBKDF2) and validated with Django's password validators.

| Role | Intent |
| --- | --- |
| Admin | Full console access, including user management. Reserved: it can't be assigned via the API, and Admin accounts can't be edited via the API |
| Operations Manager | Properties, units, tickets, operational actions |
| Support Agent | Ticket workflows; read-only property/unit data |
| Viewer | Read-only access |

## Authorization (enforced by the backend)

The role → permission matrix is defined once on the server in `backend/apps/accounts/roles.py`. **Every API endpoint enforces it.** The frontend mirrors it (`frontend/src/lib/permissions.ts`) and reads effective permissions from `GET /api/auth/me`, but only to hide unavailable actions.

### Permission catalog

| Permission | Grants |
| --- | --- |
| `dashboard:read` | Dashboard endpoints and page |
| `properties:read` | Property lists/details, cities |
| `properties:write` | Create/update properties |
| `units:read` | Unit, resident and contract lists/details |
| `units:write` | Create/update units |
| `tickets:read` | Ticket lists/details |
| `tickets:create` | Create tickets |
| `tickets:edit` | Change ticket fields other than status |
| `tickets:transition` | Change ticket status |
| `settings:read` | Settings page |
| `users:read` | List/view users (also used for assignee pickers) |
| `users:write` | Create/update users, reset passwords |

### Role × permission matrix

| Permission | Admin | Ops Manager | Support Agent | Viewer |
| --- | :---: | :---: | :---: | :---: |
| `dashboard:read` | ✓ | ✓ | ✓ | ✓ |
| `properties:read` | ✓ | ✓ | ✓ | ✓ |
| `properties:write` | ✓ | ✓ | | |
| `units:read` | ✓ | ✓ | ✓ | ✓ |
| `units:write` | ✓ | ✓ | | |
| `tickets:read` | ✓ | ✓ | ✓ | ✓ |
| `tickets:create` | ✓ | ✓ | ✓ | |
| `tickets:edit` | ✓ | ✓ | ✓ | |
| `tickets:transition` | ✓ | ✓ | ✓ | |
| `settings:read` | ✓ | ✓ | ✓ | ✓ |
| `users:read` | ✓ | ✓ | ✓ | ✓ |
| `users:write` | ✓ | | | |

When adding a permission, update `roles.py`, `permissions.ts`, this table and the backend permission-matrix test (`backend/apps/core/tests/test_permissions_matrix.py`).

## Activity feed

Append-only feed entry written by the backend whenever a ticket, unit or property changes.

Fields: `id`, `type` (`ticket` | `unit` | `property`), `message`, `timestamp`, `entityId`

## Relationships

```text
Property 1—* Unit
Unit 0..1—1 Resident
Resident 1—* Contract
Property 1—* Ticket
Unit 0..1—* Ticket
User 0..1—* Ticket (assignee)
```

## Seed volume

About 12 properties, 46 units, 42 tickets and 4 demo users. This is enough for filtering and pagination without fake mega-scale. See [api.md](./api.md#seed-volume).
