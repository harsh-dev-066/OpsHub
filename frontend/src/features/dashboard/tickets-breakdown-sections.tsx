import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { ChartSection } from '@/features/dashboard/chart-section'
import { dashboardApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'

const BreakdownChart = lazy(() =>
  import('@/features/dashboard/breakdown-chart').then((m) => ({
    default: m.BreakdownChart,
  })),
)

export function TicketsByPrioritySection({
  className,
}: {
  className?: string
}) {
  const priorityQuery = useQuery({
    queryKey: queryKeys.dashboard.ticketsByPriority(),
    queryFn: dashboardApi.getTicketsByPriority,
  })

  const data = priorityQuery.data ?? []
  const isEmpty =
    !priorityQuery.isLoading && data.every((item) => item.value === 0)

  return (
    <ChartSection
      className={className}
      title="Tickets by priority"
      description="Current open and historical volume"
      isLoading={priorityQuery.isLoading}
      isError={priorityQuery.isError}
      isEmpty={isEmpty}
      emptyTitle="No ticket priority data"
      emptyDescription="Priority breakdowns will appear when tickets exist."
      onRetry={() => priorityQuery.refetch()}
    >
      <Suspense fallback={null}>
        <BreakdownChart
          data={data}
          label="Bar chart of tickets grouped by priority"
        />
      </Suspense>
    </ChartSection>
  )
}

export function TicketsByStatusSection({ className }: { className?: string }) {
  const statusQuery = useQuery({
    queryKey: queryKeys.dashboard.ticketsByStatus(),
    queryFn: dashboardApi.getTicketsByStatus,
  })

  const data = statusQuery.data ?? []
  const isEmpty =
    !statusQuery.isLoading && data.every((item) => item.value === 0)

  return (
    <ChartSection
      className={className}
      title="Tickets by status"
      description="Workflow distribution across the portfolio"
      isLoading={statusQuery.isLoading}
      isError={statusQuery.isError}
      isEmpty={isEmpty}
      emptyTitle="No ticket status data"
      emptyDescription="Status breakdowns will appear when tickets exist."
      onRetry={() => statusQuery.refetch()}
    >
      <Suspense fallback={null}>
        <BreakdownChart
          data={data.map((item) => ({
            ...item,
            name: item.name.replaceAll('_', ' '),
          }))}
          label="Bar chart of tickets grouped by status"
          layout="horizontal"
        />
      </Suspense>
    </ChartSection>
  )
}
