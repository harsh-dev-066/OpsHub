import { http, HttpResponse, type JsonBodyType } from 'msw'
import type {
  Role,
  Ticket,
  TicketCategory,
  TicketPriority,
  TicketStatus,
  User,
} from '@/types/domain'
import { db, getOccupancyTrend } from '@/mocks/data'
import {
  delay,
  matchesSearch,
  paginate,
  parseListParams,
  shouldFailMutation,
  shouldForceError,
  sortByField,
} from '@/mocks/utils'

function json(data: JsonBodyType, status = 200) {
  return HttpResponse.json(data, { status })
}

function forcedErrorResponse() {
  return json({ message: 'Forced mock failure for development/testing.' }, 500)
}

function parseAssignableRoles(roles: string[] | undefined): Role[] {
  return (roles ?? []).filter(
    (role): role is Role =>
      role === 'Operations Manager' ||
      role === 'Support Agent' ||
      role === 'Viewer',
  )
}

async function withMockBehavior(request: Request) {
  await delay()
  if (shouldForceError(request)) {
    return forcedErrorResponse()
  }
  return null
}

export const handlers = [
  http.get('/api/dashboard/summary', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced

    const totalUnits = db.units.length
    const occupied = db.units.filter((u) => u.status === 'occupied').length
    const available = db.units.filter((u) => u.status === 'available').length
    const maintenance = db.units.filter(
      (u) => u.status === 'maintenance',
    ).length
    const openTickets = db.tickets.filter(
      (t) =>
        t.status === 'open' ||
        t.status === 'in_progress' ||
        t.status === 'waiting',
    ).length

    return json({
      occupancyRate: totalUnits === 0 ? 0 : (occupied / totalUnits) * 100,
      availableUnits: available,
      maintenanceUnits: maintenance,
      openTickets,
      totalProperties: db.properties.length,
      totalUnits,
    })
  }),

  http.get('/api/dashboard/occupancy', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    return json(getOccupancyTrend())
  }),

  http.get('/api/dashboard/tickets-by-priority', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const priorities: TicketPriority[] = ['low', 'medium', 'high', 'critical']
    return json(
      priorities.map((name) => ({
        name,
        value: db.tickets.filter((t) => t.priority === name).length,
      })),
    )
  }),

  http.get('/api/dashboard/tickets-by-status', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const statuses: TicketStatus[] = [
      'open',
      'in_progress',
      'waiting',
      'resolved',
      'closed',
    ]
    return json(
      statuses.map((name) => ({
        name,
        value: db.tickets.filter((t) => t.status === name).length,
      })),
    )
  }),

  http.get('/api/dashboard/activity', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    return json(db.activity.slice(0, 12))
  }),

  http.get('/api/properties', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const url = new URL(request.url)
    const params = parseListParams(url)
    let items = [...db.properties]

    if (params.search) {
      items = items.filter(
        (p) =>
          matchesSearch(p.name, params.search) ||
          matchesSearch(p.city, params.search) ||
          matchesSearch(p.address, params.search),
      )
    }
    if (params.status) {
      items = items.filter((p) => p.status === params.status)
    }
    if (params.city) {
      items = items.filter((p) => p.city === params.city)
    }

    items = sortByField(items, params.sortBy, params.sortDirection ?? 'asc')
    return json(paginate(items, params.page, params.pageSize))
  }),

  http.get('/api/properties/:id', async ({ params, request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const property = db.properties.find((p) => p.id === params.id)
    if (!property) {
      return json({ message: 'Property not found.' }, 404)
    }
    return json(property)
  }),

  http.get('/api/properties/:id/units', async ({ params, request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const url = new URL(request.url)
    const listParams = parseListParams(url)
    let items = db.units.filter((u) => u.propertyId === params.id)

    if (listParams.search) {
      items = items.filter(
        (u) =>
          matchesSearch(u.unitNumber, listParams.search) ||
          matchesSearch(u.resident ?? '', listParams.search),
      )
    }
    if (listParams.status) {
      items = items.filter((u) => u.status === listParams.status)
    }

    items = sortByField(
      items,
      listParams.sortBy,
      listParams.sortDirection ?? 'asc',
    )
    return json(paginate(items, listParams.page, listParams.pageSize))
  }),

  http.get('/api/properties/:id/tickets', async ({ params, request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const url = new URL(request.url)
    const listParams = parseListParams(url)
    let items = db.tickets.filter((t) => t.propertyId === params.id)

    if (listParams.status) {
      items = items.filter((t) => t.status === listParams.status)
    }

    items = sortByField(
      items,
      listParams.sortBy ?? 'updatedAt',
      listParams.sortDirection ?? 'desc',
    )
    return json(paginate(items, listParams.page, listParams.pageSize))
  }),

  http.get('/api/units', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const url = new URL(request.url)
    const params = parseListParams(url)
    let items = [...db.units]

    if (params.propertyId) {
      items = items.filter((u) => u.propertyId === params.propertyId)
    }
    if (params.search) {
      items = items.filter(
        (u) =>
          matchesSearch(u.unitNumber, params.search) ||
          matchesSearch(u.resident ?? '', params.search) ||
          matchesSearch(u.type, params.search),
      )
    }
    if (params.status) {
      items = items.filter((u) => u.status === params.status)
    }

    items = sortByField(items, params.sortBy, params.sortDirection ?? 'asc')
    return json(paginate(items, params.page, params.pageSize))
  }),

  http.get('/api/units/:id', async ({ params, request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const unit = db.units.find((u) => u.id === params.id)
    if (!unit) {
      return json({ message: 'Unit not found.' }, 404)
    }
    const resident = db.residents.find((r) => r.unitId === unit.id) ?? null
    const contract = db.contracts.find((c) => c.unitId === unit.id) ?? null
    const property = db.properties.find((p) => p.id === unit.propertyId) ?? null
    return json({ ...unit, residentDetail: resident, contract, property })
  }),

  http.get('/api/residents', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const url = new URL(request.url)
    const params = parseListParams(url)
    let items = [...db.residents]

    if (params.search) {
      items = items.filter(
        (r) =>
          matchesSearch(r.name, params.search) ||
          matchesSearch(r.email, params.search),
      )
    }

    items = sortByField(
      items,
      params.sortBy ?? 'name',
      params.sortDirection ?? 'asc',
    )
    return json(paginate(items, params.page, params.pageSize))
  }),

  http.get('/api/contracts', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const url = new URL(request.url)
    const params = parseListParams(url)
    let items = [...db.contracts]

    if (params.status) {
      items = items.filter((c) => c.status === params.status)
    }

    items = sortByField(
      items,
      params.sortBy ?? 'startDate',
      params.sortDirection ?? 'desc',
    )
    return json(paginate(items, params.page, params.pageSize))
  }),

  http.get('/api/tickets', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const url = new URL(request.url)
    const params = parseListParams(url)
    let items = [...db.tickets]

    if (params.propertyId) {
      items = items.filter((t) => t.propertyId === params.propertyId)
    }
    if (params.search) {
      items = items.filter(
        (t) =>
          matchesSearch(t.title, params.search) ||
          matchesSearch(t.description, params.search) ||
          matchesSearch(t.id, params.search),
      )
    }
    if (params.status) {
      items = items.filter((t) => t.status === params.status)
    }
    if (params.priority) {
      items = items.filter((t) => t.priority === params.priority)
    }
    if (params.category) {
      items = items.filter((t) => t.category === params.category)
    }

    items = sortByField(
      items,
      params.sortBy ?? 'updatedAt',
      params.sortDirection ?? 'desc',
    )
    return json(paginate(items, params.page, params.pageSize))
  }),

  http.get('/api/tickets/:id', async ({ params, request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const ticket = db.tickets.find((t) => t.id === params.id)
    if (!ticket) {
      return json({ message: 'Ticket not found.' }, 404)
    }
    const property =
      db.properties.find((p) => p.id === ticket.propertyId) ?? null
    const unit = ticket.unitId
      ? (db.units.find((u) => u.id === ticket.unitId) ?? null)
      : null
    return json({ ...ticket, property, unit })
  }),

  http.post('/api/tickets', async ({ request }) => {
    await delay()
    if (shouldFailMutation(request)) {
      return json(
        { message: 'Unable to create ticket right now. Please try again.' },
        500,
      )
    }

    const body = (await request.json()) as {
      title: string
      description: string
      category: TicketCategory
      priority: TicketPriority
      propertyId: string
      unitId?: string | null
      assignee?: string | null
    }

    if (
      !body.title?.trim() ||
      !body.propertyId ||
      !body.category ||
      !body.priority
    ) {
      return json({ message: 'Missing required ticket fields.' }, 400)
    }

    const now = new Date().toISOString()
    const ticket: Ticket = {
      id: `tkt-${String(db.tickets.length + 1).padStart(3, '0')}`,
      propertyId: body.propertyId,
      unitId: body.unitId ?? null,
      title: body.title.trim(),
      description: body.description?.trim() ?? '',
      category: body.category,
      priority: body.priority,
      status: 'open',
      assignee: body.assignee ?? null,
      createdAt: now,
      updatedAt: now,
    }

    db.tickets.unshift(ticket)
    db.activity.unshift({
      id: `act-${Date.now()}`,
      type: 'ticket',
      message: `Ticket "${ticket.title}" created`,
      timestamp: now,
      entityId: ticket.id,
    })

    return json(ticket, 201)
  }),

  http.patch('/api/tickets/:id', async ({ params, request }) => {
    await delay()
    if (shouldFailMutation(request)) {
      return json(
        { message: 'Unable to update ticket right now. Please try again.' },
        500,
      )
    }

    const ticket = db.tickets.find((t) => t.id === params.id)
    if (!ticket) {
      return json({ message: 'Ticket not found.' }, 404)
    }

    const body = (await request.json()) as Partial<Ticket>
    Object.assign(ticket, body, { updatedAt: new Date().toISOString() })

    db.activity.unshift({
      id: `act-${Date.now()}`,
      type: 'ticket',
      message: `Ticket "${ticket.title}" updated`,
      timestamp: ticket.updatedAt,
      entityId: ticket.id,
    })

    return json(ticket)
  }),

  http.get('/api/users', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    return json(db.users)
  }),

  http.get('/api/users/:userId', async ({ params, request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const user = db.users.find((entry) => entry.id === params.userId)
    if (!user) return json({ message: 'User not found.' }, 404)
    return json(user)
  }),

  http.post('/api/users', async ({ request }) => {
    await delay()
    if (shouldForceError(request) || shouldFailMutation(request)) {
      return forcedErrorResponse()
    }

    const body = (await request.json()) as {
      name?: string
      email?: string
      username?: string
      roles?: string[]
      status?: 'active' | 'inactive'
    }

    const name = body.name?.trim() ?? ''
    const email = body.email?.trim() ?? ''
    const username = body.username?.trim().toLowerCase() ?? ''
    const roles = parseAssignableRoles(body.roles)

    if (!name || !email || !username) {
      return json({ message: 'Name, email, and username are required.' }, 400)
    }
    if (roles.length === 0) {
      return json({ message: 'Assign at least one role.' }, 400)
    }
    if (db.users.some((entry) => entry.username === username)) {
      return json({ message: 'Username is already taken.' }, 409)
    }
    if (
      db.users.some(
        (entry) => entry.email.toLowerCase() === email.toLowerCase(),
      )
    ) {
      return json({ message: 'Email is already in use.' }, 409)
    }

    const user: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      username,
      roles,
      status: body.status ?? 'active',
      createdAt: new Date().toISOString(),
    }
    db.users.push(user)
    return json(user, 201)
  }),

  http.patch('/api/users/:userId', async ({ params, request }) => {
    await delay()
    if (shouldForceError(request) || shouldFailMutation(request)) {
      return forcedErrorResponse()
    }

    const index = db.users.findIndex((entry) => entry.id === params.userId)
    if (index === -1) return json({ message: 'User not found.' }, 404)

    const existing = db.users[index]!
    if (existing.roles.includes('Admin')) {
      return json(
        { message: 'The system admin account cannot be modified.' },
        403,
      )
    }

    const body = (await request.json()) as {
      name?: string
      email?: string
      roles?: string[]
      status?: 'active' | 'inactive'
    }

    const nextRoles =
      body.roles == null ? existing.roles : parseAssignableRoles(body.roles)

    if (nextRoles.length === 0) {
      return json({ message: 'Assign at least one role.' }, 400)
    }

    const email = body.email?.trim() ?? existing.email
    if (
      db.users.some(
        (entry) =>
          entry.id !== existing.id &&
          entry.email.toLowerCase() === email.toLowerCase(),
      )
    ) {
      return json({ message: 'Email is already in use.' }, 409)
    }

    const updated: User = {
      ...existing,
      name: body.name?.trim() ?? existing.name,
      email,
      roles: nextRoles,
      status: body.status ?? existing.status,
    }
    db.users[index] = updated
    return json(updated)
  }),

  http.get('/api/meta/cities', async ({ request }) => {
    const forced = await withMockBehavior(request)
    if (forced) return forced
    const cities = [...new Set(db.properties.map((p) => p.city))].sort()
    return json(cities)
  }),
]
