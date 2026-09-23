import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { PropertyStatusBadge } from '@/components/feedback/status-badges'
import { PageHeader } from '@/components/navigation/page-header'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { propertiesApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatPercent } from '@/lib/utils'
import type { Property } from '@/types/domain'

export function PropertiesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState<string>('all')
  const [city, setCity] = useState<string>('all')
  const [page, setPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false },
  ])

  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput)
      setPage(1)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const params = {
    search: search || undefined,
    status: status === 'all' ? undefined : status,
    city: city === 'all' ? undefined : city,
    page,
    pageSize: 8,
    sortBy: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? ('desc' as const) : ('asc' as const),
  }

  const citiesQuery = useQuery({
    queryKey: ['meta', 'cities'],
    queryFn: propertiesApi.listCities,
  })

  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.list(params),
    queryFn: () => propertiesApi.list(params),
  })

  const columns = useMemo<ColumnDef<Property>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Property',
        cell: ({ row }) => (
          <div>
            <Link
              to="/properties/$propertyId"
              params={{ propertyId: row.original.id }}
              className="font-medium text-primary hover:underline"
            >
              {row.original.name}
            </Link>
            <p className="text-xs text-muted-foreground">
              {row.original.address}
            </p>
          </div>
        ),
      },
      {
        accessorKey: 'city',
        header: 'City',
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <PropertyStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'totalUnits',
        header: 'Units',
      },
      {
        id: 'occupancy',
        accessorFn: (row) =>
          row.totalUnits === 0 ? 0 : (row.occupiedUnits / row.totalUnits) * 100,
        header: 'Occupancy',
        enableSorting: false,
        cell: ({ getValue }) => formatPercent(Number(getValue())),
      },
      {
        accessorKey: 'manager',
        header: 'Manager',
      },
    ],
    [],
  )

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Browse and filter the property portfolio."
      />

      <div className="mb-4 grid gap-3 md:grid-cols-3">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search properties..."
          aria-label="Search properties"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={city}
          onValueChange={(value) => {
            setCity(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by city">
            <SelectValue placeholder="City" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All cities</SelectItem>
            {(citiesQuery.data ?? []).map((cityName) => (
              <SelectItem key={cityName} value={cityName}>
                {cityName}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={propertiesQuery.data?.data ?? []}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next)
          setPage(1)
        }}
        isLoading={propertiesQuery.isLoading}
        isError={propertiesQuery.isError}
        onRetry={() => propertiesQuery.refetch()}
        emptyTitle="No properties found"
        emptyDescription="No properties match your current filters."
        page={propertiesQuery.data?.page ?? page}
        pageSize={propertiesQuery.data?.pageSize ?? 8}
        total={propertiesQuery.data?.total ?? 0}
        totalPages={propertiesQuery.data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  )
}
