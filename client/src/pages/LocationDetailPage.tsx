import { useState, useEffect, useMemo, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { locationsApi } from '@/api/locations.api'
import { routesApi } from '@/api/routes.api'
import { climbsApi } from '@/api/climbs.api'
import { getErrorMessage } from '@/api/client'
import { Location, Route } from '@/types/models'
import { CreateRouteRequest, CreateClimbRequest, UpdateRouteRequest, CreateLocationRequest, UpdateLocationRequest } from '@/types/api'
import RouteCard from '@/components/routes/RouteCard'
import RouteForm from '@/components/routes/RouteForm'
import GradeBadge from '@/components/routes/GradeBadge'
import ClimbForm from '@/components/climbs/ClimbForm'
import LocationForm from '@/components/locations/LocationForm'
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
import { useFriends } from '@/hooks/useFriends'
import { useGradingSystem } from '@/hooks/useGradingSystem'
import {
  Building2,
  Mountain,
  MapPin,
  Globe,
  Route as RouteIcon,
  Plus,
  Pencil,
  Trash2,
  Calendar,
  TrendingUp,
  Flag,
  BarChart3,
} from 'lucide-react'
import { formatDate } from '@/utils/formatters'
import { compareGrades, frenchToUIAA } from '@/utils/grades'
import { getStoneTypeLabel } from '@/utils/colors'

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFriend } = useFriends()
  const { getEffectiveSystem, getGradeBadgeSystem } = useGradingSystem()

  const [location, setLocation] = useState<Location | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [deleteRouteConfirm, setDeleteRouteConfirm] = useState<Route | null>(null)
  const [loggingClimb, setLoggingClimb] = useState<Route | null>(null)
  const [showDeleteLocation, setShowDeleteLocation] = useState(false)
  const [isEditingLocation, setIsEditingLocation] = useState(false)

  const isOwner = user?.id === location?.userId
  const isFriendOfOwner = isFriend(location?.userId)
  const canEdit = isOwner || isFriendOfOwner

  const loadData = useCallback(async () => {
    if (!id) return
    setIsLoading(true)
    setLoadError(null)
    try {
      const [locationData, routesData] = await Promise.all([
        locationsApi.getById(id),
        routesApi.getByLocation(id),
      ])
      setLocation(locationData)
      setRoutes(routesData)
    } catch (err) {
      setLoadError(getErrorMessage(err, "We couldn't load this location."))
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    loadData()
  }, [loadData])

  // Memoized so the open forms don't see a "new" list on every render.
  const locationAsList = useMemo(() => (location ? [location] : []), [location])
  const loggingRoutes = useMemo(
    () => (loggingClimb && location ? [{ ...loggingClimb, location }] : []),
    [loggingClimb, location]
  )

  const handleCreateRoute = async (data: CreateRouteRequest) => {
    try {
      const newRoute = await routesApi.create({ ...data, locationId: id! })
      setRoutes((prev) => [...prev, { ...newRoute, climbCount: 0 }])
      showToast('success', 'Route created')
      setShowRouteModal(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to create route'))
    }
  }

  const handleUpdateRoute = async (data: CreateRouteRequest) => {
    if (!editingRoute) return
    try {
      const updated = await routesApi.update(editingRoute.id, data as UpdateRouteRequest)
      setRoutes((prev) =>
        updated.locationId === id
          ? prev.map((r) => (r.id === editingRoute.id ? { ...r, ...updated } : r))
          : prev.filter((r) => r.id !== editingRoute.id)
      )
      showToast('success', 'Route updated')
      setEditingRoute(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update route'))
    }
  }

  const handleDeleteRoute = async () => {
    if (!deleteRouteConfirm) return
    try {
      await routesApi.delete(deleteRouteConfirm.id)
      setRoutes((prev) => prev.filter((r) => r.id !== deleteRouteConfirm.id))
      showToast('success', 'Route deleted')
      setDeleteRouteConfirm(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to delete route'))
    }
  }

  const handleResetRoute = async (route: Route) => {
    try {
      const updated = await routesApi.update(route.id, { isActive: false })
      setRoutes((prev) => prev.map((r) => (r.id === route.id ? { ...r, ...updated } : r)))
      showToast('success', `"${route.name}" marked as reset`)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to mark route as reset'))
    }
  }

  const handleLogClimb = async (data: CreateClimbRequest) => {
    try {
      await climbsApi.create(data)
      showToast('success', 'Climb logged!')
      // Bump the count locally rather than reloading the whole page.
      setRoutes((prev) =>
        prev.map((r) => (r.id === data.routeId ? { ...r, climbCount: (r.climbCount || 0) + 1 } : r))
      )
      setLoggingClimb(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to log climb'))
    }
  }

  const handleUpdateLocation = async (data: CreateLocationRequest) => {
    try {
      const updated = await locationsApi.update(id!, data as UpdateLocationRequest)
      setLocation((prev) => (prev ? { ...prev, ...updated } : updated))
      showToast('success', 'Location updated')
      setIsEditingLocation(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update location'))
    }
  }

  const handleDeleteLocation = async () => {
    try {
      await locationsApi.delete(id!)
      showToast('success', 'Location deleted')
      navigate('/locations')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to delete location'))
    }
  }

  if (isLoading && !location) {
    return <PageSpinner />
  }

  if (loadError || !location) {
    return (
      <div className="space-y-4">
        <PageHeader title="Location" backTo="/locations" backLabel="Back to locations" />
        <Card>
          <ErrorState message={loadError ?? undefined} onRetry={loadData} />
          <div className="pb-8 -mt-4 flex justify-center">
            <LinkButton to="/locations" variant="ghost" size="sm">Back to locations</LinkButton>
          </div>
        </Card>
      </div>
    )
  }

  // Reset routes go last; the stable sort keeps the server's name order
  // within each group, and a route marked as reset moves down immediately.
  const sortedRoutes = [...routes].sort(
    (a, b) => Number(b.isActive !== false) - Number(a.isActive !== false)
  )

  const Icon = location.type === 'GYM' ? Building2 : Mountain
  const system = getEffectiveSystem(location)
  const displayGrade = (grade: string) => (system === 'UIAA' ? frenchToUIAA(grade) : grade)
  const totalClimbs = routes.reduce((acc, r) => acc + (r.climbCount || 0), 0)
  const gradeDistribution = routes.reduce((acc, r) => {
    acc[r.difficultyFrench] = (acc[r.difficultyFrench] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const hardestGrade = routes.length > 0
    ? routes.reduce((hardest, r) => (compareGrades(r.difficultyFrench, hardest) > 0 ? r.difficultyFrench : hardest), routes[0].difficultyFrench)
    : null

  const stoneTypeDistribution = location.type === 'CRAG'
    ? routes.reduce((acc, r) => {
        if (r.stoneType) acc[r.stoneType] = (acc[r.stoneType] || 0) + 1
        return acc
      }, {} as Record<string, number>)
    : null

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        backTo="/locations"
        backLabel="Back to locations"
        leading={
          <div className={`p-2.5 sm:p-3 rounded-xl ${location.type === 'GYM' ? 'bg-carabiner-light text-carabiner' : 'bg-send-light text-send'}`}>
            <Icon className="w-6 h-6 sm:w-7 sm:h-7" aria-hidden="true" />
          </div>
        }
        title={location.name}
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <span>
              {location.type === 'GYM' ? 'Indoor gym' : 'Outdoor crag'}
              {location.country && ` · ${location.country}`}
            </span>
            {location.isPublic && (
              <Badge variant="success">
                <Globe className="w-3 h-3" aria-hidden="true" />
                Public
              </Badge>
            )}
          </span>
        }
        actions={
          <>
            {canEdit && (
              <Button onClick={() => setShowRouteModal(true)}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add route
              </Button>
            )}
            <DropdownMenu
              label="Location actions"
              items={[
                { label: 'Edit location', icon: Pencil, onSelect: () => setIsEditingLocation(true), hidden: !isOwner },
                { label: 'Delete location', icon: Trash2, danger: true, onSelect: () => setShowDeleteLocation(true), hidden: !isOwner },
              ]}
            />
          </>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <StatTile label="Routes" value={routes.length} icon={RouteIcon} />
        <StatTile label="Total climbs" value={totalClimbs} icon={TrendingUp} iconClassName="bg-send-light text-send" />
        <StatTile label="Hardest route" value={hardestGrade ? displayGrade(hardestGrade) : '—'} icon={Flag} iconClassName="bg-pump-light text-pump" />
        <StatTile label="Grading" value={system === 'UIAA' ? 'UIAA' : 'French'} icon={BarChart3} iconClassName="bg-purple-50 text-purple-600" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 items-start">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Details</CardTitle>
          </CardHeader>
          <CardBody className="space-y-4">
            {location.address && (
              <div className="flex items-start gap-3 min-w-0">
                <MapPin className="w-4 h-4 text-rock-400 mt-0.5 shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                  <p className="text-xs text-rock-500">Address</p>
                  <p className="text-sm text-rock-900 break-words">{location.address}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-rock-400 mt-0.5 shrink-0" aria-hidden="true" />
              <div>
                <p className="text-xs text-rock-500">Added</p>
                <p className="text-sm text-rock-900">{formatDate(location.createdAt)}</p>
              </div>
            </div>

            {location.description && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-1">Description</p>
                <p className="text-sm text-rock-700 whitespace-pre-wrap break-words">{location.description}</p>
              </div>
            )}

            {Object.keys(gradeDistribution).length > 0 && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-2">Routes by grade</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(gradeDistribution)
                    .sort(([a], [b]) => compareGrades(a, b))
                    .map(([grade, count]) => (
                      <span key={grade} className="inline-flex items-center gap-1.5">
                        <GradeBadge grade={grade} size="sm" system={getGradeBadgeSystem(location)} />
                        <span className="text-xs text-rock-600">×{count}</span>
                      </span>
                    ))}
                </div>
              </div>
            )}

            {stoneTypeDistribution && Object.keys(stoneTypeDistribution).length > 0 && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-2">Rock types</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stoneTypeDistribution).map(([type, count]) => (
                    <span key={type} className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs flex items-center gap-1">
                      <Mountain className="w-3 h-3" aria-hidden="true" />
                      {getStoneTypeLabel(type)}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        <section className="lg:col-span-2 space-y-3">
          <h2 className="text-lg font-semibold text-rock-900">
            Routes <span className="text-rock-400 font-normal">({routes.length})</span>
          </h2>

          {sortedRoutes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
              {sortedRoutes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={{ ...route, location }}
                  onEdit={canEdit ? setEditingRoute : undefined}
                  onDelete={isOwner || route.userId === user?.id ? setDeleteRouteConfirm : undefined}
                  onLogClimb={setLoggingClimb}
                  onReset={canEdit ? handleResetRoute : undefined}
                  canEdit={canEdit}
                />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                compact
                icon={RouteIcon}
                title="No routes yet"
                message={canEdit ? 'Add the first route at this location.' : 'No routes have been added here yet.'}
                action={
                  canEdit && (
                    <Button onClick={() => setShowRouteModal(true)}>
                      <Plus className="w-4 h-4" aria-hidden="true" />
                      Add route
                    </Button>
                  )
                }
              />
            </Card>
          )}
        </section>
      </div>

      <Modal isOpen={showRouteModal} onClose={() => setShowRouteModal(false)} title="Add Route" size="lg">
        <RouteForm
          locations={locationAsList}
          defaultLocationId={location.id}
          onSubmit={handleCreateRoute}
          onCancel={() => setShowRouteModal(false)}
        />
      </Modal>

      <Modal isOpen={!!editingRoute} onClose={() => setEditingRoute(null)} title="Edit Route" size="lg">
        <RouteForm
          route={editingRoute}
          locations={locationAsList}
          onSubmit={handleUpdateRoute}
          onCancel={() => setEditingRoute(null)}
        />
      </Modal>

      <Modal isOpen={!!loggingClimb} onClose={() => setLoggingClimb(null)} title="Log Climb" size="lg">
        <ClimbForm
          routes={loggingRoutes}
          defaultRouteId={loggingClimb?.id}
          onSubmit={handleLogClimb}
          onCancel={() => setLoggingClimb(null)}
        />
      </Modal>

      <Modal isOpen={isEditingLocation} onClose={() => setIsEditingLocation(false)} title="Edit Location" size="lg">
        <LocationForm
          location={location}
          onSubmit={handleUpdateLocation}
          onCancel={() => setIsEditingLocation(false)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteRouteConfirm}
        onClose={() => setDeleteRouteConfirm(null)}
        onConfirm={handleDeleteRoute}
        title="Delete route?"
        message={
          <>
            <strong>{deleteRouteConfirm?.name}</strong> and every climb logged on it will be permanently deleted.
          </>
        }
      />

      <ConfirmDialog
        isOpen={showDeleteLocation}
        onClose={() => setShowDeleteLocation(false)}
        onConfirm={handleDeleteLocation}
        title="Delete location?"
        message={
          <>
            <strong>{location.name}</strong>, its {routes.length} {routes.length === 1 ? 'route' : 'routes'}, and all their climbs will be permanently deleted.
          </>
        }
      />
    </div>
  )
}
