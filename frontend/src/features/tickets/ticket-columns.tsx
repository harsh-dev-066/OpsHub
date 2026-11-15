import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import {
  TicketPriorityBadge,
  TicketStatusBadge,
} from '@/components/feedback/status-badges'
import { formatDate } from '@/lib/utils'
import type { Ticket } from '@/types/domain'

export function createTicketColumns(): ColumnDef<Ticket>[] {
  return [
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
  ]
}
