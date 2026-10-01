import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { routesApi } from '@/api/routes.api'
import { climbsApi } from '@/api/climbs.api'
import { getErrorMessage } from '@/api/client'
import { Route, Climb, FriendClimb } from '@/types/models'
import { CreateClimbRequest, UpdateClimbRequest, CreateRouteRequest, UpdateRouteRequest } from '@/types/api'
import RouteForm from '@/components/routes/RouteForm'
import { useLocations } from '@/hooks/useLocations'
import ClimbCard from '@/components/climbs/ClimbCard'
import ClimbForm from '@/components/climbs/ClimbForm'
import GradeBadge from '@/components/routes/GradeBadge'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import DropdownMenu from '@/components/ui/DropdownMenu'
import Button, { LinkButton } from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import StatTile from '@/components/ui/StatTile'
import Badge from '@/components/ui/Badge'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { useGradingSystem } from '@/hooks/useGradingSystem'
import { useFriends } from '@/hooks/useFriends'
import {
  MapPin,
  Globe,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  Target,
  User,
  Ruler,
  Mountain,
  Award,
  Clock,
  Star,
  CheckCircle,
  Users,
  Ban,
  RotateCcw,
  LucideIcon,
} from 'lucide-react'
import { formatDate, formatPoints } from '@/utils/formatters'
import { getClimbTypeLabel, getStoneTypeLabel } from '@/utils/colors'

const byDateDesc = (a: Climb, b: Climb) => {
  const dateDiff = new Date(b.date).getTime() - new Date(a.date).getTime()
  if (dateDiff !== 0) return dateDiff
  return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
}

function DetailRow({ icon: Icon, label, children }: { icon: LucideIcon; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3 min-w-0">
      <Icon className="w-4 h-4 text-rock-400 mt-0.5 shrink-0" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-xs text-rock-500">{label}</p>
        <p className="text-sm text-rock-900 break-words">{children}</p>
      </div>
    </div>
  )
}

