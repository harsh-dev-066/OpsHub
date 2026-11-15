import type { Role } from '@/types/domain'

/**
 * Frontend capability identifiers used to gate console UI.
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
  | 'users:read'
  | 'users:write'

export interface PermissionUser {
  id: string
  name: string
  email: string
  roles: Role[]
  /** Highest-privilege role for compact display. */
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
  'users:read',
  'users:write',
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
    'users:read',
    'users:write',
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
    'users:read',
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
    'users:read',
  ],
  Viewer: [
    'dashboard:read',
    'properties:read',
    'units:read',
    'tickets:read',
    'settings:read',
    'users:read',
  ],
} as const satisfies Record<Role, readonly Permission[]>

export type RolePermissionMap = typeof rolePermissions

export const ROLE_OPTIONS: Role[] = [
  'Admin',
  'Operations Manager',
  'Support Agent',
  'Viewer',
]

/** Roles that operators may assign in User Management (Admin is reserved). */
export const ASSIGNABLE_ROLES: Role[] = [
  'Operations Manager',
  'Support Agent',
  'Viewer',
]

export const ROLE_DESCRIPTIONS: Record<Role, string> = {
  Admin: 'Full console access for administration.',
  'Operations Manager': 'Operational access to properties, units, and tickets.',
  'Support Agent':
    'Ticket workflows plus read-only property and unit information.',
  Viewer: 'Read-only portfolio and ticket visibility.',
}

const ROLE_RANK: Record<Role, number> = {
  Admin: 4,
  'Operations Manager': 3,
  'Support Agent': 2,
  Viewer: 1,
}

export function isRole(value: string | null | undefined): value is Role {
  return (
    value === 'Admin' ||
    value === 'Operations Manager' ||
    value === 'Support Agent' ||
    value === 'Viewer'
  )
}

export function primaryRole(roles: readonly Role[]): Role {
  if (roles.length === 0) return 'Viewer'
  return [...roles].sort((a, b) => ROLE_RANK[b] - ROLE_RANK[a])[0]!
}

export function getPermissionsForRole(role: Role): readonly Permission[] {
  return rolePermissions[role]
}

export function getPermissionsForRoles(
  roles: readonly Role[],
): readonly Permission[] {
  const set = new Set<Permission>()
  for (const role of roles) {
    for (const permission of rolePermissions[role]) {
      set.add(permission)
    }
  }
  return [...set]
}

function resolveRoles(userOrRole: PermissionUser | Role): readonly Role[] {
  return typeof userOrRole === 'string' ? [userOrRole] : userOrRole.roles
}

/**
 * Returns whether the user (or role) has the given permission.
 * Prefer this (or `can`) over comparing `user.role` in components.
 */
export function hasPermission(
  userOrRole: PermissionUser | Role,
  permission: Permission,
): boolean {
  return getPermissionsForRoles(resolveRoles(userOrRole)).includes(permission)
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

export function toPermissionUser(input: {
  id: string
  name: string
  email: string
  roles: Role[]
}): PermissionUser {
  return {
    id: input.id,
    name: input.name,
    email: input.email,
    roles: input.roles,
    role: primaryRole(input.roles),
  }
}
