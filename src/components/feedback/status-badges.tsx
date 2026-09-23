import { Badge } from '@/components/ui/badge'
import type {
  PropertyStatus,
  TicketPriority,
  TicketStatus,
  UnitStatus,
} from '@/types/domain'

const propertyStatusVariant: Record<
  PropertyStatus,
  'success' | 'warning' | 'muted'
> = {
  active: 'success',
  maintenance: 'warning',
  inactive: 'muted',
}

const unitStatusVariant: Record<
  UnitStatus,
  'success' | 'info' | 'warning' | 'muted'
> = {
  occupied: 'success',
  available: 'info',
  maintenance: 'warning',
  reserved: 'muted',
}

const ticketStatusVariant: Record<
  TicketStatus,
  'info' | 'warning' | 'muted' | 'success' | 'secondary'
> = {
  open: 'info',
  in_progress: 'warning',
  waiting: 'muted',
  resolved: 'success',
  closed: 'secondary',
}

const ticketPriorityVariant: Record<
  TicketPriority,
  'muted' | 'info' | 'warning' | 'danger'
> = {
  low: 'muted',
  medium: 'info',
  high: 'warning',
  critical: 'danger',
}

function labelize(value: string) {
  return value.replaceAll('_', ' ')
}

export function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  return <Badge variant={propertyStatusVariant[status]}>{status}</Badge>
}

export function UnitStatusBadge({ status }: { status: UnitStatus }) {
  return <Badge variant={unitStatusVariant[status]}>{status}</Badge>
}

export function TicketStatusBadge({ status }: { status: TicketStatus }) {
  return <Badge variant={ticketStatusVariant[status]}>{labelize(status)}</Badge>
}

export function TicketPriorityBadge({
  priority,
}: {
  priority: TicketPriority
}) {
  return <Badge variant={ticketPriorityVariant[priority]}>{priority}</Badge>
}
