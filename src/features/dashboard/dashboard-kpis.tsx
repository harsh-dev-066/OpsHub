import { useQuery } from '@tanstack/react-query'
import { QueryErrorState } from '@/components/feedback/states'
import { KpiCard } from '@/features/dashboard/kpi-card'
import { dashboardApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatPercent } from '@/lib/utils'

export function DashboardKpis() {
  const summaryQuery = useQuery({
    queryKey: queryKeys.dashboard.summary(),
    queryFn: dashboardApi.getSummary,
  })

  if (summaryQuery.isError) {
    return (
      <QueryErrorState
        title="Unable to load KPIs"
        description="Occupancy and ticket summary data could not be retrieved."
        onRetry={() => summaryQuery.refetch()}
      />
    )
  }

  const summary = summaryQuery.data
  const isLoading = summaryQuery.isLoading

  return (
    <section aria-label="Key performance indicators">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Occupancy rate"
          value={formatPercent(summary?.occupancyRate ?? 0)}
          isLoading={isLoading}
          description="Occupied units across the portfolio"
        />
        <KpiCard
          label="Available units"
          value={String(summary?.availableUnits ?? 0)}
          isLoading={isLoading}
          description="Ready for new residents"
        />
        <KpiCard
          label="Maintenance units"
          value={String(summary?.maintenanceUnits ?? 0)}
          isLoading={isLoading}
          description="Temporarily out of service"
        />
        <KpiCard
          label="Open tickets"
          value={String(summary?.openTickets ?? 0)}
          isLoading={isLoading}
          description="Open, in progress, or waiting"
        />
      </div>
    </section>
  )
}
