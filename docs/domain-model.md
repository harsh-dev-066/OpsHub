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

Demo operators:

- Admin
- Operations Manager
- Support Agent
- Viewer

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
