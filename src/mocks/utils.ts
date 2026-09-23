import type { ListQueryParams, PaginatedResponse } from '@/types/domain'

export function delay(ms?: number) {
  if (import.meta.env.MODE === 'test') {
    return Promise.resolve()
  }
  const latency = ms ?? 200 + Math.floor(Math.random() * 400)
  return new Promise((resolve) => setTimeout(resolve, latency))
}

export function shouldForceError(request: Request) {
  const url = new URL(request.url)
  const header = request.headers.get('x-mock-fail')
  return (
    header === '1' ||
    header === 'true' ||
    url.searchParams.get('forceError') === '1'
  )
}

export function shouldFailMutation(request?: Request, rate = 0.05) {
  if (request && shouldForceError(request)) {
    return true
  }
  if (import.meta.env.MODE === 'test') {
    return false
  }
  return Math.random() < rate
}

export function parseListParams(
  url: URL,
): Required<Pick<ListQueryParams, 'page' | 'pageSize'>> & ListQueryParams {
  return {
    search: url.searchParams.get('search') ?? undefined,
    page: Number(url.searchParams.get('page') ?? '1'),
    pageSize: Number(url.searchParams.get('pageSize') ?? '10'),
    status: url.searchParams.get('status') ?? undefined,
    city: url.searchParams.get('city') ?? undefined,
    priority: url.searchParams.get('priority') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
    sortBy: url.searchParams.get('sortBy') ?? undefined,
    sortDirection:
      (url.searchParams.get('sortDirection') as 'asc' | 'desc' | null) ??
      undefined,
    propertyId: url.searchParams.get('propertyId') ?? undefined,
  }
}

export function paginate<T>(
  items: T[],
  page: number,
  pageSize: number,
): PaginatedResponse<T> {
  const safePage = Math.max(page, 1)
  const safePageSize = Math.max(pageSize, 1)
  const start = (safePage - 1) * safePageSize
  const data = items.slice(start, start + safePageSize)
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / safePageSize))

  return {
    data,
    page: safePage,
    pageSize: safePageSize,
    total,
    totalPages,
  }
}

export function sortByField<T>(
  items: T[],
  sortBy?: string,
  sortDirection: 'asc' | 'desc' = 'asc',
) {
  if (!sortBy) return items
  const sorted = [...items].sort((a, b) => {
    const left = (a as Record<string, unknown>)[sortBy]
    const right = (b as Record<string, unknown>)[sortBy]
    if (left == null && right == null) return 0
    if (left == null) return 1
    if (right == null) return -1
    if (typeof left === 'number' && typeof right === 'number') {
      return left - right
    }
    return String(left).localeCompare(String(right))
  })
  return sortDirection === 'desc' ? sorted.reverse() : sorted
}

export function matchesSearch(value: string, search?: string) {
  if (!search) return true
  return value.toLowerCase().includes(search.toLowerCase())
}
