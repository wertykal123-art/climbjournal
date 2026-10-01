import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useOverviewStats, useTimelineStats } from '@/hooks/useStats'
import { useClimbs } from '@/hooks/useClimbs'
import { useRoutes } from '@/hooks/useRoutes'
import OverviewCards from '@/components/stats/OverviewCards'
import TimelineChart from '@/components/stats/TimelineChart'
import ClimbCard from '@/components/climbs/ClimbCard'
import ClimbForm from '@/components/climbs/ClimbForm'
import QuickAddFAB from '@/components/climbs/QuickAddFAB'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageSpinner, InlineSpinner } from '@/components/ui/Spinner'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import { showToast } from '@/components/ui/Toast'
import { getErrorMessage } from '@/api/client'
import { ArrowRight, Plus, BookOpen } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useOverviewStats()
  const { data: timelineData, isLoading: timelineLoading, error: timelineError, refetch: refetchTimeline } = useTimelineStats({ period: 'year', groupBy: 'month' })
  const { climbs, isInitialLoading: climbsLoading, error: climbsError, createClimb, refetch: refetchClimbs } = useClimbs({ limit: 5 })
  const { routes, isInitialLoading: routesLoading } = useRoutes()
  const [showClimbModal, setShowClimbModal] = useState(false)

  const activeRoutes = useMemo(() => routes.filter((r) => r.isActive !== false), [routes])

  const handleCreateClimb = async (data: Parameters<typeof createClimb>[0]) => {
    try {
      await createClimb(data)
      showToast('success', 'Climb logged!')
      setShowClimbModal(false)
      refetchStats()
      refetchTimeline()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to log climb'))
    }
  }

  if (statsLoading && !stats && !statsError) {
    return <PageSpinner />
  }

  const firstName = user?.displayName?.split(' ')[0]

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={`Welcome back${firstName ? `, ${firstName}` : ''}!`}
        subtitle="Here's your climbing progress at a glance."
        actions={
          <Button variant="success" onClick={() => setShowClimbModal(true)} className="hidden sm:inline-flex">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Log climb
          </Button>
        }
      />

      {statsError && !stats ? (
        <Card><ErrorState onRetry={refetchStats} /></Card>
      ) : (
        stats && <OverviewCards stats={stats} />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex items-center justify-between gap-2">
            <CardTitle>Points this year</CardTitle>
            <Link to="/stats" className="text-sm text-carabiner hover:underline flex items-center gap-1 rounded">
              All stats <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardBody className="!px-2 sm:!px-4">
            {timelineError ? (
              <ErrorState compact onRetry={refetchTimeline} />
            ) : timelineLoading && timelineData.length === 0 ? (
              <InlineSpinner height={280} />
            ) : (
              <TimelineChart data={timelineData} dataKey="points" height={280} />
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader className="flex items-center justify-between gap-2">
            <CardTitle>Recent Climbs</CardTitle>
            <Link to="/journal" className="text-sm text-carabiner hover:underline flex items-center gap-1 rounded">
              View all <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </CardHeader>
          <CardBody className="!p-3 sm:!p-4">
            {climbsError ? (
              <ErrorState compact onRetry={refetchClimbs} />
            ) : climbsLoading ? (
              <InlineSpinner />
            ) : climbs.length > 0 ? (
              <div className="space-y-3">
                {climbs.slice(0, 5).map((climb) => (
                  <ClimbCard key={climb.id} climb={climb} />
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={BookOpen}
                title="No climbs yet"
                message="Log your first climb to start tracking progress."
                action={
                  <Button size="sm" variant="success" onClick={() => setShowClimbModal(true)}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Log your first climb
                  </Button>
                }
              />
            )}
          </CardBody>
        </Card>
      </div>

      <QuickAddFAB onClick={() => setShowClimbModal(true)} />

      <Modal
        isOpen={showClimbModal}
        onClose={() => setShowClimbModal(false)}
        title="Log Climb"
        size="lg"
      >
        <ClimbForm
          routes={activeRoutes}
          routesLoading={routesLoading}
          onSubmit={handleCreateClimb}
          onCancel={() => setShowClimbModal(false)}
        />
      </Modal>
    </div>
  )
}
