/**
 * JS-accessible theme tokens for non-CSS consumers (charts, canvas, etc.).
 * Prefer Tailwind utilities in React UI; use these when a library needs a string color.
 */

export const chartColors = {
  primary: 'var(--chart-1)',
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
  cursor: 'var(--chart-cursor)',
  surface: 'var(--chart-surface)',
} as const

/** Shared axis tick style: small, muted, never the series color. */
export const chartTick = { fill: chartColors.axis, fontSize: 12 }

/** Single-hue ramp (light -> dark) for ordinal magnitude. */
export const chartSequential = [
  'var(--chart-seq-1)',
  'var(--chart-seq-2)',
  'var(--chart-seq-3)',
  'var(--chart-seq-4)',
] as const

const priorityOrder = ['low', 'medium', 'high', 'critical']

/**
 * Resolves a fill color for a breakdown bar by category name.
 * Priority is ordinal, so it maps onto the sequential ramp (critical = darkest).
 * Everything else (e.g. status) is already identified by its axis label and
 * uses the single brand hue to keep the dashboard calm.
 */
export function getBreakdownBarColor(name: string): string {
  const rank = priorityOrder.indexOf(name.trim().toLowerCase())
  return rank >= 0 ? chartSequential[rank]! : chartColors.primary
}
