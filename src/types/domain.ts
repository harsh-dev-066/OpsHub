export type Role = 'Admin' | 'Operations Manager' | 'Support Agent' | 'Viewer'

export type PropertyStatus = 'active' | 'inactive' | 'maintenance'

export type UnitStatus = 'occupied' | 'available' | 'maintenance' | 'reserved'

export type UnitType = 'studio' | '1br' | '2br' | '3br' | 'shared'

export type TicketCategory =
  'maintenance' | 'cleaning' | 'noise' | 'billing' | 'access' | 'other'

export type TicketPriority = 'low' | 'medium' | 'high' | 'critical'

export type TicketStatus =
  'open' | 'in_progress' | 'waiting' | 'resolved' | 'closed'

export type ContractStatus = 'active' | 'pending' | 'expired' | 'terminated'

export interface Property {
  id: string
  name: string
  city: string
  country: string
  address: string
  status: PropertyStatus
  totalUnits: number
  occupiedUnits: number
  availableUnits: number
  maintenanceUnits: number
  manager: string
  createdAt: string
}

export interface Unit {
  id: string
  propertyId: string
  unitNumber: string
  type: UnitType
  floor: number
  status: UnitStatus
  resident: string | null
  monthlyRate: number
  contractStart: string | null
  contractEnd: string | null
}

export interface Resident {
  id: string
  name: string
  email: string
  phone: string
  nationality: string
  moveInDate: string
  unitId: string
}

export interface Contract {
  id: string
  residentId: string
  unitId: string
  startDate: string
  endDate: string
  status: ContractStatus
}

export interface Ticket {
  id: string
  propertyId: string
  unitId: string | null
  title: string
  description: string
  category: TicketCategory
  priority: TicketPriority
  status: TicketStatus
  assignee: string | null
  createdAt: string
  updatedAt: string
}

export interface User {
  id: string
  name: string
  email: string
  username: string
  roles: Role[]
  status: 'active' | 'inactive'
  createdAt: string
}

export interface DashboardSummary {
  occupancyRate: number
  availableUnits: number
  maintenanceUnits: number
  openTickets: number
  totalProperties: number
  totalUnits: number
}

export interface OccupancyPoint {
  month: string
  occupancyRate: number
}

export interface TicketBreakdownItem {
  name: string
  value: number
}

export interface ActivityItem {
  id: string
  type: 'ticket' | 'unit' | 'property'
  message: string
  timestamp: string
  entityId: string
}

export interface PaginatedResponse<T> {
  data: T[]
  page: number
  pageSize: number
  total: number
  totalPages: number
}

export interface ListQueryParams {
  search?: string
  page?: number
  pageSize?: number
  status?: string
  city?: string
  priority?: string
  category?: string
  sortBy?: string
  sortDirection?: 'asc' | 'desc'
  propertyId?: string
}
