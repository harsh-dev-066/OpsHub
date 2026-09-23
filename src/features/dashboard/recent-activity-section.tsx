import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { EmptyState, QueryErrorState } from '@/components/feedback/states'
import { SectionCard } from '@/components/navigation/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { formatDate } from '@/lib/utils'
import type { ActivityItem } from '@/types/domain'

function activityHref(item: ActivityItem) {
  if (item.type === 'ticket') {
    return { to: '/tickets/$ticketId' as const, params: { ticketId: item.entityId } }
  }
  if (item.type === 'unit') {
    return { to: '/units/$unitId' as const, params: { unitId: item.entityId } }
  }
  return {
    to: '/properties/$propertyId' as const,
    params: { propertyId: item.entityId },
  }
}

export function RecentActivitySection() {
  const activityQuery = useQuery({
    queryKey: queryKeys.dashboard.activity(),
    queryFn: dashboardApi.getActivity,
  })

  return (
    <SectionCard
      title="Recent activity"
      description="Latest operational events across properties and tickets"
    >
      {activityQuery.isError ? (
        <QueryErrorState
          title="Unable to load activity"
          onRetry={() => activityQuery.refetch()}
        />
      ) : activityQuery.isLoading ? (
        <div className="space-y-3" aria-label="Loading recent activity">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      ) : (activityQuery.data?.length ?? 0) === 0 ? (
        <EmptyState
          title="No recent activity"
          description="Operational updates will show up here as tickets and units change."
        />
      ) : (
        <ul className="space-y-3">
          {activityQuery.data?.map((item) => {
            const href = activityHref(item)
            return (
              <li
                key={item.id}
                className="flex items-start justify-between gap-3 border-b pb-3 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <p className="text-sm">
                    <Link
                      to={href.to}
                      params={href.params}
                      className="font-medium text-primary hover:underline"
                    >
                      {item.message}
                    </Link>
                  </p>
                  <p className="mt-0.5 text-xs capitalize text-muted-foreground">
                    {item.type}
                  </p>
                </div>
                <time
                  dateTime={item.timestamp}
                  className="shrink-0 text-xs text-muted-foreground"
                >
                  {formatDate(item.timestamp)}
                </time>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
