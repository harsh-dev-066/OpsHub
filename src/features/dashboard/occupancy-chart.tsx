import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { OccupancyPoint } from '@/types/domain'

export function OccupancyChart({ data }: { data: OccupancyPoint[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} />
          <XAxis dataKey="month" tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, 100]}
            tickLine={false}
            axisLine={false}
            width={32}
          />
          <Tooltip />
          <Line
            type="monotone"
            dataKey="occupancyRate"
            stroke="hsl(215 70% 28%)"
            strokeWidth={2}
            dot={false}
            name="Occupancy %"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
