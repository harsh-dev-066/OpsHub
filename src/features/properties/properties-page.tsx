import { useQuery } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { type SortingState } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import { PageHeader } from '@/components/navigation/page-header'
import { createPropertyColumns } from '@/features/properties/property-columns'
import { PropertiesFilters } from '@/features/properties/properties-filters'
import {
  toPropertiesListParams,
  type PropertiesSearch,
} from '@/features/properties/properties-search'
import { propertiesApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'

const propertiesRoute = getRouteApi('/properties')

export function PropertiesPage() {
  const search = propertiesRoute.useSearch()
  const navigate = propertiesRoute.useNavigate()
  const [searchInput, setSearchInput] = useState(search.search ?? '')

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const nextSearch = searchInput.trim() || undefined
      if (nextSearch === (search.search || undefined)) return
      void navigate({
        search: (prev) => ({
          ...prev,
          search: nextSearch,
          page: 1,
        }),
        replace: true,
      })
    }, 300)
    return () => window.clearTimeout(timer)
  }, [searchInput, search.search, navigate])

  const params = toPropertiesListParams(search)

  const citiesQuery = useQuery({
    queryKey: ['meta', 'cities'],
    queryFn: propertiesApi.listCities,
  })

  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.list(params),
    queryFn: () => propertiesApi.list(params),
  })

  const columns = useMemo(() => createPropertyColumns(), [])

  const sorting: SortingState = [
    {
      id: search.sortBy ?? 'name',
      desc: (search.sortDirection ?? 'asc') === 'desc',
    },
  ]

  function updateSearch(patch: Partial<PropertiesSearch>) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    })
  }

  return (
    <div>
      <PageHeader
        title="Properties"
        description="Browse and filter the property portfolio. Filters sync to the URL for sharing."
      />

      <PropertiesFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        status={search.status ?? 'all'}
        onStatusChange={(value) =>
          updateSearch({
            status:
              value === 'all'
                ? undefined
                : (value as PropertiesSearch['status']),
            page: 1,
          })
        }
        city={search.city ?? 'all'}
        onCityChange={(value) =>
          updateSearch({
            city: value === 'all' ? undefined : value,
            page: 1,
          })
        }
        cities={citiesQuery.data ?? []}
      />

      <DataTable
        columns={columns}
        data={propertiesQuery.data?.data ?? []}
        getRowId={(row) => row.id}
        sorting={sorting}
        onSortingChange={(next) => {
          const active = next[0]
          updateSearch({
            sortBy: active?.id ?? 'name',
            sortDirection: active?.desc ? 'desc' : 'asc',
            page: 1,
          })
        }}
        isLoading={propertiesQuery.isLoading}
        isError={propertiesQuery.isError}
        onRetry={() => propertiesQuery.refetch()}
        emptyTitle="No properties found"
        emptyDescription="No properties match your current filters."
        page={propertiesQuery.data?.page ?? params.page}
        pageSize={propertiesQuery.data?.pageSize ?? params.pageSize}
        total={propertiesQuery.data?.total ?? 0}
        totalPages={propertiesQuery.data?.totalPages ?? 1}
        onPageChange={(page) => updateSearch({ page })}
      />
    </div>
  )
}
