import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import type { ProjectionPoint } from '../lib/compound'
import { formatUSD } from '../lib/format'

interface ProjectionChartProps {
  series: ProjectionPoint[]
}

function formatChartValue(value: unknown): string {
  return formatUSD(Number(value))
}

function formatChartYear(value: unknown): string {
  return `Year ${String(value)}`
}

export default function ProjectionChart({ series }: ProjectionChartProps) {
  return (
    <div
      className="chart-frame"
      role="img"
      aria-label="Line chart comparing money spent with money invested by year"
    >
      <ResponsiveContainer
        width="100%"
        height="100%"
        initialDimension={{ width: 960, height: 380 }}
      >
        <LineChart
          data={series}
          accessibilityLayer
          margin={{ top: 12, right: 12, bottom: 0, left: 4 }}
        >
          <CartesianGrid vertical={false} stroke="var(--rule)" strokeDasharray="2 7" />
          <XAxis
            dataKey="year"
            axisLine={false}
            tickLine={false}
            tickMargin={12}
            minTickGap={28}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tickMargin={10}
            tickFormatter={formatChartValue}
            width={84}
          />
          <Tooltip
            formatter={formatChartValue}
            labelFormatter={formatChartYear}
            cursor={{ stroke: 'var(--rule-strong)', strokeWidth: 1 }}
            contentStyle={{
              background: 'var(--ink)',
              border: 'none',
              borderRadius: '2px',
              color: 'var(--surface)',
            }}
            labelStyle={{ color: 'var(--surface)', fontWeight: 600 }}
          />
          <Line
            type="monotone"
            dataKey="spent"
            name="Spent"
            stroke="var(--chart-spent)"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="invested"
            name="If invested"
            stroke="var(--accent)"
            strokeWidth={3}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
            animationBegin={650}
            animationDuration={1400}
            animationEasing="ease-out"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}
