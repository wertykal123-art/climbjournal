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
import { getGradeColorHex } from '@/utils/colors'
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
    return (
      <div className="flex items-center justify-center h-[300px] text-rock-500">
        No data to display
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart
        data={pyramidData}
        layout="vertical"
        margin={{ top: 10, right: 20, left: 40, bottom: 10 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis type="number" tick={{ fontSize: 12 }} stroke="#94a3b8" />
        <YAxis
          type="category"
          dataKey="displayGrade"
          tick={{ fontSize: 12, fontWeight: 600 }}
          stroke="#94a3b8"
        />
        <Tooltip
          contentStyle={{
            backgroundColor: 'white',
            border: '1px solid #e2e8f0',
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
