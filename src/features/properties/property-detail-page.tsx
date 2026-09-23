import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { useMemo } from 'react'
import { DataTable } from '@/components/data-table/data-table'
import {
  PropertyStatusBadge,
  TicketPriorityBadge,
  TicketStatusBadge,
  UnitStatusBadge,
} from '@/components/feedback/status-badges'
import { QueryErrorState } from '@/components/feedback/states'
import { PageHeader, SectionCard } from '@/components/navigation/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { propertiesApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatDate, formatPercent } from '@/lib/utils'
import type { Ticket, Unit } from '@/types/domain'

export function PropertyDetailPage() {
  const { propertyId } = useParams({ from: '/properties/$propertyId' })

  const propertyQuery = useQuery({
    queryKey: queryKeys.properties.detail(propertyId),
    queryFn: () => propertiesApi.getById(propertyId),
  })

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

  if (propertyQuery.isError) {
    return <QueryErrorState onRetry={() => propertyQuery.refetch()} />
  }

  const property = propertyQuery.data
  const occupancy =
    property && property.totalUnits > 0
      ? (property.occupiedUnits / property.totalUnits) * 100
      : 0

  return (
    <div>
      <PageHeader
        title={property?.name ?? 'Property'}
        description={
          property
            ? `${property.address}, ${property.city}, ${property.country}`
            : 'Loading property details...'
        }
        breadcrumbs={[
          { label: 'Properties', to: '/properties' },
          { label: property?.name ?? 'Detail' },
        ]}
      />

      {propertyQuery.isLoading || !property ? (
        <div className="space-y-4">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SectionCard>
              <p className="text-xs uppercase text-muted-foreground">Status</p>
              <div className="mt-2">
                <PropertyStatusBadge status={property.status} />
              </div>
            </SectionCard>
            <SectionCard>
              <p className="text-xs uppercase text-muted-foreground">
                Occupancy
              </p>
              <p className="mt-2 text-xl font-semibold">
                {formatPercent(occupancy)}
              </p>
            </SectionCard>
            <SectionCard>
              <p className="text-xs uppercase text-muted-foreground">Units</p>
              <p className="mt-2 text-xl font-semibold">
                {property.occupiedUnits}/{property.totalUnits}
              </p>
            </SectionCard>
            <SectionCard>
              <p className="text-xs uppercase text-muted-foreground">Manager</p>
              <p className="mt-2 text-sm font-medium">{property.manager}</p>
            </SectionCard>
          </div>

          <Tabs defaultValue="units">
            <TabsList>
              <TabsTrigger value="units">Units</TabsTrigger>
              <TabsTrigger value="tickets">Recent tickets</TabsTrigger>
              <TabsTrigger value="activity">Activity</TabsTrigger>
            </TabsList>
            <TabsContent value="units">
              <DataTable
                columns={unitColumns}
                data={unitsQuery.data?.data ?? []}
                isLoading={unitsQuery.isLoading}
                isError={unitsQuery.isError}
                onRetry={() => unitsQuery.refetch()}
                emptyTitle="No units"
                emptyDescription="This property has no units yet."
              />
            </TabsContent>
            <TabsContent value="tickets">
              <DataTable
                columns={ticketColumns}
                data={ticketsQuery.data?.data ?? []}
                isLoading={ticketsQuery.isLoading}
                isError={ticketsQuery.isError}
                onRetry={() => ticketsQuery.refetch()}
                emptyTitle="No tickets"
                emptyDescription="No recent tickets for this property."
              />
            </TabsContent>
            <TabsContent value="activity">
              <SectionCard title="Timeline">
                <ul className="space-y-3 text-sm">
                  <li>Property created on {formatDate(property.createdAt)}</li>
                  <li>{property.availableUnits} units currently available</li>
                  <li>{property.maintenanceUnits} units under maintenance</li>
                  <li>
                    {(ticketsQuery.data?.total ?? 0) > 0
                      ? `${ticketsQuery.data?.total} related tickets on record`
                      : 'No ticket history yet'}
                  </li>
                </ul>
              </SectionCard>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
