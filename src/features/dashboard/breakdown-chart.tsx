import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { chartColors, getBreakdownBarColor } from '@/theme'
import type { TicketBreakdownItem } from '@/types/domain'

export function BreakdownChart({
  data,
  label,
  valueLabel = 'Tickets',
}: {
  data: TicketBreakdownItem[]
  label: string
  valueLabel?: string
}) {
  const summary = data.map((item) => `${item.name}: ${item.value}`).join('; ')

  return (
    <figure className="space-y-2" aria-label={label}>
      <figcaption className="sr-only">
        {label}. {summary ? `Values: ${summary}.` : ''}
      </figcaption>
      <div className="h-64 w-full" role="img" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={chartColors.grid}
            />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              stroke={chartColors.axis}
            />
            <YAxis
              allowDecimals={false}
              tickLine={false}
              axisLine={false}
              width={32}
              stroke={chartColors.axis}
              label={{
                value: valueLabel,
                angle: -90,
                position: 'insideLeft',
                offset: 8,
              }}
            />
            <Tooltip
              formatter={(value) => [Number(value), valueLabel]}
              labelFormatter={(name) => String(name).replaceAll('_', ' ')}
            />
            <Bar
              dataKey="value"
              radius={[4, 4, 0, 0]}
              name={valueLabel}
              isAnimationActive={false}
            >
              {data.map((item, index) => (
                <Cell
                  key={`${item.name}-${index}`}
                  fill={getBreakdownBarColor(item.name, index)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
