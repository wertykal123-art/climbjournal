import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Play,
  Square,
  Search,
  Plus,
  Building2,
  Mountain,
  Timer,
  Target,
  TrendingUp,
  Award,
  Trophy,
  CheckCircle,
  MapPin,
} from 'lucide-react'
import { useSession, ClimbSession, summarizeSession } from '@/context/SessionContext'
import { useLocations } from '@/hooks/useLocations'
import { useLocationRoutes } from '@/hooks/useRoutes'
import { useElapsed, formatElapsed } from '@/hooks/useElapsed'
import { useGradingSystem } from '@/hooks/useGradingSystem'
import { climbsApi } from '@/api/climbs.api'
import { routesApi } from '@/api/routes.api'
import { getErrorMessage } from '@/api/client'
import { Climb, ClimbType, Location, Route } from '@/types/models'
import { CreateRouteRequest } from '@/types/api'
import PageHeader from '@/components/ui/PageHeader'
import Button, { LinkButton } from '@/components/ui/Button'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import StatTile from '@/components/ui/StatTile'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Modal from '@/components/ui/Modal'
import Input from '@/components/ui/Input'
import { PageSpinner, InlineSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import GradeBadge from '@/components/routes/GradeBadge'
import RouteForm from '@/components/routes/RouteForm'
import ClimbCard from '@/components/climbs/ClimbCard'
import ClimbTypeBadge from '@/components/climbs/ClimbTypeBadge'
import LogClimbModal from '@/components/climbs/LogClimbModal'
import QuickLogSheet from '@/components/session/QuickLogSheet'
import { celebrate } from '@/components/celebration/Celebration'
import { compareGrades, frenchToUIAA } from '@/utils/grades'
import { formatDateISO, formatPoints } from '@/utils/formatters'
import { getLastLocationId, setLastClimbType, setLastLocationId } from '@/utils/prefs'
import { getClimbTypeLabel } from '@/utils/colors'

export default function SessionPage() {
  const { session } = useSession()
  const [recap, setRecap] = useState<{ session: ClimbSession; endedAt: string } | null>(null)

  if (recap) return <SessionRecap recap={recap} onDone={() => setRecap(null)} />
  if (!session) return <StartSession />
  return <ActiveSession session={session} onEnded={(s) => s.climbs.length > 0 && setRecap({ session: s, endedAt: new Date().toISOString() })} />
}

function StartSession() {
  const { locations, isInitialLoading, error, refetch } = useLocations()
  const { startSession } = useSession()

  const sorted = useMemo(() => {
    const last = getLastLocationId()
    return [...locations].sort((a, b) => Number(b.id === last) - Number(a.id === last) || a.name.localeCompare(b.name))
  }, [locations])

  if (isInitialLoading) return <PageSpinner />

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <PageHeader
        title="Start a session"
        subtitle="Pick where you're climbing. Log each climb with two taps and get a recap at the end."
      />

      {error && locations.length === 0 ? (
        <Card><ErrorState onRetry={refetch} /></Card>
      ) : locations.length === 0 ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="Add a location first"
            message="Sessions happen at a gym or crag. Create one to get started."
            action={<LinkButton to="/locations">Go to locations</LinkButton>}
          />
        </Card>
      ) : (
        <ul className="space-y-2">
          {sorted.map((location) => {
            const Icon = location.type === 'GYM' ? Building2 : Mountain
            return (
              <li key={location.id}>
                <button
                  type="button"
                  onClick={() => startSession(location)}
                  className="w-full flex items-center gap-3 p-4 bg-white rounded-xl border border-rock-200 shadow-sm hover:border-carabiner hover:shadow-md transition text-left"
                >
                  <span className={`p-2.5 rounded-lg shrink-0 ${location.type === 'GYM' ? 'bg-carabiner-light text-carabiner' : 'bg-send-light text-send'}`}>
                    <Icon className="w-5 h-5" aria-hidden="true" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-semibold text-rock-900 truncate">{location.name}</span>
                    <span className="block text-sm text-rock-500">
                      {location.routeCount ?? 0} {location.routeCount === 1 ? 'route' : 'routes'}
                    </span>
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-send shrink-0">
                    <Play className="w-4 h-4 fill-current" aria-hidden="true" />
                    Start
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ActiveSession({ session, onEnded }: { session: ClimbSession; onEnded: (s: ClimbSession) => void }) {
  const { summary, endSession, recordClimb, removeClimb } = useSession()
  const { routes, isLoading, error, refetch } = useLocationRoutes(session.location.id)
  const { getGradeBadgeSystem, getEffectiveSystem } = useGradingSystem()
  const elapsed = useElapsed(session.startedAt)
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [quickRoute, setQuickRoute] = useState<Route | null>(null)
  const [detailsFor, setDetailsFor] = useState<{ routeId: string; climbType: ClimbType } | null>(null)
  const [showNewRoute, setShowNewRoute] = useState(false)
  const [extraRoutes, setExtraRoutes] = useState<Route[]>([])
  const [confirmEnd, setConfirmEnd] = useState(false)
  const [undoClimb, setUndoClimb] = useState<Climb | null>(null)

  const location = session.location as Location
  const system = getEffectiveSystem(location)

  const sessionCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const c of session.climbs) counts[c.routeId] = (counts[c.routeId] || 0) + 1
    return counts
  }, [session.climbs])

  const visibleRoutes = useMemo(() => {
    const known = new Set(routes.map((r) => r.id))
    const all = [...extraRoutes.filter((r) => !known.has(r.id)), ...routes].filter((r) => r.isActive !== false)
    const q = query.trim().toLowerCase()
    const filtered = q
      ? all.filter(
          (r) =>
            r.name.toLowerCase().includes(q) ||
            (r.visualId ?? '').toLowerCase().includes(q) ||
            r.difficultyFrench.toLowerCase().startsWith(q) ||
            frenchToUIAA(r.difficultyFrench).toLowerCase().startsWith(q)
        )
      : all
    return filtered.sort((a, b) => compareGrades(a.difficultyFrench, b.difficultyFrench) || a.name.localeCompare(b.name))
  }, [routes, extraRoutes, query])

  const handleQuickLog = async (route: Route, climbType: ClimbType, attempts: number) => {
    try {
      const climb = await climbsApi.create({
        routeId: route.id,
        date: formatDateISO(new Date()),
        climbType,
        attemptCount: attempts,
      })
      setLastClimbType(climbType)
      setLastLocationId(route.locationId)
      recordClimb({ ...climb, route: climb.route ?? route })
      setQuickRoute(null)
      showToast('success', `${route.name}: +${formatPoints(climb.points)} pts`)
      celebrate(climb.achievement)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to log climb'))
    }
  }

  const handleCreateRoute = async (data: CreateRouteRequest) => {
    try {
      const created = await routesApi.create({ ...data, locationId: session.location.id })
      setExtraRoutes((prev) => [created, ...prev])
      setShowNewRoute(false)
      showToast('success', `Route "${created.name}" added`)
      setQuickRoute(created)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to create route'))
    }
  }

  const handleUndo = async () => {
    if (!undoClimb) return
    try {
      await climbsApi.delete(undoClimb.id)
      removeClimb(undoClimb.id)
      setUndoClimb(null)
      showToast('info', 'Climb removed')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to remove climb'))
    }
  }

  const finish = () => {
    const ended = endSession()
    setConfirmEnd(false)
    if (ended && ended.climbs.length > 0) {
      onEnded(ended)
    } else {
      showToast('info', 'Session ended — no climbs were logged')
      navigate('/dashboard')
    }
  }

  const startedLongAgo = Date.now() - new Date(session.startedAt).getTime() > 12 * 60 * 60 * 1000
  const locationAsList = [location]

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title={session.location.name}
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span className="relative flex w-2 h-2" aria-hidden="true">
              <span className="absolute inline-flex h-full w-full rounded-full bg-send opacity-75 animate-ping" />
              <span className="relative inline-flex w-2 h-2 rounded-full bg-send" />
            </span>
            Session in progress · {elapsed}
          </span>
        }
        actions={
          <Button variant="danger" onClick={() => setConfirmEnd(true)}>
            <Square className="w-4 h-4 fill-current" aria-hidden="true" />
            End session
          </Button>
        }
      />

      {startedLongAgo && (
        <div className="p-3 rounded-lg bg-pump-light border border-pump/30 text-sm text-rock-700">
          This session started more than 12 hours ago. Forgot to end it?{' '}
          <button type="button" className="font-medium text-pump-dark underline" onClick={() => setConfirmEnd(true)}>
            End it now
          </button>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Climbs" value={summary.climbCount} icon={Target} />
        <StatTile label="Sends" value={summary.sendCount} icon={CheckCircle} iconClassName="bg-send-light text-send" />
        <StatTile label="Points" value={formatPoints(summary.points)} icon={TrendingUp} iconClassName="bg-send-light text-send" />
        <StatTile
          label="Hardest send"
          value={summary.hardestSend ? (system === 'UIAA' ? frenchToUIAA(summary.hardestSend) : summary.hardestSend) : '—'}
          icon={Award}
          iconClassName="bg-yellow-50 text-yellow-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 sm:gap-6 items-start">
        <Card className="lg:col-span-3">
          <CardHeader className="flex items-center justify-between gap-2">
            <CardTitle>Tap a route to log it</CardTitle>
            <Button variant="ghost" size="sm" className="shrink-0 whitespace-nowrap" onClick={() => setShowNewRoute(true)}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              New route
            </Button>
          </CardHeader>
          <div className="p-3 sm:p-4 border-b border-rock-200">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rock-400 pointer-events-none" aria-hidden="true" />
              <Input
                type="search"
                aria-label="Search routes at this location"
                placeholder="Search name, grade, or tag…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          {error ? (
            <ErrorState compact onRetry={refetch} />
          ) : isLoading && routes.length === 0 ? (
            <InlineSpinner />
          ) : visibleRoutes.length === 0 ? (
            <EmptyState
              compact
              title={query ? 'No routes match' : 'No routes here yet'}
              message={query ? 'Try another search, or add it as a new route.' : 'Add the routes you climb as you go.'}
              action={
                <Button size="sm" onClick={() => setShowNewRoute(true)}>
                  <Plus className="w-4 h-4" aria-hidden="true" />
                  New route
                </Button>
              }
            />
          ) : (
            <ul className="divide-y divide-rock-100 max-h-[60vh] overflow-y-auto overscroll-contain">
              {visibleRoutes.map((route) => (
                <li key={route.id}>
                  <button
                    type="button"
                    onClick={() => setQuickRoute(route)}
                    className="w-full flex items-center gap-3 px-3 sm:px-4 py-3 text-left hover:bg-rock-50 active:bg-rock-100 transition-colors"
                  >
                    <GradeBadge grade={route.difficultyFrench} system={getGradeBadgeSystem(location)} />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5 font-medium text-rock-900">
                        <span className="truncate">{route.name}</span>
                        {route.color && (
                          <span className="w-3 h-3 rounded-full border border-rock-300 shrink-0" style={{ backgroundColor: route.color }} aria-hidden="true" />
                        )}
                      </span>
                      {route.visualId && <span className="block text-xs text-rock-500 truncate">{route.visualId}</span>}
                    </span>
                    {sessionCounts[route.id] ? (
                      <span className="text-xs font-semibold text-send bg-send-light px-2 py-0.5 rounded-full shrink-0">
                        ×{sessionCounts[route.id]}
                      </span>
                    ) : null}
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-carabiner shrink-0">
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      Log
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <section className="lg:col-span-2 space-y-3" aria-labelledby="session-climbs">
          <h2 id="session-climbs" className="text-lg font-semibold text-rock-900">
            This session <span className="text-rock-400 font-normal">({session.climbs.length})</span>
          </h2>
          {session.climbs.length === 0 ? (
            <Card>
              <EmptyState compact icon={Timer} title="Nothing logged yet" message="Your climbs from this session will appear here." />
            </Card>
          ) : (
            <div className="space-y-3">
              {session.climbs.map((climb) => (
                <ClimbCard key={climb.id} climb={climb} onDelete={setUndoClimb} />
              ))}
            </div>
          )}
        </section>
      </div>

      <QuickLogSheet
        route={quickRoute}
        location={location}
        onClose={() => setQuickRoute(null)}
        onLog={handleQuickLog}
        onMoreDetails={(route, climbType) => {
          setQuickRoute(null)
          setDetailsFor({ routeId: route.id, climbType })
        }}
      />

      <LogClimbModal
        isOpen={!!detailsFor}
        onClose={() => setDetailsFor(null)}
        defaultRouteId={detailsFor?.routeId}
        defaultClimbType={detailsFor?.climbType}
      />

      <Modal isOpen={showNewRoute} onClose={() => setShowNewRoute(false)} title="New route" size="lg">
        <RouteForm
          locations={locationAsList}
          defaultLocationId={location.id}
          initialName={query.trim()}
          submitLabel="Add & log"
          onSubmit={handleCreateRoute}
          onCancel={() => setShowNewRoute(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!undoClimb}
        onClose={() => setUndoClimb(null)}
        onConfirm={handleUndo}
        title="Remove this climb?"
        message={`Your climb on ${undoClimb?.route?.name ?? 'this route'} will be deleted.`}
        confirmLabel="Remove"
      />

      <ConfirmDialog
        isOpen={confirmEnd}
        onClose={() => setConfirmEnd(false)}
        onConfirm={finish}
        title="End session?"
        message={
          session.climbs.length > 0
            ? `You logged ${session.climbs.length} ${session.climbs.length === 1 ? 'climb' : 'climbs'}. Your climbs are already saved; ending shows your recap.`
            : "You haven't logged anything yet. Ending will just close the session."
        }
        confirmLabel="End session"
        variant="primary"
      />
    </div>
  )
}

function SessionRecap({ recap, onDone }: { recap: { session: ClimbSession; endedAt: string }; onDone: () => void }) {
  const navigate = useNavigate()
  const { getEffectiveSystem, getGradeBadgeSystem } = useGradingSystem()
  const { session } = recap
  const summary = summarizeSession(session)
  const location = session.location as Location
  const duration = formatElapsed(new Date(recap.endedAt).getTime() - new Date(session.startedAt).getTime())
  const display = (g: string) => (getEffectiveSystem(location) === 'UIAA' ? frenchToUIAA(g) : g)

  const styles = session.climbs.reduce<Record<string, number>>((acc, c) => {
    acc[c.climbType] = (acc[c.climbType] || 0) + 1
    return acc
  }, {})

  const ordered = [...session.climbs].sort(
    (a, b) => compareGrades(b.route?.difficultyFrench ?? '', a.route?.difficultyFrench ?? '')
  )

  return (
    <div className="space-y-4 sm:space-y-6 max-w-2xl mx-auto">
      <div className="text-center pt-2">
        <div className="mx-auto w-14 h-14 rounded-full bg-send-light flex items-center justify-center mb-3">
          <CheckCircle className="w-8 h-8 text-send" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-bold text-rock-900">Session complete</h1>
        <p className="text-rock-600">
          {session.location.name} · {duration}
        </p>
      </div>

      {summary.newMaxGrade && (
        <div className="flex items-center gap-3 p-4 rounded-xl bg-yellow-50 border border-yellow-200">
          <Trophy className="w-8 h-8 text-yellow-500 shrink-0" aria-hidden="true" />
          <div>
            <p className="font-semibold text-rock-900">New personal best: {display(summary.newMaxGrade)}</p>
            <p className="text-sm text-rock-600">Your hardest send ever, set this session.</p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <StatTile label="Climbs" value={summary.climbCount} icon={Target} />
        <StatTile label="Sends" value={summary.sendCount} icon={CheckCircle} iconClassName="bg-send-light text-send" />
        <StatTile label="Points" value={`+${formatPoints(summary.points)}`} icon={TrendingUp} iconClassName="bg-send-light text-send" />
        <StatTile label="Hardest send" value={summary.hardestSend ? display(summary.hardestSend) : '—'} icon={Award} iconClassName="bg-yellow-50 text-yellow-600" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Styles</CardTitle>
        </CardHeader>
        <CardBody className="flex flex-wrap gap-2">
          {Object.entries(styles).map(([type, count]) => (
            <span key={type} className="inline-flex items-center gap-1.5">
              <ClimbTypeBadge type={type as ClimbType} size="sm" />
              <span className="text-sm text-rock-600">×{count}</span>
              <span className="sr-only">{getClimbTypeLabel(type as ClimbType)}</span>
            </span>
          ))}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Climbs</CardTitle>
        </CardHeader>
        <ul className="divide-y divide-rock-100">
          {ordered.map((c) => (
            <li key={c.id} className="flex items-center gap-3 px-4 sm:px-6 py-3">
              {c.route && <GradeBadge grade={c.route.difficultyFrench} size="sm" system={getGradeBadgeSystem(location)} />}
              <span className="min-w-0 flex-1 truncate text-rock-900">{c.route?.name}</span>
              <ClimbTypeBadge type={c.climbType} size="sm" />
              <span className="text-sm font-semibold text-send tabular-nums shrink-0">+{formatPoints(c.points)}</span>
            </li>
          ))}
        </ul>
      </Card>

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-center">
        <Button variant="secondary" onClick={() => navigate('/journal')}>
          View journal
        </Button>
        <Button
          onClick={() => {
            onDone()
            navigate('/dashboard')
          }}
        >
          Done
        </Button>
      </div>
    </div>
  )
}
