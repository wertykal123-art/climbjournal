import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { locationsApi } from '@/api/locations.api'
import { routesApi } from '@/api/routes.api'
import { climbsApi } from '@/api/climbs.api'
import { Location, Route } from '@/types/models'
import { CreateRouteRequest, CreateClimbRequest } from '@/types/api'
import RouteCard from '@/components/routes/RouteCard'
import RouteForm from '@/components/routes/RouteForm'
import ClimbForm from '@/components/climbs/ClimbForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { useFriends } from '@/hooks/useFriends'
import {
  ArrowLeft,
  Building2,
  Mountain,
  MapPin,
  Globe,
  Route as RouteIcon,
  Plus,
  Trash2,
  Calendar,
  TrendingUp,
  Flag,
  BarChart3,
  MoreVertical,
} from 'lucide-react'
import { formatDate } from '@/utils/formatters'

export default function LocationDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isFriend } = useFriends()

  const [location, setLocation] = useState<Location | null>(null)
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showRouteModal, setShowRouteModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [deleteRouteConfirm, setDeleteRouteConfirm] = useState<Route | null>(null)
  const [loggingClimb, setLoggingClimb] = useState<Route | null>(null)
  const [showDeleteLocation, setShowDeleteLocation] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isOwner = user?.id === location?.userId
  const isFriendOfOwner = isFriend(location?.userId)
  const canEdit = isOwner || isFriendOfOwner

  useEffect(() => {
    if (id) {
      loadData()
    }
  }, [id])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const loadData = async () => {
    setIsLoading(true)
    try {
      const [locationData, routesData] = await Promise.all([
        locationsApi.getById(id!),
        routesApi.getByLocation(id!),
      ])
      setLocation(locationData)
      setRoutes(routesData)
    } catch {
      showToast('error', 'Failed to load location')
      navigate('/locations')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreateRoute = async (data: CreateRouteRequest) => {
    try {
      const newRoute = await routesApi.create({ ...data, locationId: id! })
      setRoutes([...routes, newRoute])
      showToast('success', 'Route created successfully!')
      setShowRouteModal(false)
    } catch {
      showToast('error', 'Failed to create route')
    }
  }

  const handleUpdateRoute = async (data: CreateRouteRequest) => {
    if (!editingRoute) return
    try {
      const updated = await routesApi.update(editingRoute.id, data)
      setRoutes(routes.map((r) => (r.id === editingRoute.id ? updated : r)))
      showToast('success', 'Route updated successfully!')
      setEditingRoute(null)
    } catch {
      showToast('error', 'Failed to update route')
    }
  }

  const handleDeleteRoute = async () => {
    if (!deleteRouteConfirm) return
    try {
      await routesApi.delete(deleteRouteConfirm.id)
      setRoutes(routes.filter((r) => r.id !== deleteRouteConfirm.id))
      showToast('success', 'Route deleted successfully!')
      setDeleteRouteConfirm(null)
    } catch {
      showToast('error', 'Failed to delete route')
    }
  }

  const handleResetRoute = async (route: Route) => {
    try {
      const updated = await routesApi.update(route.id, { isActive: false })
      setRoutes(routes.map((r) => (r.id === route.id ? { ...r, ...updated } : r)))
      showToast('success', 'Route marked as reset')
    } catch {
      showToast('error', 'Failed to mark route as reset')
    }
  }

  const handleLogClimb = async (data: CreateClimbRequest) => {
    try {
      await climbsApi.create(data)
      showToast('success', 'Climb logged successfully!')
      setLoggingClimb(null)
      loadData() // Refresh to update climb counts
    } catch {
      showToast('error', 'Failed to log climb')
    }
  }

  const handleDeleteLocation = async () => {
    try {
      await locationsApi.delete(id!)
      showToast('success', 'Location deleted successfully!')
      navigate('/locations')
    } catch {
      showToast('error', 'Failed to delete location')
    }
  }

  if (isLoading) {
    return <PageSpinner />
  }

  if (!location) {
    return null
  }

  const Icon = location.type === 'GYM' ? Building2 : Mountain
  const totalClimbs = routes.reduce((acc, r) => acc + (r.climbCount || 0), 0)
  const gradeDistribution = routes.reduce((acc, r) => {
    const grade = r.difficultyFrench
    acc[grade] = (acc[grade] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const hardestGrade = routes.length > 0
    ? routes.reduce((hardest, r) => {
        if (!hardest) return r.difficultyFrench
        // Simple comparison - this could be improved with proper grade sorting
        return r.difficultyFrench > hardest ? r.difficultyFrench : hardest
      }, '')
    : null

  // Count stone types for crags
  const stoneTypeDistribution = location.type === 'CRAG'
    ? routes.reduce((acc, r) => {
        if (r.stoneType) {
          acc[r.stoneType] = (acc[r.stoneType] || 0) + 1
        }
        return acc
      }, {} as Record<string, number>)
    : null

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            to="/locations"
            className="p-2 rounded-lg text-rock-500 hover:text-rock-700 hover:bg-rock-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-center gap-4">
            <div className={`p-3 rounded-xl ${location.type === 'GYM' ? 'bg-blue-100 text-carabiner' : 'bg-green-100 text-send'}`}>
              <Icon className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold text-rock-900">{location.name}</h1>
                {location.isPublic && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-send text-xs rounded-full">
                    <Globe className="w-3 h-3" />
                    Public
                  </span>
                )}
              </div>
              <p className="text-rock-500">
                {location.type === 'GYM' ? 'Indoor Gym' : 'Outdoor Crag'}
                {location.country && ` • ${location.country}`}
              </p>
            </div>
          </div>
        </div>

        {isOwner && (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-lg text-rock-500 hover:text-rock-700 hover:bg-rock-100"
            >
              <MoreVertical className="w-6 h-6" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-rock-200 py-1 z-10">
                <button
                  onClick={() => {
                    setShowMenu(false)
                    setShowDeleteLocation(true)
                  }}
                  className="flex items-center gap-2 w-full px-3 py-2 text-sm text-fall hover:bg-rock-50"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <RouteIcon className="w-5 h-5 text-carabiner" />
              </div>
              <div>
                <p className="text-xs text-rock-500">Routes</p>
                <p className="text-xl font-bold text-rock-900">{routes.length}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-send" />
              </div>
              <div>
                <p className="text-xs text-rock-500">Total Climbs</p>
                <p className="text-xl font-bold text-rock-900">{totalClimbs}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-100">
                <Flag className="w-5 h-5 text-pump" />
              </div>
              <div>
                <p className="text-xs text-rock-500">Hardest Route</p>
                <p className="text-xl font-bold text-rock-900">{hardestGrade || '-'}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <BarChart3 className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-rock-500">Grading System</p>
                <p className="text-sm font-semibold text-rock-900">
                  {location.defaultGradingSystem === 'UIAA' ? 'UIAA' : 'French'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="font-semibold text-rock-900">Details</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            {location.address && (
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-rock-400 mt-0.5" />
                <div>
                  <p className="text-xs text-rock-500">Address</p>
                  <p className="text-sm text-rock-900">{location.address}</p>
                </div>
              </div>
            )}

            {location.country && (
              <div className="flex items-start gap-3">
                <Globe className="w-4 h-4 text-rock-400 mt-0.5" />
                <div>
                  <p className="text-xs text-rock-500">Country</p>
                  <p className="text-sm text-rock-900">{location.country}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-rock-400 mt-0.5" />
              <div>
                <p className="text-xs text-rock-500">Added</p>
                <p className="text-sm text-rock-900">{formatDate(location.createdAt)}</p>
              </div>
            </div>

            {location.description && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-1">Description</p>
                <p className="text-sm text-rock-700">{location.description}</p>
              </div>
            )}

            {/* Grade Distribution */}
            {Object.keys(gradeDistribution).length > 0 && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-2">Grade Distribution</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(gradeDistribution)
                    .sort(([a], [b]) => a.localeCompare(b))
                    .map(([grade, count]) => (
                      <span
                        key={grade}
                        className="px-2 py-1 bg-rock-100 rounded text-xs text-rock-700"
                      >
                        {grade}: {count}
                      </span>
                    ))}
                </div>
              </div>
            )}

            {/* Stone Type Distribution for Crags */}
            {stoneTypeDistribution && Object.keys(stoneTypeDistribution).length > 0 && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-2">Rock Types</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(stoneTypeDistribution).map(([type, count]) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-amber-100 text-amber-800 rounded text-xs flex items-center gap-1"
                    >
                      <Mountain className="w-3 h-3" />
                      {type.charAt(0) + type.slice(1).toLowerCase()}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Right - Routes */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-rock-900">
              Routes ({routes.length})
            </h2>
            {canEdit && (
              <Button onClick={() => setShowRouteModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Route
              </Button>
            )}
          </div>

          {routes.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {routes.map((route) => (
                <RouteCard
                  key={route.id}
                  route={{ ...route, location }}
                  onEdit={canEdit ? setEditingRoute : undefined}
                  onDelete={canEdit ? setDeleteRouteConfirm : undefined}
                  onLogClimb={setLoggingClimb}
                  onReset={canEdit ? handleResetRoute : undefined}
                  canEdit={canEdit}
                />
              ))}
            </div>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <RouteIcon className="w-12 h-12 text-rock-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-rock-900 mb-2">No routes yet</h3>
                <p className="text-rock-500 mb-4">
                  {canEdit ? 'Add your first route to this location.' : 'No routes have been added yet.'}
                </p>
                {canEdit && (
                  <Button onClick={() => setShowRouteModal(true)}>
                    <Plus className="w-4 h-4 mr-2" />
                    Add Route
                  </Button>
                )}
              </CardBody>
            </Card>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        title="Add Route"
        size="lg"
      >
        <RouteForm
          locations={[location]}
          defaultLocationId={location.id}
          onSubmit={handleCreateRoute}
          onCancel={() => setShowRouteModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingRoute}
        onClose={() => setEditingRoute(null)}
        title="Edit Route"
        size="lg"
      >
        <RouteForm
          route={editingRoute}
          locations={[location]}
          onSubmit={handleUpdateRoute}
          onCancel={() => setEditingRoute(null)}
        />
      </Modal>

      <Modal
        isOpen={!!loggingClimb}
        onClose={() => setLoggingClimb(null)}
        title="Log Climb"
        size="lg"
      >
        <ClimbForm
          routes={loggingClimb ? [{ ...loggingClimb, location }] : []}
          defaultRouteId={loggingClimb?.id}
          onSubmit={handleLogClimb}
          onCancel={() => setLoggingClimb(null)}
        />
      </Modal>

      <Modal
        isOpen={!!deleteRouteConfirm}
        onClose={() => setDeleteRouteConfirm(null)}
        title="Delete Route"
      >
        <p className="text-rock-600 mb-4">
          Are you sure you want to delete "{deleteRouteConfirm?.name}"? This will also delete all climbs on this route.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteRouteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRoute}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteLocation}
        onClose={() => setShowDeleteLocation(false)}
        title="Delete Location"
      >
        <p className="text-rock-600 mb-4">
          Are you sure you want to delete "{location.name}"? This will also delete all {routes.length} routes and their climbs.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteLocation(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteLocation}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
