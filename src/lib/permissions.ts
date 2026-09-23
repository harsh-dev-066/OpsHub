import type { Role } from '@/types/domain'

/**
 * Frontend RBAC for OpsHub demos.
 *
 * These checks shape what the UI shows (nav, create/edit buttons, etc.).
 * They are NOT authentication and NOT authorization.
 * In a real application, the API would remain the security boundary and
 * must authorize every mutation independently of this map.
 */

export type Permission =
  | 'dashboard:read'
  | 'properties:read'
  | 'properties:write'
  | 'units:read'
  | 'units:write'
  | 'tickets:read'
  | 'tickets:create'
  | 'tickets:edit'
  | 'tickets:transition'
  | 'settings:read'
  | 'settings:write'

export interface PermissionUser {
  id: string
  name: string
  email: string
  role: Role
}

export const ALL_PERMISSIONS = [
  'dashboard:read',
  'properties:read',
  'properties:write',
  'units:read',
  'units:write',
  'tickets:read',
  'tickets:create',
  'tickets:edit',
  'tickets:transition',
  'settings:read',
  'settings:write',
] as const satisfies readonly Permission[]

const rolePermissions = {
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
    'settings:read',
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
    'settings:read',
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
    'settings:read',
    'settings:write',
  ],
  Viewer: [
    'dashboard:read',
    'properties:read',
    'units:read',
    'tickets:read',
    'settings:read',
    // Demo convenience: Viewer may switch roles in Settings.
    // That is not a production auth grant.
    'settings:write',
  ],
} as const satisfies Record<Role, readonly Permission[]>

export type RolePermissionMap = typeof rolePermissions

export const ROLE_OPTIONS: Role[] = [
  'Admin',
  'Operations Manager',
  'Support Agent',
  'Viewer',
]

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Admin: 'Full console access for demos and administration.',
  'Operations Manager':
    'Operational access to properties, units, and tickets.',
  'Support Agent':
    'Ticket workflows plus read-only property and unit information.',
  Viewer: 'Read-only portfolio and ticket visibility.',
}

export function isRole(value: string | null | undefined): value is Role {
  return (
    value === 'Admin' ||
    value === 'Operations Manager' ||
    value === 'Support Agent' ||
    value === 'Viewer'
  )
}

function resolveRole(userOrRole: PermissionUser | Role): Role {
  return typeof userOrRole === 'string' ? userOrRole : userOrRole.role
}

export function getPermissionsForRole(role: Role): readonly Permission[] {
  return rolePermissions[role]
}

/**
 * Returns whether the user (or role) has the given permission.
 * Prefer this (or `can`) over comparing `user.role` in components.
 */
export function hasPermission(
  userOrRole: PermissionUser | Role,
  permission: Permission,
): boolean {
  return getPermissionsForRole(resolveRole(userOrRole)).includes(permission)
}

/**
 * Alias of `hasPermission` for readable call sites: `can(user, 'tickets:create')`.
 */
export function can(
  userOrRole: PermissionUser | Role,
  permission: Permission,
): boolean {
  return hasPermission(userOrRole, permission)
}

export function canAny(
  userOrRole: PermissionUser | Role,
  permissions: readonly Permission[],
): boolean {
  return permissions.some((permission) => hasPermission(userOrRole, permission))
}

export function canAll(
  userOrRole: PermissionUser | Role,
  permissions: readonly Permission[],
): boolean {
  return permissions.every((permission) =>
    hasPermission(userOrRole, permission),
  )
}
