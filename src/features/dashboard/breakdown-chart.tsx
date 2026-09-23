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
import { ChartTooltip } from '@/features/dashboard/chart-tooltip'
import { chartColors, chartTick, getBreakdownBarColor } from '@/theme'
import type { TicketBreakdownItem } from '@/types/domain'

const capitalize = (name: string) =>
  name.charAt(0).toUpperCase() + name.slice(1)

export function BreakdownChart({
  data,
  label,
  valueLabel = 'Tickets',
  layout = 'vertical',
}: {
  data: TicketBreakdownItem[]
  label: string
  valueLabel?: string
  /** `horizontal` puts categories on the Y axis — better for long labels. */
  layout?: 'vertical' | 'horizontal'
}) {
  const summary = data.map((item) => `${item.name}: ${item.value}`).join('; ')
  const horizontal = layout === 'horizontal'

  const categoryAxis = {
    dataKey: 'name',
    type: 'category' as const,
    tickLine: false,
    axisLine: false,
    tick: chartTick,
    tickFormatter: capitalize,
    interval: 0,
  }
  const valueAxis = {
    type: 'number' as const,
    allowDecimals: false,
    tickLine: false,
    axisLine: false,
    tick: chartTick,
  }

  return (
    <figure aria-label={label}>
      <figcaption className="sr-only">
        {label}. {summary ? `Values: ${summary}.` : ''}
      </figcaption>
      <div className="h-64 w-full" role="img" aria-hidden>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            // Recharts' "vertical" layout means bars run horizontally.
            layout={horizontal ? 'vertical' : 'horizontal'}
            margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
            barCategoryGap={horizontal ? '32%' : '28%'}
          >
            <CartesianGrid
              horizontal={!horizontal}
              vertical={horizontal}
              stroke={chartColors.grid}
            />
            {horizontal ? (
              <>
                <XAxis {...valueAxis} tickMargin={8} />
                <YAxis {...categoryAxis} width={84} tickMargin={8} />
              </>
            ) : (
              <>
                <XAxis {...categoryAxis} tickMargin={8} />
                <YAxis {...valueAxis} width={32} />
              </>
            )}
            <Tooltip
              cursor={{ fill: chartColors.cursor, radius: 6 }}
              content={<ChartTooltip valueLabel={valueLabel} />}
            />
            <Bar
              dataKey="value"
              radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]}
              maxBarSize={horizontal ? 24 : 44}
              name={valueLabel}
              isAnimationActive={false}
            >
              {data.map((item, index) => (
                <Cell
                  key={`${item.name}-${index}`}
                  fill={getBreakdownBarColor(item.name)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </figure>
  )
}