export default function RouteDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { getGradeBadgeSystem } = useGradingSystem()
  const { isFriend } = useFriends()

  const [route, setRoute] = useState<Route | null>(null)
  const [climbs, setClimbs] = useState<FriendClimb[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showClimbModal, setShowClimbModal] = useState(false)
  const [editingClimb, setEditingClimb] = useState<Climb | null>(null)
  const [deleteClimbConfirm, setDeleteClimbConfirm] = useState<Climb | null>(null)
  const [showDeleteRoute, setShowDeleteRoute] = useState(false)
  const [showResetConfirm, setShowResetConfirm] = useState(false)

  const isOwner = user?.id === route?.userId
  const isLocationOwner = !!route?.location && user?.id === route.location.userId
  // Mirrors the server: the location owner and their friends may edit routes
  // there, but only the route or location owner may delete one.
  const isFriendOfLocationOwner = isFriend(route?.location?.userId)
  const canEdit = isOwner || isLocationOwner || isFriendOfLocationOwner
  const canDelete = isOwner || isLocationOwner
  const isReset = route?.isActive === false

  const { locations } = useLocations()
  const [isEditingRoute, setIsEditingRoute] = useState(false)
  // The route's own location may be a friend's, which isn't in the user's list.
  const editLocations = useMemo(
    () =>
      route?.location && !locations.some((l) => l.id === route.locationId)
        ? [route.location, ...locations]
        : locations,
    [route?.location, route?.locationId, locations]
  )
  const routeAsList = useMemo(() => (route ? [route] : []), [route])

  const loadData = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setLoadError(null)
    try {
      const [routeData, climbsData] = await Promise.all([
        routesApi.getById(id),
        climbsApi.getByRoute(id),
      ])
      setRoute(routeData)
      setClimbs(climbsData)
    } catch (err) {
      setLoadError(getErrorMessage(err, "We couldn't load this route."))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleLogClimb = async (data: CreateClimbRequest) => {
    try {
      const newClimb = await climbsApi.create(data)
      setClimbs((prev) => [newClimb, ...prev])
      showToast('success', 'Climb logged!')
      setShowClimbModal(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to log climb'))
    }
  }

  const handleUpdateClimb = async (data: CreateClimbRequest) => {
    if (!editingClimb) return
    try {
      const updated = await climbsApi.update(editingClimb.id, data as UpdateClimbRequest)
      setClimbs((prev) => prev.map((c) => (c.id === editingClimb.id ? { ...c, ...updated } : c)))
      showToast('success', 'Climb updated')
      setEditingClimb(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update climb'))
    }
  }

  const handleDeleteClimb = async () => {
    if (!deleteClimbConfirm) return
    try {
      await climbsApi.delete(deleteClimbConfirm.id)
      setClimbs((prev) => prev.filter((c) => c.id !== deleteClimbConfirm.id))
      showToast('success', 'Climb deleted')
      setDeleteClimbConfirm(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to delete climb'))
    }
  }

  const handleResetRoute = async () => {
    try {
      const updated = await routesApi.update(id!, { isActive: false })
      setRoute((prev) => (prev ? { ...prev, ...updated } : updated))
      showToast('success', 'Route marked as reset')
      setShowResetConfirm(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to mark route as reset'))
    }
  }

  const handleUpdateRoute = async (data: CreateRouteRequest) => {
    try {
      const updated = await routesApi.update(id!, data as UpdateRouteRequest)
      // A location change means the embedded location object is stale.
      if (updated.locationId !== route?.locationId) {
        await loadData()
      } else {
        setRoute((prev) => (prev ? { ...prev, ...updated, location: prev.location } : updated))
      }
      showToast('success', 'Route updated')
      setIsEditingRoute(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update route'))
    }
  }

  const handleDeleteRoute = async () => {
    try {
      await routesApi.delete(id!)
      showToast('success', 'Route deleted')
      navigate(route?.location ? `/locations/${route.location.id}` : '/routes')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to delete route'))
    }
  }

  if (isLoading && !route) {
    return <PageSpinner />
  }

  if (loadError || !route) {
    return (
      <div className="space-y-4">
        <PageHeader title="Route" backTo="/routes" backLabel="Back to routes" />
        <Card>
          <ErrorState message={loadError ?? undefined} onRetry={loadData} />
          <div className="pb-8 -mt-4 flex justify-center">
            <LinkButton to="/routes" variant="ghost" size="sm">Back to routes</LinkButton>
          </div>
        </Card>
      </div>
    )
  }

  // Separate own climbs and friend climbs
  const myClimbs = climbs.filter((c) => c.userId === user?.id).sort(byDateDesc)
  const friendClimbsList = climbs.filter((c) => c.userId !== user?.id).sort(byDateDesc)

  // Stats (own climbs only)
  const totalPoints = myClimbs.reduce((acc, c) => acc + c.points, 0)
  const successfulClimbs = myClimbs.filter((c) => c.climbType !== 'TRY')
  const bestSend = successfulClimbs.length > 0
    ? successfulClimbs.reduce((best, c) => (c.points > best.points ? c : best))
    : null
  const firstClimb = myClimbs.length > 0 ? myClimbs[myClimbs.length - 1] : null
  const rated = myClimbs.filter((c) => c.personalRating)
  const avgRating = rated.length > 0
    ? rated.reduce((acc, c) => acc + (c.personalRating || 0), 0) / rated.length
    : null

  const climbTypeDistribution = myClimbs.reduce((acc, c) => {
    acc[c.climbType] = (acc[c.climbType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const backTo = route.location ? `/locations/${route.location.id}` : '/routes'

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        backTo={backTo}
        backLabel={route.location ? `Back to ${route.location.name}` : 'Back to routes'}
        leading={<GradeBadge grade={route.difficultyFrench} size="lg" system={getGradeBadgeSystem(route.location)} />}
        title={
          <span className="inline-flex items-center gap-2 flex-wrap">
            <span className="break-words">{route.name}</span>
            {route.color && (
              <span
                className="w-4 h-4 rounded-full border-2 border-rock-300 shrink-0"
                style={{ backgroundColor: route.color }}
                aria-label="Hold color"
                role="img"
              />
            )}
          </span>
        }
        subtitle={
          <span className="flex flex-wrap items-center gap-2 mt-1">
            {route.location && (
              <Link
                to={`/locations/${route.location.id}`}
                className="inline-flex items-center gap-1 text-rock-500 hover:text-carabiner rounded min-w-0"
              >
                <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{route.location.name}</span>
              </Link>
            )}
            {isReset && (
              <Badge>
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                Reset
              </Badge>
            )}
            {route.isPublic && (
              <Badge variant="success">
                <Globe className="w-3 h-3" aria-hidden="true" />
                Public
              </Badge>
            )}
          </span>
        }
        actions={
          <>
            {!isReset && (
              <Button variant="success" onClick={() => setShowClimbModal(true)}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                Log climb
              </Button>
            )}
            <DropdownMenu
              label="Route actions"
              items={[
                { label: 'Mark as reset', icon: Ban, onSelect: () => setShowResetConfirm(true), hidden: !canEdit || isReset },
                { label: 'Edit route', icon: Pencil, onSelect: () => setIsEditingRoute(true), hidden: !canEdit },
                { label: 'Delete route', icon: Trash2, danger: true, onSelect: () => setShowDeleteRoute(true), hidden: !canDelete },
              ]}
            />
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="My climbs" value={myClimbs.length} icon={Target} />
        <StatTile label="Points" value={formatPoints(totalPoints)} icon={TrendingUp} iconClassName="bg-send-light text-send" />
        <StatTile label="Best send" value={bestSend ? getClimbTypeLabel(bestSend.climbType) : '—'} icon={Award} iconClassName="bg-yellow-50 text-yellow-600" />
        <StatTile label="Avg rating" value={avgRating ? avgRating.toFixed(1) : '—'} icon={Star} iconClassName="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Route details</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {route.visualId && <DetailRow icon={Target} label="Visual ID">{route.visualId}</DetailRow>}
            {route.heightMeters && <DetailRow icon={Ruler} label="Height">{route.heightMeters} m</DetailRow>}
            {route.setter && <DetailRow icon={User} label="Setter">{route.setter}</DetailRow>}
            {route.stoneType && <DetailRow icon={Mountain} label="Rock type">{getStoneTypeLabel(route.stoneType)}</DetailRow>}
            <DetailRow icon={Calendar} label="Added">{formatDate(route.createdAt)}</DetailRow>
            {firstClimb && <DetailRow icon={Clock} label="First logged">{formatDate(firstClimb.date)}</DetailRow>}

            {route.description && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-1">Description / beta</p>
                <p className="text-sm text-rock-700 whitespace-pre-wrap break-words">{route.description}</p>
              </div>
            )}

            {Object.keys(climbTypeDistribution).length > 0 && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-2">My ascents by style</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(climbTypeDistribution).map(([type, count]) => (
                    <span key={type} className="px-2 py-1 bg-rock-100 rounded text-xs text-rock-700">
                      {getClimbTypeLabel(type as Climb['climbType'])}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <div className="lg:col-span-2 space-y-4 sm:space-y-6">
          <section className="space-y-3">
            <h2 className="text-lg font-semibold text-rock-900">
              My climbs <span className="text-rock-400 font-normal">({myClimbs.length})</span>
            </h2>

            {myClimbs.length > 0 ? (
              <div className="space-y-3">
                {myClimbs.map((climb) => (
                  <ClimbCard
                    key={climb.id}
                    climb={{ ...climb, route }}
                    hideRoute
                    onEdit={setEditingClimb}
                    onDelete={setDeleteClimbConfirm}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <EmptyState
                  compact
                  icon={CheckCircle}
                  title="No climbs yet"
                  message={isReset ? 'This route has been reset and is no longer active.' : 'Log your first climb on this route!'}
                  action={
                    !isReset && (
                      <Button variant="success" onClick={() => setShowClimbModal(true)}>
                        <Plus className="w-4 h-4" aria-hidden="true" />
                        Log climb
                      </Button>
                    )
                  }
                />
              </Card>
            )}
          </section>

          {friendClimbsList.length > 0 && (
            <section className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold text-rock-900">
                <Users className="w-5 h-5 text-rock-500" aria-hidden="true" />
                Friends' climbs <span className="text-rock-400 font-normal">({friendClimbsList.length})</span>
              </h2>
              <div className="space-y-3">
                {friendClimbsList.map((climb) => (
                  <ClimbCard
                    key={climb.id}
                    climb={{ ...climb, route }}
                    hideRoute
                    user={climb.user}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>

      <Modal isOpen={isEditingRoute} onClose={() => setIsEditingRoute(false)} title="Edit Route" size="lg">
        <RouteForm
          route={route}
          locations={editLocations}
          onSubmit={handleUpdateRoute}
          onCancel={() => setIsEditingRoute(false)}
        />
      </Modal>

      <Modal isOpen={showClimbModal} onClose={() => setShowClimbModal(false)} title="Log Climb" size="lg">
        <ClimbForm
          routes={routeAsList}
          defaultRouteId={route.id}
          onSubmit={handleLogClimb}
          onCancel={() => setShowClimbModal(false)}
        />
      </Modal>

      <Modal isOpen={!!editingClimb} onClose={() => setEditingClimb(null)} title="Edit Climb" size="lg">
        <ClimbForm
          climb={editingClimb}
          routes={routeAsList}
          defaultRouteId={route.id}
          onSubmit={handleUpdateClimb}
          onCancel={() => setEditingClimb(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteClimbConfirm}
        onClose={() => setDeleteClimbConfirm(null)}
        onConfirm={handleDeleteClimb}
        title="Delete climb?"
        message={`Your climb from ${formatDate(deleteClimbConfirm?.date || new Date())} and its points will be removed.`}
      />

      <ConfirmDialog
        isOpen={showResetConfirm}
        onClose={() => setShowResetConfirm(false)}
        onConfirm={handleResetRoute}
        title="Mark route as reset?"
        message="Reset routes stay in your history but can't be logged anymore."
        confirmLabel="Mark as reset"
        variant="primary"
      />

      <ConfirmDialog
        isOpen={showDeleteRoute}
        onClose={() => setShowDeleteRoute(false)}
        onConfirm={handleDeleteRoute}
        title="Delete route?"
        message={
          <>
            <strong>{route.name}</strong> and all {climbs.length} {climbs.length === 1 ? 'climb' : 'climbs'} on it will be permanently deleted.
          </>
        }
      />
    </div>
  )
}
