import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { getRouteApi } from '@tanstack/react-router'
import { type SortingState } from '@tanstack/react-table'
import { ClipboardPlus, Plus } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import { ActiveFilterChip } from '@/components/feedback/active-filter-chip'
import { PageHeader } from '@/components/navigation/page-header'
import { Button } from '@/components/ui/button'
import { Can } from '@/features/auth/permissions'
import { createTicketColumns } from '@/features/tickets/ticket-columns'
import { TicketForm } from '@/features/tickets/ticket-form'
import { TicketFormDialog } from '@/features/tickets/ticket-form-dialog'
import {
  toTicketsListParams,
  type TicketFormValues,
  type TicketsSearch,
} from '@/features/tickets/ticket-schema'
import { TicketsFilters } from '@/features/tickets/tickets-filters'
import { propertiesApi, ticketsApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { viewportPageClassName } from '@/lib/utils'

const ticketsRoute = getRouteApi('/authenticated/tickets')

export function TicketsPage() {
  const search = ticketsRoute.useSearch()
  const navigate = ticketsRoute.useNavigate()
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
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

  const params = toTicketsListParams(search)

  const ticketsQuery = useQuery({
    queryKey: queryKeys.tickets.list(params),
    queryFn: () => ticketsApi.list(params),
  })

  const propertiesQuery = useQuery({
    queryKey: queryKeys.properties.list({ page: 1, pageSize: 100 }),
    queryFn: () => propertiesApi.list({ page: 1, pageSize: 100 }),
    enabled: Boolean(search.propertyId),
  })

  const propertyFilterLabel = search.propertyId
    ? `Property: ${
        propertiesQuery.data?.data.find((p) => p.id === search.propertyId)
          ?.name ?? search.propertyId
      }`
    : null

  const createMutation = useMutation({
    mutationFn: ticketsApi.create,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Ticket created')
      setOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create ticket')
    },
  })

  const columns = useMemo(() => createTicketColumns(), [])
  const sorting: SortingState = [
    {
      id: search.sortBy ?? 'updatedAt',
      desc: (search.sortDirection ?? 'desc') === 'desc',
    },
  ]

  function updateSearch(patch: Partial<TicketsSearch>) {
    void navigate({
      search: (prev) => ({
        ...prev,
        ...patch,
      }),
    })
  }

  async function handleCreate(values: TicketFormValues) {
    try {
      await createMutation.mutateAsync({
        title: values.title,
        description: values.description,
        category: values.category,
        priority: values.priority,
        propertyId: values.propertyId,
        unitId: values.unitId ?? null,
        assignee: values.assignee ?? null,
      })
    } catch {
      // Keep dialog open; toast handled by mutation onError.
    }
  }

  return (
    <div className={viewportPageClassName}>
      <PageHeader
        title="Tickets"
        description="Track and resolve operational support requests. Filters sync to the URL."
        actions={
          <Can permission="tickets:create">
            <Button type="button" onClick={() => setOpen(true)}>
              <Plus className="h-4 w-4" aria-hidden />
              Create ticket
            </Button>
          </Can>
        }
      />

      {propertyFilterLabel ? (
        <ActiveFilterChip
          label={propertyFilterLabel}
          onClear={() => updateSearch({ propertyId: undefined, page: 1 })}
        />
      ) : null}

      <TicketsFilters
        searchInput={searchInput}
        onSearchInputChange={setSearchInput}
        status={search.status ?? 'all'}
        onStatusChange={(value) =>
          updateSearch({
            status:
              value === 'all' ? undefined : (value as TicketsSearch['status']),
            page: 1,
          })
        }
        priority={search.priority ?? 'all'}
        onPriorityChange={(value) =>
          updateSearch({
            priority:
              value === 'all'
                ? undefined
                : (value as TicketsSearch['priority']),
            page: 1,
          })
        }
        category={search.category ?? 'all'}
        onCategoryChange={(value) =>
          updateSearch({
            category:
              value === 'all'
                ? undefined
                : (value as TicketsSearch['category']),
            page: 1,
          })
        }
      />

      <DataTable
        fillHeight
        columns={columns}
        data={ticketsQuery.data?.data ?? []}
        getRowId={(row) => row.id}
        sorting={sorting}
        onSortingChange={(next) => {
          const active = next[0]
          updateSearch({
            sortBy: active?.id ?? 'updatedAt',
            sortDirection: active?.desc ? 'desc' : 'asc',
            page: 1,
          })
        }}
        isLoading={ticketsQuery.isLoading}
        isError={ticketsQuery.isError}
        onRetry={() => ticketsQuery.refetch()}
        emptyTitle="No tickets found"
        emptyDescription={
          search.propertyId
            ? 'No tickets match this property filter. Clear the filter or adjust search.'
            : 'No tickets match your current filters.'
        }
        page={ticketsQuery.data?.page ?? params.page}
        pageSize={ticketsQuery.data?.pageSize ?? params.pageSize}
        total={ticketsQuery.data?.total ?? 0}
        totalPages={ticketsQuery.data?.totalPages ?? 1}
        onPageChange={(page) => updateSearch({ page })}
      />

      <TicketFormDialog
        open={open}
        onOpenChange={setOpen}
        icon={ClipboardPlus}
        title="Create ticket"
        description="Capture the issue details so operations can follow up."
      >
        <TicketForm
          onSubmit={handleCreate}
          onCancel={() => setOpen(false)}
          isSubmitting={createMutation.isPending}
        />
      </TicketFormDialog>
    </div>
  )
}
