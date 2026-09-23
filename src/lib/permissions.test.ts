import { describe, expect, it } from 'vitest'
import {
  can,
  canAll,
  canAny,
  getPermissionsForRole,
  hasPermission,
  type PermissionUser,
} from '@/lib/permissions'

const adminUser: PermissionUser = {
  id: '1',
  name: 'Admin User',
  email: 'admin@opshub.app',
  roles: ['Admin'],
  role: 'Admin',
}

const supportUser: PermissionUser = {
  id: '2',
  name: 'Support User',
  email: 'support@opshub.app',
  roles: ['Support Agent'],
  role: 'Support Agent',
}

const viewerUser: PermissionUser = {
  id: '3',
  name: 'Viewer User',
  email: 'viewer@opshub.app',
  roles: ['Viewer'],
  role: 'Viewer',
}

describe('permissions helpers', () => {
  it('checks single permissions with can/hasPermission', () => {
    expect(can(adminUser, 'properties:write')).toBe(true)
    expect(hasPermission(adminUser, 'properties:write')).toBe(true)
    expect(can(supportUser, 'properties:write')).toBe(false)
    expect(hasPermission(viewerUser, 'tickets:create')).toBe(false)
  })

  it('accepts a Role string as a shorthand', () => {
    expect(can('Operations Manager', 'units:write')).toBe(true)
    expect(can('Viewer', 'tickets:create')).toBe(false)
  })

  it('evaluates canAny / canAll', () => {
    expect(canAny(supportUser, ['properties:write', 'tickets:create'])).toBe(
      true,
    )
    expect(canAll(supportUser, ['properties:read', 'tickets:create'])).toBe(
      true,
    )
    expect(canAll(supportUser, ['properties:write', 'tickets:create'])).toBe(
      false,
    )
  })

  it('lists permissions for a role', () => {
    expect(getPermissionsForRole('Admin')).toContain('properties:write')
    expect(getPermissionsForRole('Viewer')).not.toContain('properties:write')
    expect(getPermissionsForRole('Admin')).toContain('users:write')
    expect(getPermissionsForRole('Viewer')).toContain('users:read')
    expect(getPermissionsForRole('Viewer')).not.toContain('users:write')
  })

  it('keeps Viewer read-only for mutations', () => {
    expect(can(viewerUser, 'tickets:create')).toBe(false)
    expect(can(viewerUser, 'tickets:edit')).toBe(false)
    expect(can(viewerUser, 'tickets:transition')).toBe(false)
    expect(can(viewerUser, 'properties:write')).toBe(false)
    expect(can(viewerUser, 'units:write')).toBe(false)
  })
})
