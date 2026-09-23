import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useSearch } from '@tanstack/react-router'
import { type ColumnDef, type SortingState } from '@tanstack/react-table'
import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { DataTable } from '@/components/data-table/data-table'
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from '@/components/feedback/status-badges'
import { PageHeader } from '@/components/navigation/page-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useSession } from '@/features/settings/session-context'
import { TicketForm } from '@/features/tickets/ticket-form'
import type { TicketFormValues } from '@/features/tickets/ticket-schema'
import { ticketsApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatDate } from '@/lib/utils'
import type { Ticket } from '@/types/domain'

export function TicketsPage() {
  const { can } = useSession()
  const searchParams = useSearch({ from: '/tickets' })
  const queryClient = useQueryClient()
  const [open, setOpen] = useState(false)
  const [searchInput, setSearchInput] = useState('')
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [priority, setPriority] = useState('all')
  const [category, setCategory] = useState('all')
  const [page, setPage] = useState(1)
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'updatedAt', desc: true },
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
    priority: priority === 'all' ? undefined : priority,
    category: category === 'all' ? undefined : category,
    propertyId: searchParams.propertyId,
    page,
    pageSize: 10,
    sortBy: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? ('desc' as const) : ('asc' as const),
  }

  const ticketsQuery = useQuery({
    queryKey: queryKeys.tickets.list(params),
    queryFn: () => ticketsApi.list(params),
  })

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

  const columns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Ticket',
        cell: ({ row }) => (
          <div>
            <Link
              to="/tickets/$ticketId"
              params={{ ticketId: row.original.id }}
              className="font-medium text-primary hover:underline"
            >
              {row.original.title}
            </Link>
            <p className="text-xs text-muted-foreground">{row.original.id}</p>
          </div>
        ),
      },
      {
        accessorKey: 'category',
        header: 'Category',
      },
      {
        accessorKey: 'priority',
        header: 'Priority',
        cell: ({ row }) => (
          <TicketPriorityBadge priority={row.original.priority} />
        ),
      },
      {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ row }) => <TicketStatusBadge status={row.original.status} />,
      },
      {
        accessorKey: 'assignee',
        header: 'Assignee',
        cell: ({ row }) => row.original.assignee ?? 'Unassigned',
      },
      {
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
    ],
    [],
  )

  async function handleCreate(values: TicketFormValues) {
    await createMutation.mutateAsync({
      title: values.title,
      description: values.description,
      category: values.category,
      priority: values.priority,
      propertyId: values.propertyId,
      unitId: values.unitId ?? null,
      assignee: values.assignee ?? null,
    })
  }

  return (
    <div>
      <PageHeader
        title="Tickets"
        description="Track and resolve operational support requests."
        actions={
          can('tickets:create') ? (
            <Button type="button" onClick={() => setOpen(true)}>
              Create ticket
            </Button>
          ) : null
        }
      />

      <div className="mb-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search tickets..."
          aria-label="Search tickets"
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
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In progress</SelectItem>
            <SelectItem value="waiting">Waiting</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={priority}
          onValueChange={(value) => {
            setPriority(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by priority">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>
        <Select
          value={category}
          onValueChange={(value) => {
            setCategory(value)
            setPage(1)
          }}
        >
          <SelectTrigger aria-label="Filter by category">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
            <SelectItem value="cleaning">Cleaning</SelectItem>
            <SelectItem value="noise">Noise</SelectItem>
            <SelectItem value="billing">Billing</SelectItem>
            <SelectItem value="access">Access</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <DataTable
        columns={columns}
        data={ticketsQuery.data?.data ?? []}
        sorting={sorting}
        onSortingChange={(next) => {
          setSorting(next)
          setPage(1)
        }}
        isLoading={ticketsQuery.isLoading}
        isError={ticketsQuery.isError}
        onRetry={() => ticketsQuery.refetch()}
        emptyTitle="No tickets found"
        page={ticketsQuery.data?.page ?? page}
        pageSize={ticketsQuery.data?.pageSize ?? 10}
        total={ticketsQuery.data?.total ?? 0}
        totalPages={ticketsQuery.data?.totalPages ?? 1}
        onPageChange={setPage}
      />

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create ticket</DialogTitle>
            <DialogDescription>
              Capture the issue details so operations can follow up.
            </DialogDescription>
          </DialogHeader>
          <TicketForm
            onSubmit={handleCreate}
            onCancel={() => setOpen(false)}
            isSubmitting={createMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
