import { useEffect, useMemo, useState } from 'react'
import Modal from '@/components/ui/Modal'
import Button, { LinkButton } from '@/components/ui/Button'
import EmptyState from '@/components/ui/EmptyState'
import { MapPin } from 'lucide-react'
import ClimbForm from './ClimbForm'
import RouteForm from '@/components/routes/RouteForm'
import { useRoutes } from '@/hooks/useRoutes'
import { useLocations } from '@/hooks/useLocations'
import { useSession } from '@/context/SessionContext'
import { climbsApi } from '@/api/climbs.api'
import { routesApi } from '@/api/routes.api'
import { getErrorMessage } from '@/api/client'
import { showToast } from '@/components/ui/Toast'
import { celebrate } from '@/components/celebration/Celebration'
import { Climb, ClimbType, Route } from '@/types/models'
import { CreateClimbRequest, CreateRouteRequest } from '@/types/api'
import { getLastLocationId, setLastClimbType, setLastLocationId } from '@/utils/prefs'
import { formatPoints } from '@/utils/formatters'

interface LogClimbModalProps {
  isOpen: boolean
  onClose: () => void
  /** Preselect a route (e.g. "Log again" or logging from a route page). */
  defaultRouteId?: string
  defaultClimbType?: ClimbType
  /** Called after a climb is saved, with the created climb. */
  onLogged?: (climb: Climb) => void
}

/**
 * One place to log a climb: searchable route picker (recent routes and your
 * current gym first), "New route" without leaving the dialog, remembered
 * style/gym, session tracking and personal-best celebrations.
 */
export default function LogClimbModal({ isOpen, onClose, ...rest }: LogClimbModalProps) {
  const [mode, setMode] = useState<'log' | 'route'>('log')

  useEffect(() => {
    if (isOpen) setMode('log')
  }, [isOpen])

  return (
    <Modal
      isOpen={isOpen}
      onClose={mode === 'route' ? () => setMode('log') : onClose}
      title={mode === 'route' ? 'New route' : 'Log climb'}
      size="lg"
    >
      {/* Content mounts on open, so data is fresh every time. */}
      <LogClimbContent onClose={onClose} mode={mode} setMode={setMode} {...rest} />
    </Modal>
  )
}

function LogClimbContent({
  onClose,
  defaultRouteId,
  defaultClimbType,
  onLogged,
  mode,
  setMode,
}: Omit<LogClimbModalProps, 'isOpen'> & { mode: 'log' | 'route'; setMode: (m: 'log' | 'route') => void }) {
  const { routes, isInitialLoading: routesLoading } = useRoutes()
  const { locations, isInitialLoading: locationsLoading } = useLocations()
  const { session, recordClimb } = useSession()
  const [createdRoutes, setCreatedRoutes] = useState<Route[]>([])
  const [selectedDefault, setSelectedDefault] = useState(defaultRouteId)
  const [nameHint, setNameHint] = useState('')
  const [recentRouteIds, setRecentRouteIds] = useState<string[]>([])

  useEffect(() => {
    let cancelled = false
    climbsApi
      .getAll({ limit: 30 })
      .then((res) => {
        if (cancelled) return
        const ids: string[] = []
        for (const c of res.data) if (!ids.includes(c.routeId)) ids.push(c.routeId)
        setRecentRouteIds(ids)
      })
      .catch(() => {
        // Recents are a nicety; the full list still works.
      })
    return () => {
      cancelled = true
    }
  }, [])

  const activeRoutes = useMemo(() => {
    const known = new Set(routes.map((r) => r.id))
    return [...createdRoutes.filter((r) => !known.has(r.id)), ...routes].filter((r) => r.isActive !== false)
  }, [routes, createdRoutes])

  const preferredLocationId = session?.location.id ?? getLastLocationId()

  const handleLog = async (data: CreateClimbRequest) => {
    try {
      const climb = await climbsApi.create(data)
      const route = activeRoutes.find((r) => r.id === data.routeId)
      setLastClimbType(data.climbType)
      if (route) setLastLocationId(route.locationId)
      recordClimb(climb)
      showToast('success', `Climb logged! +${formatPoints(climb.points)} pts`)
      celebrate(climb.achievement)
      onLogged?.(climb)
      onClose()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to log climb'))
    }
  }

  const handleCreateRoute = async (data: CreateRouteRequest) => {
    try {
      const created = await routesApi.create(data)
      const location = locations.find((l) => l.id === created.locationId)
      setCreatedRoutes((prev) => [{ ...created, location: created.location ?? location }, ...prev])
      setSelectedDefault(created.id)
      setLastLocationId(created.locationId)
      showToast('success', `Route "${created.name}" created`)
      setMode('log')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to create route'))
    }
  }

  return (
    <>
      <div hidden={mode !== 'log'}>
        <ClimbForm
          routes={activeRoutes}
          routesLoading={routesLoading}
          defaultRouteId={selectedDefault}
          defaultClimbType={defaultClimbType}
          recentRouteIds={recentRouteIds}
          preferredLocationId={preferredLocationId}
          onCreateRoute={(hint) => {
            setNameHint(hint)
            setMode('route')
          }}
          onSubmit={handleLog}
          onCancel={onClose}
        />
      </div>
      {mode === 'route' && !locationsLoading && locations.length === 0 && (
        <EmptyState
          compact
          icon={MapPin}
          title="Add a location first"
          message="Routes belong to a gym or crag. Create a location, then add routes to it."
          action={
            <div className="flex flex-col sm:flex-row gap-2">
              <LinkButton to="/locations" onClick={onClose}>Go to locations</LinkButton>
              <Button variant="secondary" onClick={() => setMode('log')}>Back</Button>
            </div>
          }
        />
      )}
      {mode === 'route' && locations.length > 0 && (
        <RouteForm
          locations={locations}
          defaultLocationId={preferredLocationId && locations.some((l) => l.id === preferredLocationId) ? preferredLocationId : undefined}
          initialName={nameHint}
          submitLabel="Create & select"
          onSubmit={handleCreateRoute}
          onCancel={() => setMode('log')}
        />
      )}
    </>
  )
}
