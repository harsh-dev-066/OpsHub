# Domain model

OpsHub models a flexible-living / property-operations domain.

## Entities

### Property

Portfolio asset with occupancy rollups.

Fields: `id`, `name`, `city`, `country`, `address`, `status`, `totalUnits`, `occupiedUnits`, `availableUnits`, `maintenanceUnits`, `manager`, `createdAt`

Statuses: `active` | `inactive` | `maintenance`

### Unit

Assignable space inside a property.

Fields: `id`, `propertyId`, `unitNumber`, `type`, `floor`, `status`, `resident`, `monthlyRate`, `contractStart`, `contractEnd`

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

Fields: `id`, `propertyId`, `unitId`, `title`, `description`, `category`, `priority`, `status`, `assignee`, `createdAt`, `updatedAt`

Categories: `maintenance`, `cleaning`, `noise`, `billing`, `access`, `other`  
Priorities: `low`, `medium`, `high`, `critical`  
Statuses: `open`, `in_progress`, `waiting`, `resolved`, `closed`

### User / Role

Demo operators use a typed `PermissionUser` shape (`id`, `name`, `email`, `role`).

This is **not** secure authentication. The Settings page simulates a logged-in operator by switching a demo role stored in `localStorage`. There is no login, password, session cookie, or identity provider.

Roles:

| Role | Intent |
| --- | --- |
| Admin | Full console access |
| Operations Manager | Properties, units, tickets, operational actions |
| Support Agent | Ticket workflows; read-only property/unit data |
| Viewer | Read-only access (plus demo role switcher) |

## Frontend permissions (UX only)

Permissions are typed capability strings in `src/lib/permissions.ts`. Components must not compare role strings (`if (role === 'Admin')`). Prefer:

- `can(user, permission)`
- `hasPermission(user, permission)`
- `canAny` / `canAll`
- `<Can permission="…" />` / `usePermissions()`

### Permission catalog

| Permission | Meaning in UI |
| --- | --- |
| `dashboard:read` | Dashboard nav + page |
| `properties:read` | Properties nav + lists/details |
| `properties:write` | Edit property action |
| `units:read` | Units nav + lists/details |
| `units:write` | Edit unit action |
| `tickets:read` | Tickets nav + lists/details |
| `tickets:create` | Create ticket button / dialog |
| `tickets:edit` | Edit ticket action |
| `tickets:transition` | Status transition control |
| `settings:read` | Settings nav + page |
| `settings:write` | Demo role switcher (interview convenience) |

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
| `settings:write` | ✓ | ✓ | ✓ | ✓* |

\*Viewer retains `settings:write` only so interviewers can switch roles during the demo. That is not a production auth grant.

### What this is not

**Important:** these checks only shape the UI for demos. They are not authentication and not authorization. A real backend remains the security boundary and must authorize every mutation independently of this map.

## Relationships

```text
Property 1—* Unit
Unit 0..1—1 Resident
Resident 1—* Contract
Property 1—* Ticket
Unit 0..1—* Ticket
```

## Seed volume

Approximately:

- 12 properties
- ~40–50 units
- ~40 tickets
- 4 demo users

Enough for filtering/pagination demos without fake mega-scale.
