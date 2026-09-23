import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { ChartTooltip } from '@/features/dashboard/chart-tooltip'
import { chartColors, chartTick } from '@/theme'
import type { OccupancyPoint } from '@/types/domain'

const GRADIENT_ID = 'occupancy-area-fill'

export function OccupancyChart({ data }: { data: OccupancyPoint[] }) {
  const summary = data
    .map((point) => `${point.month}: ${Math.round(point.occupancyRate)}%`)
    .join('; ')

  return (
    <figure aria-labelledby="occupancy-chart-title">
      <figcaption id="occupancy-chart-title" className="sr-only">
        Line chart of portfolio occupancy rate by month for the last 12 months.
        {summary ? ` Values: ${summary}.` : ''}
      </figcaption>
      <div className="h-64 w-full" role="img" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={data}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
          >
            <defs>
              <linearGradient id={GRADIENT_ID} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={chartColors.primary}
                  stopOpacity={0.18}
                />
                <stop
                  offset="100%"
                  stopColor={chartColors.primary}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} stroke={chartColors.grid} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tick={chartTick}
              tickMargin={8}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[0, 100]}
              ticks={[0, 25, 50, 75, 100]}
              tickLine={false}
              axisLine={false}
              width={44}
              tick={chartTick}
              tickFormatter={(value: number) => `${value}%`}
            />
            <Tooltip
              cursor={{ stroke: chartColors.grid, strokeWidth: 1 }}
              content={
                <ChartTooltip
                  valueLabel="Occupancy"
                  formatValue={(value) => `${Math.round(value)}%`}
                />
              }
            />
            <Area
              type="monotone"
              dataKey="occupancyRate"
              stroke={chartColors.primary}
              strokeWidth={2}
              fill={`url(#${GRADIENT_ID})`}
              dot={false}
              activeDot={{
                r: 4,
                strokeWidth: 2,
                stroke: chartColors.surface,
                fill: chartColors.primary,
              }}
              name="Occupancy %"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
