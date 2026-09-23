/**
 * JS-accessible theme tokens for non-CSS consumers (charts, canvas, etc.).
 * Prefer Tailwind utilities in React UI; use these when a library needs a string color.
 */

export const chartColors = {
  primary: 'var(--chart-1)',
  secondary: 'var(--chart-2)',
  success: 'var(--chart-3)',
  warning: 'var(--chart-4)',
  danger: 'var(--chart-5)',
  muted: 'var(--chart-muted)',
  grid: 'var(--chart-grid)',
  axis: 'var(--chart-axis)',
} as const

/** Ordered palette for generic multi-series / per-bar charts. */
export const chartPalette = [
  chartColors.primary,
  chartColors.secondary,
  chartColors.success,
  chartColors.warning,
  chartColors.danger,
  chartColors.muted,
] as const

const priorityBarColors: Record<string, string> = {
  low: chartColors.muted,
  medium: chartColors.secondary,
  high: chartColors.warning,
  critical: chartColors.danger,
}

const statusBarColors: Record<string, string> = {
  open: chartColors.secondary,
  'in progress': chartColors.warning,
  in_progress: chartColors.warning,
  waiting: chartColors.muted,
  resolved: chartColors.success,
  closed: chartColors.primary,
}

/**
 * Resolves a fill color for a breakdown bar by category name.
 * Falls back to the palette by index when the name is unknown.
 */
export function getBreakdownBarColor(name: string, index: number): string {
  const key = name.trim().toLowerCase()
  return (
    priorityBarColors[key] ??
    statusBarColors[key] ??
    chartPalette[index % chartPalette.length]!
  )
}
