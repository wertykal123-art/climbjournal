import { ClimbTypeDistribution } from '@/types/models'
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts'
import { getClimbTypeLabel } from '@/utils/colors'

interface ClimbTypeChartProps {
  data: ClimbTypeDistribution[]
  height?: number
}

const COLORS = {
  OS: '#EAB308',      // gold
  FLASH: '#9CA3AF',   // silver
  RP: '#B45309',      // bronze
  PP: '#3B82F6',      // blue
  TOPROPE: '#6B7280', // gray
  AUTOBELAY: '#9CA3AF', // light gray
  TRY: '#D1D5DB',     // very light gray
}

export default function ClimbTypeChart({ data, height = 300 }: ClimbTypeChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-rock-500">
        No data to display
      </div>
    )
  }

  const chartData = data.map((d) => ({
    ...d,
    name: getClimbTypeLabel(d.type),
    color: COLORS[d.type] || '#6B7280',
  }))

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="count"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          innerRadius={40}
          paddingAngle={2}
          label={({ name, percentage }) => `${name} (${percentage}%)`}
          labelLine={false}
        >
          {chartData.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => [`${value} climbs`, name]}
        />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  )
}
