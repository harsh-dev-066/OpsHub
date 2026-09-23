import { apiClient, toSearchParams } from '@/lib/api/client'
import type {
  ActivityItem,
  DashboardSummary,
  ListQueryParams,
  OccupancyPoint,
  PaginatedResponse,
  Property,
  Ticket,
  TicketBreakdownItem,
  Unit,
  User,
} from '@/types/domain'

export interface UnitDetail extends Unit {
  residentDetail: {
    id: string
    name: string
    email: string
    phone: string
    nationality: string
    moveInDate: string
    unitId: string
  } | null
  contract: {
    id: string
    residentId: string
    unitId: string
    startDate: string
    endDate: string
    status: string
  } | null
  property: Property | null
}

export interface TicketDetail extends Ticket {
  property: Property | null
  unit: Unit | null
}

export const dashboardApi = {
  getSummary: () => apiClient<DashboardSummary>('/api/dashboard/summary'),
  getOccupancy: () => apiClient<OccupancyPoint[]>('/api/dashboard/occupancy'),
  getTicketsByPriority: () =>
    apiClient<TicketBreakdownItem[]>('/api/dashboard/tickets-by-priority'),
  getTicketsByStatus: () =>
    apiClient<TicketBreakdownItem[]>('/api/dashboard/tickets-by-status'),
  getActivity: () => apiClient<ActivityItem[]>('/api/dashboard/activity'),
}

export const propertiesApi = {
  list: (params: ListQueryParams = {}) =>
    apiClient<PaginatedResponse<Property>>(
      `/api/properties${toSearchParams(params)}`,
    ),
  getById: (id: string) => apiClient<Property>(`/api/properties/${id}`),
  listUnits: (id: string, params: ListQueryParams = {}) =>
    apiClient<PaginatedResponse<Unit>>(
      `/api/properties/${id}/units${toSearchParams(params)}`,
    ),
  listTickets: (id: string, params: ListQueryParams = {}) =>
    apiClient<PaginatedResponse<Ticket>>(
      `/api/properties/${id}/tickets${toSearchParams(params)}`,
    ),
  listCities: () => apiClient<string[]>('/api/meta/cities'),
}

export const unitsApi = {
  list: (params: ListQueryParams = {}) =>
    apiClient<PaginatedResponse<Unit>>(`/api/units${toSearchParams(params)}`),
  getById: (id: string) => apiClient<UnitDetail>(`/api/units/${id}`),
}

export const ticketsApi = {
  list: (params: ListQueryParams = {}) =>
    apiClient<PaginatedResponse<Ticket>>(
      `/api/tickets${toSearchParams(params)}`,
    ),
  getById: (id: string) => apiClient<TicketDetail>(`/api/tickets/${id}`),
  create: (payload: {
    title: string
    description: string
    category: Ticket['category']
    priority: Ticket['priority']
    propertyId: string
    unitId?: string | null
    assignee?: string | null
  }) =>
    apiClient<Ticket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<Ticket>) =>
    apiClient<Ticket>(`/api/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
}

export const usersApi = {
  list: () => apiClient<User[]>('/api/users'),
}
