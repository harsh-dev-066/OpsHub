import { Skeleton } from '@/components/ui/skeleton'
import { metricLabelClassName, metricValueClassName } from '@/lib/utils'

export function KpiCard({
  label,
  value,
  isLoading,
  description,
}: {
  label: string
  value: string
  isLoading?: boolean
  description?: string
}) {
  return (
    <article
      className="rounded-lg border bg-card p-4"
      aria-busy={isLoading || undefined}
    >
      <h3 className={metricLabelClassName}>{label}</h3>
      {isLoading ? (
        <>
          <Skeleton className="mt-2 h-8 w-20" aria-hidden />
          <span className="sr-only">Loading {label}</span>
        </>
      ) : (
        <p className={metricValueClassName} aria-live="polite">
          {value}
        </p>
      )}
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </article>
  )
}
