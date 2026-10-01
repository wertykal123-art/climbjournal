import { useMemo } from 'react'
import { GradeDistribution } from '@/types/models'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts'
import { getGradeColorHex, CHART_GRID_COLOR, CHART_TICK_COLOR } from '@/utils/colors'
import ChartEmpty from './ChartEmpty'
import { useGradingSystem } from '@/hooks/useGradingSystem'
import { frenchToUIAA } from '@/utils/grades'

interface GradePyramidProps {
  data: GradeDistribution[]
  height?: number
}

export default function GradePyramid({ data, height = 300 }: GradePyramidProps) {
  const { getEffectiveSystem } = useGradingSystem()
  const effectiveSystem = getEffectiveSystem(null)

  // Convert grades based on user preference and reverse to show hardest at top
  const pyramidData = useMemo(() => {
    return [...data].reverse().map((entry) => ({
      ...entry,
      displayGrade: effectiveSystem === 'UIAA' ? frenchToUIAA(entry.grade) : entry.grade,
    }))
  }, [data, effectiveSystem])

  if (data.length === 0) {
    return <ChartEmpty height={height} message="No sends logged yet" />
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={pyramidData}
        layout="vertical"
        margin={{ top: 4, right: 12, left: 0, bottom: 4 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={CHART_GRID_COLOR} horizontal={false} />
        <XAxis
          type="number"
          allowDecimals={false}
          tick={{ fontSize: 11, fill: CHART_TICK_COLOR }}
          tickLine={false}
          axisLine={{ stroke: CHART_GRID_COLOR }}
        />
        <YAxis
          type="category"
          dataKey="displayGrade"
          tick={{ fontSize: 12, fontWeight: 600, fill: CHART_TICK_COLOR }}
          tickLine={false}
          axisLine={false}
          width={effectiveSystem === 'UIAA' ? 48 : 36}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: `1px solid ${CHART_GRID_COLOR}`,
            borderRadius: '8px',
          }}
          formatter={(value: number, name: string) => [
            `${value} ${name === 'count' ? 'sends' : 'points'}`,
            name === 'count' ? 'Sends' : 'Points',
          ]}
        />
        <Bar dataKey="count" name="count" radius={[0, 4, 4, 0]}>
          {pyramidData.map((entry) => (
            <Cell key={entry.grade} fill={getGradeColorHex(entry.grade)} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}
