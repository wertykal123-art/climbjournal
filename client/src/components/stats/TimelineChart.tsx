import { TimelineData } from '@/types/models'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { CHART_GRID_COLOR, CHART_TICK_COLOR } from '@/utils/colors'
import ChartEmpty from './ChartEmpty'

interface TimelineChartProps {
  data: TimelineData[]
  dataKey?: 'climbs' | 'points'
  height?: number
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

// Server keys are "YYYY-MM" (monthly) or "YYYY-MM-DD" (daily/weekly), in UTC.
function formatTick(key: string): string {
  const [year, month, day] = key.split('-')
  const monthName = MONTHS[Number(month) - 1] ?? month
  if (!day) return `${monthName} '${year.slice(2)}`
  return `${monthName} ${Number(day)}`
}

function formatTooltipLabel(key: string): string {
  const [year, month, day] = key.split('-')
  const monthName = MONTHS[Number(month) - 1] ?? month
  return day ? `${monthName} ${Number(day)}, ${year}` : `${monthName} ${year}`
}

export default function TimelineChart({ data, dataKey = 'points', height = 300 }: TimelineChartProps) {
  const color = dataKey === 'points' ? '#38A169' : '#3182CE'

  if (data.length === 0) {
    return <ChartEmpty height={height} message="No climbs in this period" />
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 8, left: -12, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} vertical={false} />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 11, fill: CHART_TICK_COLOR }}
          tickFormatter={formatTick}
          minTickGap={16}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID_COLOR }}
        />
        <YAxis
          tick={{ fontSize: 11, fill: CHART_TICK_COLOR }}
          allowDecimals={false}
          tickLine={false}
          axisLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: `1px solid ${CHART_GRID_COLOR}`,
            borderRadius: '8px',
            fontSize: 13,
          }}
          labelFormatter={(label: string) => formatTooltipLabel(label)}
          formatter={(value: number) => [
            dataKey === 'points' ? `${value} pts` : `${value} climbs`,
            dataKey === 'points' ? 'Points' : 'Climbs',
          ]}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke={color}
          strokeWidth={2}
          fill={`url(#gradient-${dataKey})`}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
