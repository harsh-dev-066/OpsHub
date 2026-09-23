import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { UnitStatusBadge } from '@/components/feedback/status-badges'
import { PageHeader } from '@/components/navigation/page-header'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { propertiesApi, unitsApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatCurrency } from '@/lib/utils'
import type { Unit } from '@/types/domain'

export function UnitsPage() {
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [page, setPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'unitNumber', desc: false },
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
    page,
    pageSize: 10,
    sortBy: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? ('desc' as const) : ('asc' as const),
  }

  const unitsQuery = useQuery({
    queryKey: queryKeys.units.list(params),
    queryFn: () => unitsApi.list(params),
  })

  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.list({ page: 1, pageSize: 100 }),
    queryFn: () => propertiesApi.list({ page: 1, pageSize: 100 }),
  })

  const propertyNameById = useMemo(() => {
    const map = new Map<string, string>()
    for (const property of propertiesQuery.data?.data ?? []) {
      map.set(property.id, property.name)
    }
    return map
  }, [propertiesQuery.data])

  const columns = useMemo<ColumnDef<Unit>[]>(
    () => [
      {
        accessorKey: 'unitNumber',
        header: 'Unit',
        cell: ({ row }) => (
          <Link
            to="/units/$unitId"
            params={{ unitId: row.original.id }}
            className="font-medium text-primary hover:underline"
          >
            {row.original.unitNumber}
          </Link>
        ),
      },
      {
        accessorKey: 'propertyId',
        header: 'Property',
        cell: ({ row }) =>
          propertyNameById.get(row.original.propertyId) ??
          row.original.propertyId,
      },
      { accessorKey: 'type', header: 'Type' },
      { accessorKey: 'floor', header: 'Floor' },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <UnitStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'resident',
        header: 'Resident',
        cell: ({ row }) => row.original.resident ?? '—',
      },
      {
        accessorKey: 'monthlyRate',
        header: 'Monthly rate',
        cell: ({ row }) => formatCurrency(row.original.monthlyRate),
      },
    ],
    [propertyNameById],
  )

  return (
    <div>
      <PageHeader
        title="Units"
        description="Search and filter units across the portfolio."
      />
      <div className="mb-4 grid gap-3 md:grid-cols-2">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search by unit or resident..."
          aria-label="Search units"
        />
        <Select
          value={status}
          onValueChange={(value) => {
            setStatus(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by unit status">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="occupied">Occupied</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable
        columns={columns}
        data={unitsQuery.data?.data ?? []}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next)
          setPage(1)
        }}
        isLoading={unitsQuery.isLoading}
        isError={unitsQuery.isError}
        onRetry={() => unitsQuery.refetch()}
        emptyTitle="No units found"
        page={unitsQuery.data?.page ?? page}
        pageSize={unitsQuery.data?.pageSize ?? 10}
        total={unitsQuery.data?.total ?? 0}
        totalPages={unitsQuery.data?.totalPages ?? 1}
        onPageChange={setPage}
      />
    </div>
  )
}
