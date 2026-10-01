import { ClimbTypeDistribution } from '@/types/models'
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts'
import { getClimbTypeLabel, CLIMB_TYPE_HEX, CHART_GRID_COLOR } from '@/utils/colors'
import ChartEmpty from './ChartEmpty'

interface ClimbTypeChartProps {
  data: ClimbTypeDistribution[]
  height?: number
}

export default function ClimbTypeChart({ data, height = 300 }: ClimbTypeChartProps) {
  if (data.length === 0) {
    return <ChartEmpty height={height} message="No climbs logged yet" />
  }

  const chartData = data.map((d) => ({
    ...d,
    name: getClimbTypeLabel(d.type),
    color: CLIMB_TYPE_HEX[d.type] || '#64748b',
  }))

  // Labels around the pie clip on narrow screens; use a wrapping HTML legend instead.
  const pieHeight = Math.max(160, height - 90)

  return (
    <div>
      <ResponsiveContainer width="100%" height={pieHeight}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="count"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius="90%"
            innerRadius="55%"
            paddingAngle={2}
            isAnimationActive={false}
          >
            {chartData.map((entry) => (
              <Cell key={entry.type} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: `1px solid ${CHART_GRID_COLOR}`,
              borderRadius: '8px',
              fontSize: 13,
            }}
            formatter={(value: number, name: string) => [`${value} climbs`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
      <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5 text-sm">
        {chartData.map((entry) => (
          <li key={entry.type} className="flex items-center gap-1.5 text-rock-700">
            <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: entry.color }} aria-hidden="true" />
            {entry.name}
            <span className="text-rock-400">{entry.percentage}%</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
