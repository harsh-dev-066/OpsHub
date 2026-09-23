import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn, metricLabelClassName, metricValueClassName } from '@/lib/utils'

const toneClassName = {
  primary: 'bg-accent text-accent-foreground',
  success: 'bg-success text-success-foreground',
  warning: 'bg-warning text-warning-foreground',
  info: 'bg-info text-info-foreground',
} as const

export function KpiCard({
  label,
  value,
  isLoading,
  description,
  icon: Icon,
  tone = 'primary',
}: {
  label: string
  value: string
  isLoading?: boolean
  description?: string
  icon?: LucideIcon
  tone?: keyof typeof toneClassName
}) {
  return (
    <article
      className="rounded-xl border bg-card p-5 shadow-sm"
      aria-busy={isLoading || undefined}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className={metricLabelClassName}>{label}</h3>
        {Icon ? (
          <span
            className={cn(
              'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
              toneClassName[tone],
            )}
            aria-hidden
          >
            <Icon className="h-4 w-4" />
          </span>
        ) : null}
      </div>
      {isLoading ? (
        <>
          <Skeleton className="mt-1 h-9 w-20" aria-hidden />
          <span className="sr-only">Loading {label}</span>
        </>
      ) : (
        <p
          className={cn(metricValueClassName, 'mt-1 text-3xl')}
          aria-live="polite"
        >
          {value}
        </p>
      )}
      {description ? (
        <p className="mt-1 text-xs text-muted-foreground">{description}</p>
      ) : null}
    </article>
  )
}
