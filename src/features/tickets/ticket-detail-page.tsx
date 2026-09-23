import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { useState } from 'react'
import { toast } from 'sonner'
import { QueryErrorState } from '@/components/feedback/states'
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from '@/components/feedback/status-badges'
import { PageHeader, SectionCard } from '@/components/navigation/page-header'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import { Can } from '@/features/auth/permissions'
import { TicketForm } from '@/features/tickets/ticket-form'
import {
  ticketStatuses,
  type TicketFormValues,
} from '@/features/tickets/ticket-schema'
import { ApiError } from '@/lib/api/client'
import { ticketsApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatDate, formatLabel } from '@/lib/utils'
import type { PaginatedResponse, Ticket, TicketStatus } from '@/types/domain'

export function TicketDetailPage() {
  const { ticketId } = useParams({ from: '/tickets/$ticketId' })
  const queryClient = useQueryClient()
  const [editOpen, setEditOpen] = useState(false)

  const ticketQuery = useQuery({
    queryKey: queryKeys.tickets.detail(ticketId),
    queryFn: () => ticketsApi.getById(ticketId),
  })

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<Ticket>) =>
      ticketsApi.update(ticketId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: queryKeys.tickets.detail(ticketId),
      })
      await queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Ticket updated')
      setEditOpen(false)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update ticket')
    },
  })

  const statusMutation = useMutation({
    mutationFn: (status: TicketStatus) =>
      ticketsApi.update(ticketId, { status }),
    onMutate: async (status) => {
      await queryClient.cancelQueries({
        queryKey: queryKeys.tickets.detail(ticketId),
      })
      const previousDetail = queryClient.getQueryData(
        queryKeys.tickets.detail(ticketId),
      )

      queryClient.setQueryData(
        queryKeys.tickets.detail(ticketId),
        (old: typeof previousDetail) =>
          old && typeof old === 'object'
            ? { ...old, status, updatedAt: new Date().toISOString() }
            : old,
      )

      queryClient.setQueriesData(
        { queryKey: queryKeys.tickets.all },
        (old: unknown) => {
          if (!old || typeof old !== 'object' || !('data' in old)) return old
          const list = old as PaginatedResponse<Ticket>
          return {
            ...list,
            data: list.data.map((ticket) =>
              ticket.id === ticketId
                ? { ...ticket, status, updatedAt: new Date().toISOString() }
                : ticket,
            ),
          }
        },
      )

      return { previousDetail }
    },
    onError: (error: Error, _status, context) => {
      if (context?.previousDetail) {
        queryClient.setQueryData(
          queryKeys.tickets.detail(ticketId),
          context.previousDetail,
        )
      }
      void queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
      toast.error(error.message || 'Failed to update status')
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.tickets.all })
      await queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.all })
      toast.success('Status updated')
    },
  })

  const ticket = ticketQuery.data
  const isNotFound =
    ticketQuery.error instanceof ApiError && ticketQuery.error.status === 404

  async function handleEdit(values: TicketFormValues) {
    try {
      await updateMutation.mutateAsync({
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
    <div className="space-y-6">
      <PageHeader
        title={
          ticket?.title ?? (isNotFound ? 'Ticket not found' : 'Ticket')
        }
        description={
          ticket
            ? `${formatLabel(ticket.category)} · ${formatLabel(ticket.status)}`
            : undefined
        }
        breadcrumbs={[
          { label: 'Tickets', to: '/tickets' },
          { label: ticket?.id ?? 'Detail' },
        ]}
        actions={
          ticket ? (
            <Can permission="tickets:edit">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditOpen(true)}
              >
                Edit ticket
              </Button>
            </Can>
          ) : null
        }
      />

      {ticketQuery.isError ? (
        <QueryErrorState
          title={isNotFound ? 'Ticket not found' : 'Unable to load ticket'}
          description={
            isNotFound
              ? 'This ticket may have been removed or the link is invalid.'
              : ticketQuery.error.message
          }
          onRetry={isNotFound ? undefined : () => ticketQuery.refetch()}
          action={
            <Button asChild variant="outline">
              <Link to="/tickets">Back to tickets</Link>
            </Button>
          }
        />
      ) : ticketQuery.isLoading || !ticket ? (
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-3">
          <SectionCard title="Details" className="lg:col-span-2">
            <dl className="grid gap-4 text-sm sm:grid-cols-2">
              <div>
                <dt className="text-muted-foreground">Status</dt>
                <dd className="mt-1">
                  <TicketStatusBadge status={ticket.status} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Priority</dt>
                <dd className="mt-1">
                  <TicketPriorityBadge priority={ticket.priority} />
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Category</dt>
                <dd className="mt-1 font-medium">
                  {formatLabel(ticket.category)}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Assignee</dt>
                <dd className="mt-1 font-medium">
                  {ticket.assignee ?? 'Unassigned'}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Property</dt>
                <dd className="mt-1">
                  {ticket.property ? (
                    <Link
                      to="/properties/$propertyId"
                      params={{ propertyId: ticket.property.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {ticket.property.name}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Unit</dt>
                <dd className="mt-1">
                  {ticket.unit ? (
                    <Link
                      to="/units/$unitId"
                      params={{ unitId: ticket.unit.id }}
                      className="font-medium text-primary hover:underline"
                    >
                      {ticket.unit.unitNumber}
                    </Link>
                  ) : (
                    '—'
                  )}
                </dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="mt-1">{formatDate(ticket.createdAt)}</dd>
              </div>
              <div>
                <dt className="text-muted-foreground">Updated</dt>
                <dd className="mt-1">{formatDate(ticket.updatedAt)}</dd>
              </div>
            </dl>
            <div className="mt-6">
              <h3 className="text-sm font-semibold">Description</h3>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                {ticket.description}
              </p>
            </div>
          </SectionCard>

          <SectionCard title="Status">
            <Can
              permission="tickets:transition"
              fallback={
                <p className="text-sm text-muted-foreground">
                  Your current role can view tickets but cannot change status.
                </p>
              }
            >
              <div className="space-y-3">
                <Select
                  value={ticket.status}
                  onValueChange={(value) =>
                    statusMutation.mutate(value as TicketStatus)
                  }
                  disabled={statusMutation.isPending}
                >
                  <SelectTrigger aria-label="Update ticket status">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ticketStatuses.map((status) => (
                      <SelectItem key={status} value={status}>
                        {formatLabel(status)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Changes save immediately.
                </p>
              </div>
            </Can>
          </SectionCard>
        </div>
      )}

      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit ticket</DialogTitle>
            <DialogDescription>
              Update ticket fields and save changes.
            </DialogDescription>
          </DialogHeader>
          {ticket ? (
            <TicketForm
              submitLabel="Save changes"
              defaultValues={{
                title: ticket.title,
                description: ticket.description,
                category: ticket.category,
                priority: ticket.priority,
                propertyId: ticket.propertyId,
                unitId: ticket.unitId,
                assignee: ticket.assignee,
              }}
              onSubmit={handleEdit}
              onCancel={() => setEditOpen(false)}
              isSubmitting={updateMutation.isPending}
            />
          ) : null}
        </DialogContent>
      </Dialog>
    </div>
  )
}
