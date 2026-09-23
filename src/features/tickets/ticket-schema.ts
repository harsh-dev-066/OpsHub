import { z } from 'zod'

export const ticketCategories = [
  'maintenance',
  'cleaning',
  'noise',
  'billing',
  'access',
  'other',
] as const

export const ticketPriorities = ['low', 'medium', 'high', 'critical'] as const

export const ticketStatuses = [
  'open',
  'in_progress',
  'waiting',
  'resolved',
  'closed',
] as const

export const ticketFormSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, 'Title must be at least 3 characters')
    .max(120, 'Title must be 120 characters or fewer'),
  description: z
    .string()
    .trim()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description must be 2000 characters or fewer'),
  category: z.enum(ticketCategories),
  priority: z.enum(ticketPriorities),
  propertyId: z.string().min(1, 'Property is required'),
  unitId: z.string().nullable().optional(),
  assignee: z
    .string()
    .trim()
    .max(80, 'Assignee name is too long')
    .nullable()
    .optional(),
})

export type TicketFormValues = z.infer<typeof ticketFormSchema>

export const ticketsSearchSchema = z.object({
  search: z.string().optional().catch(undefined),
  status: z.enum(ticketStatuses).optional().catch(undefined),
  priority: z.enum(ticketPriorities).optional().catch(undefined),
  category: z.enum(ticketCategories).optional().catch(undefined),
  propertyId: z.string().optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(1),
  pageSize: z.coerce.number().int().positive().max(50).optional().catch(10),
  sortBy: z.string().optional().catch('updatedAt'),
  sortDirection: z.enum(['asc', 'desc']).optional().catch('desc'),
})

export type TicketsSearch = z.infer<typeof ticketsSearchSchema>

export function toTicketsListParams(search: TicketsSearch) {
  return {
    search: search.search || undefined,
    status: search.status,
    priority: search.priority,
    category: search.category,
    propertyId: search.propertyId,
    page: search.page ?? 1,
    pageSize: search.pageSize ?? 10,
    sortBy: search.sortBy ?? 'updatedAt',
    sortDirection: search.sortDirection ?? ('desc' as const),
  }
}
