import { useState } from 'react'
import { useOverviewStats, useTimelineStats, useGradeDistribution, useClimbTypeDistribution, usePyramidData } from '@/hooks/useStats'
import OverviewCards from '@/components/stats/OverviewCards'
import TimelineChart from '@/components/stats/TimelineChart'
import GradePyramid from '@/components/stats/GradePyramid'
import ClimbTypeChart from '@/components/stats/ClimbTypeChart'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import Select from '@/components/ui/Select'

export default function StatsPage() {
  const [timelinePeriod, setTimelinePeriod] = useState<'week' | 'month' | 'year' | 'all'>('year')
  const [timelineGroup, setTimelineGroup] = useState<'day' | 'week' | 'month'>('month')

  const { stats, isLoading: statsLoading } = useOverviewStats()
  const { data: timelineData, isLoading: timelineLoading } = useTimelineStats({
    period: timelinePeriod,
    groupBy: timelineGroup,
  })
  const { data: gradeData, isLoading: gradeLoading } = useGradeDistribution()
  const { data: typeData, isLoading: typeLoading } = useClimbTypeDistribution()
  const { data: pyramidData, isLoading: pyramidLoading } = usePyramidData()

  if (statsLoading) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rock-900">Statistics</h1>
        <p className="text-rock-600">Analyze your climbing performance</p>
      </div>

      {stats && <OverviewCards stats={stats} />}

      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h3 className="font-semibold text-rock-900">Activity Timeline</h3>
          <div className="flex gap-2">
            <Select
              value={timelinePeriod}
              onChange={(e) => setTimelinePeriod(e.target.value as typeof timelinePeriod)}
              options={[
                { value: 'week', label: 'Last Week' },
                { value: 'month', label: 'Last Month' },
                { value: 'year', label: 'Last Year' },
                { value: 'all', label: 'All Time' },
              ]}
              className="w-32"
            />
            <Select
              value={timelineGroup}
              onChange={(e) => setTimelineGroup(e.target.value as typeof timelineGroup)}
              options={[
                { value: 'day', label: 'By Day' },
                { value: 'week', label: 'By Week' },
                { value: 'month', label: 'By Month' },
              ]}
              className="w-32"
            />
          </div>
        </CardHeader>
        <CardBody>
          {timelineLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <PageSpinner />
            </div>
          ) : (
            <TimelineChart data={timelineData} dataKey="points" />
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-rock-900">Grade Pyramid</h3>
          </CardHeader>
          <CardBody>
            {pyramidLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <PageSpinner />
              </div>
            ) : (
              <GradePyramid data={pyramidData} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h3 className="font-semibold text-rock-900">Climb Types</h3>
          </CardHeader>
          <CardBody>
            {typeLoading ? (
              <div className="h-[300px] flex items-center justify-center">
                <PageSpinner />
              </div>
            ) : (
              <ClimbTypeChart data={typeData} />
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <h3 className="font-semibold text-rock-900">Grade Distribution</h3>
        </CardHeader>
        <CardBody>
          {gradeLoading ? (
            <div className="h-[300px] flex items-center justify-center">
              <PageSpinner />
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
              {gradeData.map((item) => (
                <div
                  key={item.grade}
                  className="text-center p-3 bg-rock-50 rounded-lg"
                >
                  <div className="text-lg font-bold text-rock-900">{item.count}</div>
                  <div className="text-xs text-rock-500">{item.grade}</div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
