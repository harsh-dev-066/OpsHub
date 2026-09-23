import type { ListQueryParams } from '@/types/domain'

export const queryKeys = {
  dashboard: {
    all: ['dashboard'] as const,
    summary: () => [...queryKeys.dashboard.all, 'summary'] as const,
    occupancy: () => [...queryKeys.dashboard.all, 'occupancy'] as const,
    ticketsByPriority: () =>
      [...queryKeys.dashboard.all, 'tickets-by-priority'] as const,
    ticketsByStatus: () =>
      [...queryKeys.dashboard.all, 'tickets-by-status'] as const,
    activity: () => [...queryKeys.dashboard.all, 'activity'] as const,
  },
  properties: {
    all: ['properties'] as const,
    list: (params: ListQueryParams) =>
      [...queryKeys.properties.all, 'list', params] as const,
    detail: (id: string) =>
      [...queryKeys.properties.all, 'detail', id] as const,
    units: (id: string) => [...queryKeys.properties.all, id, 'units'] as const,
    tickets: (id: string) =>
      [...queryKeys.properties.all, id, 'tickets'] as const,
  },
  units: {
    all: ['units'] as const,
    list: (params: ListQueryParams) =>
      [...queryKeys.units.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.units.all, 'detail', id] as const,
  },
  tickets: {
    all: ['tickets'] as const,
    list: (params: ListQueryParams) =>
      [...queryKeys.tickets.all, 'list', params] as const,
    detail: (id: string) => [...queryKeys.tickets.all, 'detail', id] as const,
  },
  users: {
    all: ['users'] as const,
    list: () => [...queryKeys.users.all, 'list'] as const,
  },
}
