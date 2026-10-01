import { useState } from 'react'
import { useOverviewStats, useTimelineStats, useGradeDistribution, useClimbTypeDistribution, usePyramidData } from '@/hooks/useStats'
import OverviewCards from '@/components/stats/OverviewCards'
import TimelineChart from '@/components/stats/TimelineChart'
import GradePyramid from '@/components/stats/GradePyramid'
import ClimbTypeChart from '@/components/stats/ClimbTypeChart'
import ChartEmpty from '@/components/stats/ChartEmpty'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageSpinner, InlineSpinner } from '@/components/ui/Spinner'
import { ErrorState } from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import Select from '@/components/ui/Select'
import SegmentedControl from '@/components/ui/SegmentedControl'
import GradeBadge from '@/components/routes/GradeBadge'
import { useGradingSystem } from '@/hooks/useGradingSystem'

const CHART_HEIGHT = 280

export default function StatsPage() {
  const [timelinePeriod, setTimelinePeriod] = useState<'week' | 'month' | 'year' | 'all'>('year')
  const [timelineGroup, setTimelineGroup] = useState<'day' | 'week' | 'month'>('month')
  const [timelineMetric, setTimelineMetric] = useState<'points' | 'climbs'>('points')
  const { getGradeBadgeSystem } = useGradingSystem()

  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useOverviewStats()
  const { data: timelineData, isLoading: timelineLoading, error: timelineError, refetch: refetchTimeline } = useTimelineStats({
    period: timelinePeriod,
    groupBy: timelineGroup,
  })
  const { data: gradeData, isLoading: gradeLoading, error: gradeError, refetch: refetchGrades } = useGradeDistribution()
  const { data: typeData, isLoading: typeLoading, error: typeError, refetch: refetchTypes } = useClimbTypeDistribution()
  const { data: pyramidData, isLoading: pyramidLoading, error: pyramidError, refetch: refetchPyramid } = usePyramidData()

  if (statsLoading && !stats) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Statistics" subtitle="Analyze your climbing performance" />

      {statsError && !stats ? (
        <Card><ErrorState onRetry={refetchStats} /></Card>
      ) : (
        stats && <OverviewCards stats={stats} />
      )}

      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle>Activity Timeline</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <SegmentedControl
              label="Timeline metric"
              value={timelineMetric}
              onChange={setTimelineMetric}
              options={[
                { value: 'points', label: 'Points' },
                { value: 'climbs', label: 'Climbs' },
              ]}
            />
            <div className="flex gap-2">
              <Select
                aria-label="Time period"
                value={timelinePeriod}
                onChange={(e) => setTimelinePeriod(e.target.value as typeof timelinePeriod)}
                options={[
                  { value: 'week', label: 'Last week' },
                  { value: 'month', label: 'Last month' },
                  { value: 'year', label: 'Last year' },
                  { value: 'all', label: 'All time' },
                ]}
                className="!w-auto !py-1.5 text-sm"
              />
              <Select
                aria-label="Group by"
                value={timelineGroup}
                onChange={(e) => setTimelineGroup(e.target.value as typeof timelineGroup)}
                options={[
                  { value: 'day', label: 'By day' },
                  { value: 'week', label: 'By week' },
                  { value: 'month', label: 'By month' },
                ]}
                className="!w-auto !py-1.5 text-sm"
              />
            </div>
          </div>
        </CardHeader>
        <CardBody className="!px-2 sm:!px-4">
          {timelineError ? (
            <ErrorState compact onRetry={refetchTimeline} />
          ) : timelineLoading && timelineData.length === 0 ? (
            <InlineSpinner height={CHART_HEIGHT} />
          ) : (
            <div className={timelineLoading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
              <TimelineChart data={timelineData} dataKey={timelineMetric} height={CHART_HEIGHT} />
            </div>
          )}
        </CardBody>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Grade Pyramid</CardTitle>
          </CardHeader>
          <CardBody className="!px-2 sm:!px-4">
            {pyramidError ? (
              <ErrorState compact onRetry={refetchPyramid} />
            ) : pyramidLoading ? (
              <InlineSpinner height={CHART_HEIGHT} />
            ) : (
              <GradePyramid data={pyramidData} height={CHART_HEIGHT} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Climb Types</CardTitle>
          </CardHeader>
          <CardBody>
            {typeError ? (
              <ErrorState compact onRetry={refetchTypes} />
            ) : typeLoading ? (
              <InlineSpinner height={CHART_HEIGHT} />
            ) : (
              <ClimbTypeChart data={typeData} height={CHART_HEIGHT} />
            )}
          </CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Distribution</CardTitle>
        </CardHeader>
        <CardBody>
          {gradeError ? (
            <ErrorState compact onRetry={refetchGrades} />
          ) : gradeLoading ? (
            <InlineSpinner height={120} />
          ) : gradeData.length === 0 ? (
            <ChartEmpty height={120} message="Log a send to see your grade spread" />
          ) : (
            <div className="grid grid-cols-3 min-[400px]:grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
              {gradeData.map((item) => (
                <div
                  key={item.grade}
                  className="flex flex-col items-center gap-1.5 p-2 sm:p-3 bg-rock-50 rounded-lg"
                >
                  <GradeBadge grade={item.grade} size="sm" system={getGradeBadgeSystem(null)} />
                  <div className="text-lg font-bold text-rock-900 leading-none">{item.count}</div>
                  <div className="text-xs text-rock-500">{item.count === 1 ? 'send' : 'sends'}</div>
                </div>
              ))}
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  )
}
