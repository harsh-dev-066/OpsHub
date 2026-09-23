import { describe, expect, it } from 'vitest'
import { can } from '@/lib/permissions'

describe('permissions', () => {
  it('grants Admin full access', () => {
    expect(can('Admin', 'tickets:create')).toBe(true)
    expect(can('Admin', 'properties:write')).toBe(true)
  })

  it('limits Support Agent property writes', () => {
    expect(can('Support Agent', 'properties:read')).toBe(true)
    expect(can('Support Agent', 'properties:write')).toBe(false)
    expect(can('Support Agent', 'tickets:create')).toBe(true)
  })

  it('makes Viewer read-only for tickets', () => {
    expect(can('Viewer', 'tickets:read')).toBe(true)
    expect(can('Viewer', 'tickets:create')).toBe(false)
    expect(can('Viewer', 'tickets:transition')).toBe(false)
  })
})
