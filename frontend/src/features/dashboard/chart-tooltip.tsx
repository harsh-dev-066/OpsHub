import type { TooltipContentProps } from 'recharts'

/**
 * Card-styled tooltip for Recharts. Text stays in text tokens; a small swatch
 * carries the series identity.
 */
export function ChartTooltip({
  active,
  payload,
  label,
  formatValue = (value) => String(value),
  valueLabel,
}: Partial<TooltipContentProps<number, string>> & {
  formatValue?: (value: number) => string
  valueLabel: string
}) {
  const entry = payload?.[0]
  if (!active || !entry) return null

  const swatch =
    (entry.payload as { fill?: string } | undefined)?.fill ??
    entry.color ??
    'var(--chart-1)'

  return (
    <div className="min-w-32 rounded-lg border bg-popover px-3 py-2 text-xs shadow-md">
      <p className="font-medium capitalize text-foreground">
        {String(label ?? '').replaceAll('_', ' ')}
      </p>
      <div className="mt-1 flex items-center justify-between gap-4">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: swatch }}
            aria-hidden
          />
          {valueLabel}
        </span>
        <span className="font-semibold tabular-nums text-foreground">
          {formatValue(Number(entry.value))}
        </span>
      </div>
    </div>
  )
}
