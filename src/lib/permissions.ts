import type { Role } from '@/types/domain'

export type Capability =
  | 'properties:read'
  | 'properties:write'
  | 'units:read'
  | 'units:write'
  | 'tickets:read'
  | 'tickets:create'
  | 'tickets:edit'
  | 'tickets:transition'
  | 'settings:write'
  | 'dashboard:read'

const roleCapabilities: Record<Role, readonly Capability[]> = {
  Admin: [
    'dashboard:read',
    'properties:read',
    'properties:write',
    'units:read',
    'units:write',
    'tickets:read',
    'tickets:create',
    'tickets:edit',
    'tickets:transition',
    'settings:write',
  ],
  'Operations Manager': [
    'dashboard:read',
    'properties:read',
    'properties:write',
    'units:read',
    'units:write',
    'tickets:read',
    'tickets:create',
    'tickets:edit',
    'tickets:transition',
    'settings:write',
  ],
  'Support Agent': [
    'dashboard:read',
    'properties:read',
    'units:read',
    'tickets:read',
    'tickets:create',
    'tickets:edit',
    'tickets:transition',
    'settings:write',
  ],
  Viewer: [
    'dashboard:read',
    'properties:read',
    'units:read',
    'tickets:read',
    'settings:write',
  ],
}

export function can(role: Role, capability: Capability) {
  return roleCapabilities[role].includes(capability)
}

export const ROLE_OPTIONS: Role[] = [
  'Admin',
  'Operations Manager',
  'Support Agent',
  'Viewer',
]
