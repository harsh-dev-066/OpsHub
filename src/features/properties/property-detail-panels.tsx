import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import {
  PropertyStatusBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
  UnitStatusBadge,
} from '@/components/feedback/status-badges'
import { SectionCard } from '@/components/navigation/page-header'
import { propertiesApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import {
  formatDate,
  formatPercent,
  metricLabelClassName,
  metricValueClassName,
} from '@/lib/utils'
import type { Property, Ticket, Unit } from '@/types/domain'

export function PropertySummary({ property }: { property: Property }) {
  const occupancy =
    property.totalUnits > 0
      ? (property.occupiedUnits / property.totalUnits) * 100
      : 0

  return (
    <section aria-label="Property summary" className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SectionCard>
          <p className={metricLabelClassName}>Status</p>
          <div className="mt-2">
            <PropertyStatusBadge status={property.status} />
          </div>
        </SectionCard>
        <SectionCard>
          <p className={metricLabelClassName}>Occupancy</p>
          <p className={metricValueClassName}>{formatPercent(occupancy)}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            {property.occupiedUnits} occupied · {property.availableUnits}{' '}
            available · {property.maintenanceUnits} maintenance
          </p>
        </SectionCard>
        <SectionCard>
          <p className={metricLabelClassName}>Units</p>
          <p className={metricValueClassName}>{property.totalUnits}</p>
        </SectionCard>
        <SectionCard>
          <p className={metricLabelClassName}>Manager</p>
          <p className="mt-2 text-sm font-medium">{property.manager}</p>
          <p className="mt-1 text-xs text-muted-foreground">
            Created {formatDate(property.createdAt)}
          </p>
        </SectionCard>
      </div>
    </section>
  )
}

export function PropertyUnitsPanel({ propertyId }: { propertyId: string }) {
  const unitsQuery = useQuery({
    queryKey: queryKeys.properties.units(propertyId),
    queryFn: () =>
      propertiesApi.listUnits(propertyId, {
        page: 1,
        pageSize: 20,
        sortBy: 'unitNumber',
        sortDirection: 'asc',
      }),
  })

  const unitColumns = useMemo<ColumnDef<Unit>[]>(
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
    ],
    [],
  )

  return (
    <DataTable
      columns={unitColumns}
      data={unitsQuery.data?.data ?? []}
      getRowId={(row) => row.id}
      enableSorting={false}
      isLoading={unitsQuery.isLoading}
      isError={unitsQuery.isError}
      onRetry={() => unitsQuery.refetch()}
      emptyTitle="No units"
      emptyDescription="This property has no units yet."
    />
  )
}

export function PropertyTicketsPanel({ propertyId }: { propertyId: string }) {
  const ticketsQuery = useQuery({
    queryKey: queryKeys.properties.tickets(propertyId),
    queryFn: () =>
      propertiesApi.listTickets(propertyId, {
        page: 1,
        pageSize: 8,
        sortBy: 'updatedAt',
        sortDirection: 'desc',
      }),
  })

  const ticketColumns = useMemo<ColumnDef<Ticket>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Ticket',
        cell: ({ row }) => (
          <Link
            to="/tickets/$ticketId"
            params={{ ticketId: row.original.id }}
            className="font-medium text-primary hover:underline"
          >
            {row.original.title}
          </Link>
        ),
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
        accessorKey: 'updatedAt',
        header: 'Updated',
        cell: ({ row }) => formatDate(row.original.updatedAt),
      },
    ],
    [],
  )

  return (
    <DataTable
      columns={ticketColumns}
      data={ticketsQuery.data?.data ?? []}
      getRowId={(row) => row.id}
      enableSorting={false}
      isLoading={ticketsQuery.isLoading}
      isError={ticketsQuery.isError}
      onRetry={() => ticketsQuery.refetch()}
      emptyTitle="No tickets"
      emptyDescription="No recent tickets for this property."
    />
  )
}

export function PropertyActivityPanel({
  property,
  ticketTotal,
}: {
  property: Property
  ticketTotal: number
}) {
  return (
    <SectionCard title="Activity timeline">
      <ol className="space-y-3 text-sm">
        <li>
          <time dateTime={property.createdAt}>
            Property created on {formatDate(property.createdAt)}
          </time>
        </li>
        <li>{property.availableUnits} units currently available</li>
        <li>{property.maintenanceUnits} units under maintenance</li>
        <li>
          {ticketTotal > 0
            ? `${ticketTotal} related tickets on record`
            : 'No ticket history yet'}
        </li>
      </ol>
    </SectionCard>
  )
}
