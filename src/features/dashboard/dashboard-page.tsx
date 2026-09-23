import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { lazy, Suspense } from 'react'
import { PageHeader, SectionCard } from '@/components/navigation/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { QueryErrorState } from '@/components/feedback/states'
import { Button } from '@/components/ui/button'
import { dashboardApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatDate, formatPercent } from '@/lib/utils'

const OccupancyChart = lazy(() =>
  import('@/features/dashboard/occupancy-chart').then((m) => ({
    default: m.OccupancyChart,
  })),
)
const BreakdownChart = lazy(() =>
  import('@/features/dashboard/breakdown-chart').then((m) => ({
    default: m.BreakdownChart,
  })),
)

function KpiCard({
  label,
  value,
  isLoading,
}: {
  label: string
  value: string
  isLoading?: boolean
}) {
  return (
    <div className="rounded-lg border bg-card p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      {isLoading ? (
        <Skeleton className="mt-2 h-8 w-20" />
      ) : (
        <p className="mt-2 text-2xl font-semibold tabular-nums">{value}</p>
      )}
    </div>
  )
}

export function DashboardPage() {
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: dashboardApi.getSummary,
  })
  const occupancyQuery = useQuery({
    queryKey: queryKeys.dashboard.occupancy(),
    queryFn: dashboardApi.getOccupancy,
  })
  const priorityQuery = useQuery({
    queryKey: queryKeys.dashboard.ticketsByPriority(),
    queryFn: dashboardApi.getTicketsByPriority,
  })
  const statusQuery = useQuery({
    queryKey: queryKeys.dashboard.ticketsByStatus(),
    queryFn: dashboardApi.getTicketsByStatus,
  })
  const activityQuery = useQuery({
    queryKey: queryKeys.dashboard.activity(),
    queryFn: dashboardApi.getActivity,
  })

  const summaryFailed = summaryQuery.isError

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Operational overview across properties, units, and support tickets."
        actions={
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link to="/properties">View properties</Link>
            </Button>
            <Button asChild>
              <Link to="/tickets">View tickets</Link>
            </Button>
          </div>
        }
      />

      {summaryFailed ? (
        <QueryErrorState onRetry={() => summaryQuery.refetch()} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <KpiCard
            label="Occupancy rate"
            value={formatPercent(summaryQuery.data?.occupancyRate ?? 0)}
            isLoading={summaryQuery.isLoading}
          />
          <KpiCard
            label="Available units"
            value={String(summaryQuery.data?.availableUnits ?? 0)}
            isLoading={summaryQuery.isLoading}
          />
          <KpiCard
            label="Maintenance units"
            value={String(summaryQuery.data?.maintenanceUnits ?? 0)}
            isLoading={summaryQuery.isLoading}
          />
          <KpiCard
            label="Open tickets"
            value={String(summaryQuery.data?.openTickets ?? 0)}
            isLoading={summaryQuery.isLoading}
          />
        </div>
      )}

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        <SectionCard title="Occupancy trend" description="Last 12 months">
          {occupancyQuery.isError ? (
            <QueryErrorState onRetry={() => occupancyQuery.refetch()} />
          ) : occupancyQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <OccupancyChart data={occupancyQuery.data ?? []} />
            </Suspense>
          )}
        </SectionCard>

        <SectionCard title="Tickets by priority">
          {priorityQuery.isError ? (
            <QueryErrorState onRetry={() => priorityQuery.refetch()} />
          ) : priorityQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <BreakdownChart data={priorityQuery.data ?? []} />
            </Suspense>
          )}
        </SectionCard>

        <SectionCard title="Tickets by status">
          {statusQuery.isError ? (
            <QueryErrorState onRetry={() => statusQuery.refetch()} />
          ) : statusQuery.isLoading ? (
            <Skeleton className="h-64 w-full" />
          ) : (
            <Suspense fallback={<Skeleton className="h-64 w-full" />}>
              <BreakdownChart data={statusQuery.data ?? []} />
            </Suspense>
          )}
        </SectionCard>

        <SectionCard title="Recent activity">
          {activityQuery.isError ? (
            <QueryErrorState onRetry={() => activityQuery.refetch()} />
          ) : activityQuery.isLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          ) : (activityQuery.data?.length ?? 0) === 0 ? (
            <p className="text-sm text-muted-foreground">No recent activity.</p>
          ) : (
            <ul className="space-y-3">
              {activityQuery.data?.map((item) => (
                <li
                  key={item.id}
                  className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
                >
                  <p className="text-sm">{item.message}</p>
                  <time className="shrink-0 text-xs text-muted-foreground">
                    {formatDate(item.timestamp)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>
    </div>
  )
}
