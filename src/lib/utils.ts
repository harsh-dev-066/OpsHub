import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * List pages: on md+ the page is exactly one viewport tall (minus the app
 * header and main padding) so only the table body scrolls, not the window.
 * Falls back to normal page scroll on small or very short screens.
 */
export const viewportPageClassName =
  'flex flex-col md:h-[calc(100dvh-var(--header-height)-4rem)] md:min-h-[32rem]'

/** Shared label style for KPI / summary metrics. */
export const metricLabelClassName =
  'text-xs font-medium uppercase tracking-wider text-muted-foreground'

/** Shared value style for KPI / summary metrics. */
export const metricValueClassName =
  'mt-2 text-2xl font-semibold tracking-tight tabular-nums'

export function formatCurrency(value: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

export function formatDate(value: string | null | undefined) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(value))
}

export function formatPercent(value: number) {
  return `${Math.round(value)}%`
}

/** Turns `in_progress` / `1br` into readable labels. */
export function formatLabel(value: string) {
  return value.replaceAll('_', ' ')
}
