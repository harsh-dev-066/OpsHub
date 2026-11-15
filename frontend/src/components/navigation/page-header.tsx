import { Link } from '@tanstack/react-router'
import { cn } from '@/lib/utils'

type AppPath =
  '/dashboard' | '/properties' | '/units' | '/tickets' | '/settings'

export function PageHeader({
  title,
  description,
  actions,
  breadcrumbs,
}: {
  title: string
  description?: string
  actions?: React.ReactNode
  breadcrumbs?: Array<{ label: string; to?: AppPath }>
}) {
  return (
    <div className="mb-6 space-y-3">
      {breadcrumbs && breadcrumbs.length > 0 ? (
        <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
          <ol className="flex flex-wrap items-center gap-1">
            {breadcrumbs.map((crumb, index) => {
              const isCurrent = !crumb.to
              return (
                <li
                  key={`${crumb.label}-${index}`}
                  className="flex items-center gap-1"
                >
                  {index > 0 ? (
                    <span aria-hidden className="text-border">
                      /
                    </span>
                  ) : null}
                  {crumb.to ? (
                    <Link
                      to={crumb.to}
                      className="transition-colors hover:text-foreground"
                    >
                      {crumb.label}
                    </Link>
                  ) : (
                    <span
                      className="text-foreground"
                      aria-current={isCurrent ? 'page' : undefined}
                    >
                      {crumb.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      ) : null}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {description ? (
            <p className="max-w-2xl text-sm text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  )
}

export function SectionCard({
  title,
  description,
  children,
  className,
  action,
}: {
  title?: string
  description?: string
  children: React.ReactNode
  className?: string
  action?: React.ReactNode
}) {
  return (
    <section
      className={cn(
        'flex min-w-0 flex-col rounded-xl border bg-card shadow-sm',
        className,
      )}
    >
      {(title || action) && (
        <div className="flex items-start justify-between gap-3 px-5 pt-5">
          <div className="min-w-0 space-y-0.5">
            {title ? (
              <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
            ) : null}
            {description ? (
              <p className="text-xs text-muted-foreground">{description}</p>
            ) : null}
          </div>
          {action}
        </div>
      )}
      <div className={cn('flex-1 p-5', (title || action) && 'pt-4')}>
        {children}
      </div>
    </section>
  )
}
