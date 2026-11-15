import { apiClient, toSearchParams } from '@/lib/api/client'
import type {
  ActivityItem,
  AuthUser,
  Contract,
  DashboardSummary,
  ListQueryParams,
  LoginResponse,
  OccupancyPoint,
  PaginatedResponse,
  Property,
  Resident,
  Role,
  Ticket,
  TicketBreakdownItem,
  Unit,
  User,
} from '@/types/domain'

export interface UnitDetail extends Unit {
  residentDetail: Resident | null
  contract: Contract | null
  property: Property | null
}

export interface TicketDetail extends Ticket {
  property: Property | null
  unit: Unit | null
}

export const authApi = {
  login: (username: string, password: string) =>
    apiClient<LoginResponse>(
      '/api/auth/login',
      { method: 'POST', body: JSON.stringify({ username, password }) },
      { auth: false },
    ),
  logout: (refresh: string) =>
    apiClient<void>(
      '/api/auth/logout',
      { method: 'POST', body: JSON.stringify({ refresh }) },
      { auth: false },
    ),
  me: () => apiClient<AuthUser>('/api/auth/me'),
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

export const residentsApi = {
  list: (params: ListQueryParams = {}) =>
    apiClient<PaginatedResponse<Resident>>(
      `/api/residents${toSearchParams(params)}`,
    ),
}

export const contractsApi = {
  list: (params: ListQueryParams = {}) =>
    apiClient<PaginatedResponse<Contract>>(
      `/api/contracts${toSearchParams(params)}`,
    ),
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
    assigneeId?: string | null
  }) =>
    apiClient<Ticket>('/api/tickets', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (
    id: string,
    payload: Partial<
      Pick<
        Ticket,
        | 'title'
        | 'description'
        | 'category'
        | 'priority'
        | 'status'
        | 'propertyId'
        | 'unitId'
        | 'assigneeId'
      >
    >,
  ) =>
    apiClient<Ticket>(`/api/tickets/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
}

export const usersApi = {
  list: () => apiClient<User[]>('/api/users'),
  getById: (id: string) => apiClient<User>(`/api/users/${id}`),
  create: (payload: {
    name: string
    email: string
    username: string
    password: string
    roles: Role[]
    status?: 'active' | 'inactive'
  }) =>
    apiClient<User>('/api/users', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (
    id: string,
    payload: Partial<{
      name: string
      email: string
      roles: Role[]
      status: 'active' | 'inactive'
      /** Set to reset the user's password; omit to keep it. */
      password: string
    }>,
  ) =>
    apiClient<User>(`/api/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
    }),
}
