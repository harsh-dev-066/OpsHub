import { EmptyState, QueryErrorState } from '@/components/feedback/states'
import { Skeleton } from '@/components/ui/skeleton'
import { SectionCard } from '@/components/navigation/page-header'

export function ChartSection({
  title,
  description,
  isLoading,
  isError,
  isEmpty,
  emptyTitle,
  emptyDescription,
  onRetry,
  children,
  className,
}: {
  title: string
  description?: string
  isLoading: boolean
  isError: boolean
  isEmpty: boolean
  emptyTitle: string
  emptyDescription: string
  onRetry: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <SectionCard title={title} description={description} className={className}>
      {isError ? (
        <QueryErrorState
          title={`Unable to load ${title.toLowerCase()}`}
          onRetry={onRetry}
        />
      ) : isLoading ? (
        <Skeleton className="h-64 w-full" aria-label={`Loading ${title}`} />
      ) : isEmpty ? (
        <EmptyState title={emptyTitle} description={emptyDescription} />
      ) : (
        children
      )}
    </SectionCard>
  )
}
