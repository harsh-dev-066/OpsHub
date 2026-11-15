import { z } from 'zod'

export const propertiesSearchSchema = z.object({
  search: z.string().optional().catch(undefined),
  status: z
    .enum(['active', 'inactive', 'maintenance'])
    .optional()
    .catch(undefined),
  city: z.string().optional().catch(undefined),
  page: z.coerce.number().int().positive().optional().catch(1),
  pageSize: z.coerce.number().int().positive().max(50).optional().catch(8),
  sortBy: z.string().optional().catch('name'),
  sortDirection: z.enum(['asc', 'desc']).optional().catch('asc'),
})

export type PropertiesSearch = z.infer<typeof propertiesSearchSchema>

export function toPropertiesListParams(search: PropertiesSearch) {
  return {
    search: search.search || undefined,
    status: search.status,
    city: search.city,
    page: search.page ?? 1,
    pageSize: search.pageSize ?? 8,
    sortBy: search.sortBy ?? 'name',
    sortDirection: search.sortDirection ?? ('asc' as const),
  }
}
