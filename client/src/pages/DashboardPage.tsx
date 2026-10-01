import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'
import { useOverviewStats, useTimelineStats } from '@/hooks/useStats'
import { useClimbs } from '@/hooks/useClimbs'
import OverviewCards from '@/components/stats/OverviewCards'
import TimelineChart from '@/components/stats/TimelineChart'
import ClimbCard from '@/components/climbs/ClimbCard'
import LogClimbModal from '@/components/climbs/LogClimbModal'
import { useSession } from '@/context/SessionContext'
import { useElapsed } from '@/hooks/useElapsed'
import QuickAddFAB from '@/components/climbs/QuickAddFAB'
import Button, { LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageSpinner, InlineSpinner } from '@/components/ui/Spinner'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import PageHeader from '@/components/ui/PageHeader'
import { ArrowRight, Plus, BookOpen, Play, Timer } from 'lucide-react'
import { formatPoints } from '@/utils/formatters'

export default function DashboardPage() {
  const { user } = useAuth()
  const { stats, isLoading: statsLoading, error: statsError, refetch: refetchStats } = useOverviewStats()
  const { data: timelineData, isLoading: timelineLoading, error: timelineError, refetch: refetchTimeline } = useTimelineStats({ period: 'year', groupBy: 'month' })
  const { climbs, isInitialLoading: climbsLoading, error: climbsError, refetch: refetchClimbs } = useClimbs({ limit: 5 })
  const { session, summary } = useSession()
  const elapsed = useElapsed(session?.startedAt)
  const [logFor, setLogFor] = useState<{ routeId?: string } | null>(null)

  const handleLogged = () => {
    refetchStats()
    refetchTimeline()
    refetchClimbs()
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
          <Button variant="success" onClick={() => setLogFor({})} className="hidden sm:inline-flex">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Log climb
          </Button>
        }
      />

      <Card className={session ? 'border-send/40 bg-send-light' : ''}>
        <CardBody className="!p-4 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className={`p-2.5 rounded-lg shrink-0 self-start sm:self-center ${session ? 'bg-send text-white' : 'bg-carabiner-light text-carabiner'}`}>
            <Timer className="w-5 h-5" aria-hidden="true" />
          </div>
          <div className="min-w-0 flex-1">
            {session ? (
              <>
                <p className="font-semibold text-rock-900 truncate">Session at {session.location.name}</p>
                <p className="text-sm text-rock-600">
                  {elapsed} · {summary.climbCount} {summary.climbCount === 1 ? 'climb' : 'climbs'} · +{formatPoints(summary.points)} pts
                </p>
              </>
            ) : (
              <>
                <p className="font-semibold text-rock-900">Climbing today?</p>
                <p className="text-sm text-rock-600">Start a session to log climbs in two taps and get a recap at the end.</p>
              </>
            )}
          </div>
          <LinkButton to="/session" variant={session ? 'success' : 'primary'} className="shrink-0">
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            {session ? 'Resume session' : 'Start session'}
          </LinkButton>
        </CardBody>
      </Card>

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
                  <ClimbCard key={climb.id} climb={climb} onLogAgain={(c) => setLogFor({ routeId: c.routeId })} />
                ))}
              </div>
            ) : (
              <EmptyState
                compact
                icon={BookOpen}
                title="No climbs yet"
                message="Log your first climb to start tracking progress."
                action={
                  <Button size="sm" variant="success" onClick={() => setLogFor({})}>
                    <Plus className="w-4 h-4" aria-hidden="true" />
                    Log your first climb
                  </Button>
                }
              />
            )}
          </CardBody>
        </Card>
      </div>

      <QuickAddFAB onClick={() => setLogFor({})} />

      <LogClimbModal
        isOpen={!!logFor}
        onClose={() => setLogFor(null)}
        defaultRouteId={logFor?.routeId}
        onLogged={handleLogged}
      />
    </div>
  )
}
