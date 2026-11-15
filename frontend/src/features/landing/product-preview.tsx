import { Building } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import {
  PREVIEW_KPIS,
  PREVIEW_NAV,
  PREVIEW_OCCUPANCY,
  PREVIEW_TICKETS,
} from '@/features/landing/landing-content'
import { cn } from '@/lib/utils'

const priorityVariant = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
} as const

const MONTHS = ['J', 'F', 'M', 'A', 'M', 'J', 'J', 'A', 'S', 'O', 'N', 'D']

/**
 * Static, illustrative mock of the dashboard (not a screenshot), built from
 * theme tokens so it always matches the real UI's palette.
 */
export function ProductPreview() {
  const peak = Math.max(...PREVIEW_OCCUPANCY)

  return (
    <figure className="relative">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-[2rem] bg-primary/10 blur-2xl"
      />
      <div
        aria-hidden
        className="overflow-hidden rounded-2xl border bg-card shadow-lg ring-1 ring-foreground/5"
      >
        {/* Window chrome */}
        <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-2.5">
          <span className="h-2.5 w-2.5 rounded-full bg-danger-foreground/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-warning-foreground/40" />
          <span className="h-2.5 w-2.5 rounded-full bg-success-foreground/40" />
          <span className="ml-3 truncate rounded-md bg-card px-3 py-0.5 font-mono text-[11px] text-muted-foreground">
            opshub / dashboard
          </span>
        </div>

        <div className="flex">
          {/* Mini sidebar */}
          <div className="hidden w-36 shrink-0 flex-col gap-1 border-r bg-muted/30 p-3 sm:flex">
            <div className="mb-2 flex items-center gap-2 px-1 text-xs font-semibold">
              <span className="flex h-5 w-5 items-center justify-center rounded bg-primary text-primary-foreground">
                <Building className="h-3 w-3" />
              </span>
              OpsHub
            </div>
            {PREVIEW_NAV.map(({ icon: Icon, label }, index) => (
              <div
                key={label}
                className={cn(
                  'flex items-center gap-2 rounded-md px-2 py-1.5 text-[11px]',
                  index === 0
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'text-muted-foreground',
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </div>
            ))}
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1 space-y-3 p-3 sm:p-4">
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-4">
              {PREVIEW_KPIS.map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-lg border bg-card p-2.5">
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-[10px] text-muted-foreground">
                      {label}
                    </span>
                    <Icon className="h-3 w-3 shrink-0 text-accent-foreground" />
                  </div>
                  <p className="mt-1 text-base font-semibold tabular-nums">
                    {value}
                  </p>
                </div>
              ))}
            </div>

            <div className="grid gap-3 lg:grid-cols-5">
              <div className="rounded-lg border bg-card p-3 lg:col-span-3">
                <p className="text-[11px] font-medium">Occupancy trend</p>
                <div className="mt-3 flex h-24 items-end gap-1.5">
                  {PREVIEW_OCCUPANCY.map((rate, index) => (
                    <div
                      key={index}
                      className="flex flex-1 flex-col items-center gap-1"
                    >
                      <div
                        className={cn(
                          'w-full rounded-sm',
                          index === PREVIEW_OCCUPANCY.length - 1
                            ? 'bg-primary'
                            : 'bg-primary/35',
                        )}
                        style={{ height: `${(rate / peak) * 80}px` }}
                      />
                      <span className="text-[9px] text-muted-foreground">
                        {MONTHS[index]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-lg border bg-card p-3 lg:col-span-2">
                <p className="text-[11px] font-medium">Recent tickets</p>
                <ul className="mt-2 space-y-2">
                  {PREVIEW_TICKETS.map((ticket) => (
                    <li
                      key={ticket.title}
                      className="flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-[11px] font-medium">
                          {ticket.title}
                        </p>
                        <p className="truncate text-[10px] text-muted-foreground">
                          {ticket.place}
                        </p>
                      </div>
                      <Badge
                        variant={priorityVariant[ticket.priority]}
                        className="shrink-0 px-1.5 py-0 text-[9px]"
                      >
                        {ticket.priority}
                      </Badge>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
      <figcaption className="sr-only">
        Preview of the OpsHub dashboard: occupancy, available units, open
        tickets, a 12-month occupancy trend and recent tickets.
      </figcaption>
    </figure>
  )
}
