import { Link } from '@tanstack/react-router'
import { type ColumnDef } from '@tanstack/react-table'
import { PropertyStatusBadge } from '@/components/feedback/status-badges'
import { Button } from '@/components/ui/button'
import { formatPercent } from '@/lib/utils'
import type { Property } from '@/types/domain'

export function createPropertyColumns(): ColumnDef<Property>[] {
  return [
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
          <p className="text-xs text-muted-foreground">{row.original.address}</p>
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
    {
      id: 'actions',
      header: 'Actions',
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex flex-wrap items-center gap-1">
          <Button asChild variant="ghost" size="sm" className="h-8 px-2">
            <Link
              to="/properties/$propertyId"
              params={{ propertyId: row.original.id }}
            >
              View
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-8 px-2">
            <Link
              to="/units"
              search={{ propertyId: row.original.id }}
            >
              Units
            </Link>
          </Button>
          <Button asChild variant="ghost" size="sm" className="h-8 px-2">
            <Link
              to="/tickets"
              search={{ propertyId: row.original.id }}
            >
              Tickets
            </Link>
          </Button>
        </div>
      ),
    },
  ]
}
