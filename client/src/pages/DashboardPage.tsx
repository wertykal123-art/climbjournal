import { useState } from 'react'
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
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { ArrowRight } from 'lucide-react'

export default function DashboardPage() {
  const { user } = useAuth()
  const { stats, isLoading: statsLoading, refetch: refetchStats } = useOverviewStats()
  const { data: timelineData, isLoading: timelineLoading } = useTimelineStats({ period: 'year', groupBy: 'month' })
  const { climbs, isLoading: climbsLoading, createClimb, refetch: refetchClimbs } = useClimbs({ limit: 5 })
  const { routes } = useRoutes()
  const [showClimbModal, setShowClimbModal] = useState(false)

  const handleCreateClimb = async (data: Parameters<typeof createClimb>[0]) => {
    try {
      await createClimb(data)
      showToast('success', 'Climb logged successfully!')
      setShowClimbModal(false)
      refetchStats()
      refetchClimbs()
    } catch {
      showToast('error', 'Failed to log climb')
    }
  }

  if (statsLoading) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rock-900">
          Welcome back, {user?.displayName}!
        </h1>
        <p className="text-rock-600">Here's your climbing progress at a glance.</p>
      </div>

      {stats && <OverviewCards stats={stats} />}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <h3 className="font-semibold text-rock-900">Activity Timeline</h3>
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

        <Card>
          <CardHeader className="flex items-center justify-between">
            <h3 className="font-semibold text-rock-900">Recent Climbs</h3>
            <Link
              to="/journal"
              className="text-sm text-carabiner hover:underline flex items-center gap-1"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </CardHeader>
          <CardBody className="p-0">
            {climbsLoading ? (
              <div className="p-6">
                <PageSpinner />
              </div>
            ) : climbs.length > 0 ? (
              <div className="divide-y divide-rock-200">
                {climbs.slice(0, 5).map((climb) => (
                  <div key={climb.id} className="p-4">
                    <ClimbCard climb={climb} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-rock-500">
                <p>No climbs logged yet.</p>
                <button
                  onClick={() => setShowClimbModal(true)}
                  className="mt-2 text-carabiner hover:underline"
                >
                  Log your first climb
                </button>
              </div>
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
          routes={routes.filter((r) => r.isActive !== false)}
          onSubmit={handleCreateClimb}
          onCancel={() => setShowClimbModal(false)}
        />
      </Modal>
    </div>
  )
}
