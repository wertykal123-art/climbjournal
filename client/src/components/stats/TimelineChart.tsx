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

interface TimelineChartProps {
  data: TimelineData[]
  dataKey?: 'climbs' | 'points'
  height?: number
}

export default function TimelineChart({ data, dataKey = 'points', height = 300 }: TimelineChartProps) {
  const color = dataKey === 'points' ? '#38A169' : '#3182CE'

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-rock-500">
        No data to display
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`gradient-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis
          dataKey="date"
          tick={{ fontSize: 12 }}
          stroke="#94a3b8"
        />
        <YAxis tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
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
