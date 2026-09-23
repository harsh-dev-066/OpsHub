import { describe, expect, it } from 'vitest'
import { ApiError } from '@/lib/api/client'
import {
  contractsApi,
  propertiesApi,
  residentsApi,
  ticketsApi,
  unitsApi,
} from '@/lib/api'

describe('Mock API layer', () => {
  it('lists properties with pagination metadata', async () => {
    const result = await propertiesApi.list({ page: 1, pageSize: 5 })
    expect(result.data.length).toBeLessThanOrEqual(5)
    expect(result.total).toBeGreaterThan(5)
    expect(result.page).toBe(1)
    expect(result.totalPages).toBeGreaterThan(1)
  })

  it('searches properties by name', async () => {
    const result = await propertiesApi.list({
      search: 'Cedar Lane',
      page: 1,
      pageSize: 10,
    })
    expect(result.data).toHaveLength(1)
    expect(result.data[0]?.name).toBe('Cedar Lane Collective')
  })

  it('filters properties by status and city', async () => {
    const result = await propertiesApi.list({
      status: 'inactive',
      page: 1,
      pageSize: 20,
    })
    expect(result.data.length).toBeGreaterThan(0)
    expect(result.data.every((property) => property.status === 'inactive')).toBe(
      true,
    )

    const singapore = await propertiesApi.list({
      city: 'Singapore',
      page: 1,
      pageSize: 20,
    })
    expect(singapore.data.every((property) => property.city === 'Singapore')).toBe(
      true,
    )
  })

  it('sorts properties by name descending', async () => {
    const result = await propertiesApi.list({
      sortBy: 'name',
      sortDirection: 'desc',
      page: 1,
      pageSize: 20,
    })
    const names = result.data.map((property) => property.name)
    const sorted = [...names].sort((a, b) => b.localeCompare(a))
    expect(names).toEqual(sorted)
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

  it('returns unit detail with resident and contract when occupied', async () => {
    const units = await unitsApi.list({ status: 'occupied', page: 1, pageSize: 1 })
    const unitId = units.data[0]?.id
    expect(unitId).toBeTruthy()

    const detail = await unitsApi.getById(unitId!)
    expect(detail.residentDetail).not.toBeNull()
    expect(detail.contract).not.toBeNull()
    expect(detail.property).not.toBeNull()
  })

  it('lists residents and contracts through the API boundary', async () => {
    const residents = await residentsApi.list({ page: 1, pageSize: 10 })
    const contracts = await contractsApi.list({ page: 1, pageSize: 10 })
    expect(residents.total).toBeGreaterThan(10)
    expect(contracts.total).toBeGreaterThan(10)
    expect(residents.data[0]?.email).toContain('@')
  })

  it('supports controlled failures via forceError query param', async () => {
    await expect(
      propertiesApi.list({
        page: 1,
        pageSize: 5,
        // forceError is passed through toSearchParams as an extra field
        ...({ forceError: 1 } as object),
      }),
    ).rejects.toBeInstanceOf(ApiError)

    try {
      await propertiesApi.list({
        page: 1,
        pageSize: 5,
        ...({ forceError: 1 } as object),
      })
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      expect((error as ApiError).status).toBe(500)
      expect((error as ApiError).message).toMatch(/Forced mock failure/i)
    }
  })

  it('supports controlled failures via x-mock-fail header', async () => {
    const response = await fetch('/api/tickets?page=1&pageSize=5', {
      headers: { 'x-mock-fail': '1' },
    })
    expect(response.status).toBe(500)
    const body = (await response.json()) as { message: string }
    expect(body.message).toMatch(/Forced mock failure/i)
  })
})
