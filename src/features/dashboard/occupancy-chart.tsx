import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { chartColors } from '@/theme'
import type { OccupancyPoint } from '@/types/domain'

export function OccupancyChart({ data }: { data: OccupancyPoint[] }) {
  const summary = data
    .map((point) => `${point.month}: ${Math.round(point.occupancyRate)}%`)
    .join('; ')

  return (
    <figure className="space-y-2" aria-labelledby="occupancy-chart-title">
      <figcaption id="occupancy-chart-title" className="sr-only">
        Line chart of portfolio occupancy rate by month for the last 12 months.
        {summary ? ` Values: ${summary}.` : ''}
      </figcaption>
      <div className="h-64 w-full" role="img" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={chartColors.grid}
            />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              stroke={chartColors.axis}
              label={{ value: 'Month', position: 'insideBottom', offset: -2 }}
            />
            <YAxis
              domain={[0, 100]}
              tickLine={false}
              axisLine={false}
              width={36}
              unit="%"
              stroke={chartColors.axis}
              label={{
                value: 'Occupancy %',
                angle: -90,
                position: 'insideLeft',
                offset: 10,
              }}
            />
            <Tooltip
              formatter={(value) => [
                `${Math.round(Number(value))}%`,
                'Occupancy',
              ]}
            />
            <Line
              type="monotone"
              dataKey="occupancyRate"
              stroke={chartColors.primary}
              strokeWidth={2}
              dot={false}
              name="Occupancy %"
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
