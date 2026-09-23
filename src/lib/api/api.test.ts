import { describe, expect, it } from 'vitest'
import { propertiesApi, ticketsApi } from '@/lib/api'

describe('API smoke', () => {
  it('lists properties with pagination metadata', async () => {
    const result = await propertiesApi.list({ page: 1, pageSize: 5 })
    expect(result.data.length).toBeLessThanOrEqual(5)
    expect(result.total).toBeGreaterThan(0)
    expect(result.page).toBe(1)
  })

  it('filters tickets by priority', async () => {
    const result = await ticketsApi.list({
      priority: 'critical',
      page: 1,
      pageSize: 20,
    })
    expect(result.data.every((ticket) => ticket.priority === 'critical')).toBe(
      true,
    )
  })
})
