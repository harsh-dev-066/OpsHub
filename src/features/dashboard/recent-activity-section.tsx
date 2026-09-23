import { useQuery } from '@tanstack/react-query'
import { Link } from '@tanstack/react-router'
import { Building2, ChevronRight, ClipboardList, DoorOpen } from 'lucide-react'
import { EmptyState, QueryErrorState } from '@/components/feedback/states'
import { SectionCard } from '@/components/navigation/page-header'
import { Skeleton } from '@/components/ui/skeleton'
import { dashboardApi } from '@/lib/api'
import { queryKeys } from '@/lib/query/keys'
import { cn, formatDate } from '@/lib/utils'
import type { ActivityItem } from '@/types/domain'

const activityIcon = {
  ticket: { icon: ClipboardList, className: 'bg-info text-info-foreground' },
  unit: { icon: DoorOpen, className: 'bg-success text-success-foreground' },
  property: { icon: Building2, className: 'bg-accent text-accent-foreground' },
} satisfies Record<ActivityItem['type'], unknown>

function activityHref(item: ActivityItem) {
  if (item.type === 'ticket') {
    return {
      to: '/tickets/$ticketId' as const,
      params: { ticketId: item.entityId },
    }
  }
  if (item.type === 'unit') {
    return { to: '/units/$unitId' as const, params: { unitId: item.entityId } }
  }
  return {
    to: '/properties/$propertyId' as const,
    params: { propertyId: item.entityId },
  }
}

export function RecentActivitySection({ className }: { className?: string }) {
  const activityQuery = useQuery({
    queryKey: queryKeys.dashboard.activity(),
    queryFn: dashboardApi.getActivity,
  })

  return (
    <SectionCard
      title="Recent activity"
      description="Latest operational events across properties and tickets"
      className={className}
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
        // Height-capped so the card lines up with the chart beside it.
        <ul className="-mx-2 max-h-64 space-y-0.5 overflow-y-auto pr-1">
          {activityQuery.data?.map((item) => {
            const href = activityHref(item)
            const { icon: Icon, className: iconClassName } =
              activityIcon[item.type]
            return (
              <li key={item.id}>
                <Link
                  to={href.to}
                  params={href.params}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2 transition-colors hover:bg-muted/70"
                >
                  <span
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                      iconClassName,
                    )}
                    aria-hidden
                  >
                    <Icon className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-foreground">
                      {item.message}
                    </span>
                    <span className="block text-xs capitalize text-muted-foreground">
                      {item.type}
                    </span>
                  </span>
                  <time
                    dateTime={item.timestamp}
                    className="shrink-0 text-xs tabular-nums text-muted-foreground"
                  >
                    {formatDate(item.timestamp)}
                  </time>
                  <ChevronRight
                    className="h-4 w-4 shrink-0 text-muted-foreground/50 transition-transform group-hover:translate-x-0.5 group-hover:text-muted-foreground"
                    aria-hidden
                  />
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </SectionCard>
  )
}
