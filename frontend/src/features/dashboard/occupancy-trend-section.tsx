import { useQuery } from '@tanstack/react-query'
import { lazy, Suspense } from 'react'
import { ChartSection } from '@/features/dashboard/chart-section'
import { dashboardApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'

const OccupancyChart = lazy(() =>
  import('@/features/dashboard/occupancy-chart').then((m) => ({
    default: m.OccupancyChart,
  })),
)

export function OccupancyTrendSection({ className }: { className?: string }) {
  const occupancyQuery = useQuery({
    queryKey: queryKeys.dashboard.occupancy(),
    queryFn: dashboardApi.getOccupancy,
  })

  const data = occupancyQuery.data ?? []

  return (
    <ChartSection
      className={className}
      title="Occupancy trend"
      description="Last 12 months"
      isLoading={occupancyQuery.isLoading}
      isError={occupancyQuery.isError}
      isEmpty={!occupancyQuery.isLoading && data.length === 0}
      emptyTitle="No occupancy data"
      emptyDescription="Occupancy trend points will appear once historical data is available."
      onRetry={() => occupancyQuery.refetch()}
    >
      <Suspense fallback={null}>
        <OccupancyChart data={data} />
      </Suspense>
    </ChartSection>
  )
}
