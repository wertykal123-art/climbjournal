import { useState, useEffect, useRef } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { routesApi } from '@/api/routes.api'
import { climbsApi } from '@/api/climbs.api'
import { Route, Climb, FriendClimb, StoneType } from '@/types/models'
import { CreateClimbRequest, UpdateClimbRequest } from '@/types/api'
import ClimbCard from '@/components/climbs/ClimbCard'
import ClimbTypeBadge from '@/components/climbs/ClimbTypeBadge'
import ClimbForm from '@/components/climbs/ClimbForm'
import GradeBadge from '@/components/routes/GradeBadge'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { useAuth } from '@/context/AuthContext'
import { useGradingSystem } from '@/hooks/useGradingSystem'
import { useFriends } from '@/hooks/useFriends'
import {
  ArrowLeft,
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
  MoreVertical,
  Users,
} from 'lucide-react'
import { formatDate, formatPoints } from '@/utils/formatters'

const STONE_TYPE_LABELS: Record<StoneType, string> = {
  GRANITE: 'Granite',
  LIMESTONE: 'Limestone',
  SANDSTONE: 'Sandstone',
  GNEISS: 'Gneiss',
  BASALT: 'Basalt',
  CONGLOMERATE: 'Conglomerate',
  QUARTZITE: 'Quartzite',
  SLATE: 'Slate',
  SCHIST: 'Schist',
  TUFF: 'Tuff',
  OTHER: 'Other',
}

const CLIMB_TYPE_LABELS: Record<string, string> = {
  OS: 'On-Sight',
  FLASH: 'Flash',
  RP: 'Redpoint',
  PP: 'Pinkpoint',
  TOPROPE: 'Top Rope',
  AUTOBELAY: 'Auto Belay',
  TRY: 'Attempt',
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
  const [showClimbModal, setShowClimbModal] = useState(false)
  const [editingClimb, setEditingClimb] = useState<Climb | null>(null)
  const [deleteClimbConfirm, setDeleteClimbConfirm] = useState<Climb | null>(null)
  const [showDeleteRoute, setShowDeleteRoute] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  const isOwner = user?.id === route?.userId
  // Friends of the location owner can also edit routes
  const isFriendOfLocationOwner = isFriend(route?.location?.userId)
  const canEdit = isOwner || isFriendOfLocationOwner

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
      const [routeData, climbsData] = await Promise.all([
        routesApi.getById(id!),
        climbsApi.getByRoute(id!),
      ])
      setRoute(routeData)
      setClimbs(climbsData)
    } catch {
      showToast('error', 'Failed to load route')
      navigate('/routes')
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogClimb = async (data: CreateClimbRequest) => {
    try {
      const newClimb = await climbsApi.create(data)
      setClimbs([newClimb, ...climbs])
      showToast('success', 'Climb logged successfully!')
      setShowClimbModal(false)
    } catch {
      showToast('error', 'Failed to log climb')
    }
  }

  const handleUpdateClimb = async (data: CreateClimbRequest) => {
    if (!editingClimb) return
    try {
      const updated = await climbsApi.update(editingClimb.id, data as UpdateClimbRequest)
      setClimbs(climbs.map((c) => (c.id === editingClimb.id ? updated : c)))
      showToast('success', 'Climb updated successfully!')
      setEditingClimb(null)
    } catch {
      showToast('error', 'Failed to update climb')
    }
  }

  const handleDeleteClimb = async () => {
    if (!deleteClimbConfirm) return
    try {
      await climbsApi.delete(deleteClimbConfirm.id)
      setClimbs(climbs.filter((c) => c.id !== deleteClimbConfirm.id))
      showToast('success', 'Climb deleted successfully!')
      setDeleteClimbConfirm(null)
    } catch {
      showToast('error', 'Failed to delete climb')
    }
  }

  const handleDeleteRoute = async () => {
    try {
      await routesApi.delete(id!)
      showToast('success', 'Route deleted successfully!')
      navigate('/routes')
    } catch {
      showToast('error', 'Failed to delete route')
    }
  }

  if (isLoading) {
    return <PageSpinner />
  }

  if (!route) {
    return null
  }

  // Separate own climbs and friend climbs
  const myClimbs = climbs.filter((c) => c.userId === user?.id)
  const friendClimbsList = climbs.filter((c) => c.userId !== user?.id)

  // Calculate stats (based on own climbs only)
  const totalClimbs = myClimbs.length
  const totalPoints = myClimbs.reduce((acc, c) => acc + c.points, 0)
  const successfulClimbs = myClimbs.filter((c) => c.climbType !== 'TRY')
  const bestSend = successfulClimbs.length > 0
    ? successfulClimbs.reduce((best, c) => (c.points > best.points ? c : best))
    : null
  const firstClimb = myClimbs.length > 0
    ? myClimbs.reduce((first, c) => (new Date(c.date) < new Date(first.date) ? c : first))
    : null
  const avgRating = myClimbs.filter((c) => c.personalRating).length > 0
    ? myClimbs.filter((c) => c.personalRating).reduce((acc, c) => acc + (c.personalRating || 0), 0) /
      myClimbs.filter((c) => c.personalRating).length
    : null

  // Climb type distribution (own climbs)
  const climbTypeDistribution = myClimbs.reduce((acc, c) => {
    acc[c.climbType] = (acc[c.climbType] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Link
            to={route.location ? `/locations/${route.location.id}` : '/routes'}
            className="p-2 rounded-lg text-rock-500 hover:text-rock-700 hover:bg-rock-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex items-start gap-4">
            <GradeBadge
              grade={route.difficultyFrench}
              size="lg"
              system={getGradeBadgeSystem(route.location)}
            />
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-rock-900">{route.name}</h1>
                {route.color && (
                  <span
                    className="w-5 h-5 rounded-full border-2 border-rock-300"
                    style={{ backgroundColor: route.color }}
                    title={`Hold color: ${route.color}`}
                  />
                )}
                {route.isPublic && (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-send text-xs rounded-full">
                    <Globe className="w-3 h-3" />
                    Public
                  </span>
                )}
              </div>
              {route.location && (
                <Link
                  to={`/locations/${route.location.id}`}
                  className="text-rock-500 hover:text-carabiner flex items-center gap-1 mt-1"
                >
                  <MapPin className="w-4 h-4" />
                  {route.location.name}
                </Link>
              )}
            </div>
          </div>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2 rounded-lg text-rock-500 hover:text-rock-700 hover:bg-rock-100"
          >
            <MoreVertical className="w-6 h-6" />
          </button>
          {showMenu && (
            <div className="absolute right-0 mt-1 w-40 bg-white rounded-lg shadow-lg border border-rock-200 py-1 z-10">
              <button
                onClick={() => {
                  setShowMenu(false)
                  setShowClimbModal(true)
                }}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm text-send hover:bg-rock-50"
              >
                <CheckCircle className="w-4 h-4" />
                Log Climb
              </button>
              {canEdit && (
                <>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      navigate(`/routes?edit=${route.id}`)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rock-700 hover:bg-rock-50"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      setShowDeleteRoute(true)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-fall hover:bg-rock-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Target className="w-5 h-5 text-carabiner" />
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
              <div className="p-2 rounded-lg bg-green-100">
                <TrendingUp className="w-5 h-5 text-send" />
              </div>
              <div>
                <p className="text-xs text-rock-500">Total Points</p>
                <p className="text-xl font-bold text-rock-900">{formatPoints(totalPoints)}</p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-yellow-100">
                <Award className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-xs text-rock-500">Best Send</p>
                <p className="text-xl font-bold text-rock-900">
                  {bestSend ? CLIMB_TYPE_LABELS[bestSend.climbType] : '-'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100">
                <Star className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs text-rock-500">Avg Rating</p>
                <p className="text-xl font-bold text-rock-900">
                  {avgRating ? avgRating.toFixed(1) : '-'}
                </p>
              </div>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Details Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left - Route Details */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <h3 className="font-semibold text-rock-900">Route Details</h3>
          </CardHeader>
          <CardBody className="space-y-4">
            {route.visualId && (
              <div className="flex items-start gap-3">
                <Target className="w-4 h-4 text-rock-400 mt-0.5" />
                <div>
                  <p className="text-xs text-rock-500">Visual ID</p>
                  <p className="text-sm text-rock-900">{route.visualId}</p>
                </div>
              </div>
            )}

            {route.heightMeters && (
              <div className="flex items-start gap-3">
                <Ruler className="w-4 h-4 text-rock-400 mt-0.5" />
                <div>
                  <p className="text-xs text-rock-500">Height</p>
                  <p className="text-sm text-rock-900">{route.heightMeters}m</p>
                </div>
              </div>
            )}

            {route.setter && (
              <div className="flex items-start gap-3">
                <User className="w-4 h-4 text-rock-400 mt-0.5" />
                <div>
                  <p className="text-xs text-rock-500">Setter</p>
                  <p className="text-sm text-rock-900">{route.setter}</p>
                </div>
              </div>
            )}

            {route.stoneType && (
              <div className="flex items-start gap-3">
                <Mountain className="w-4 h-4 text-rock-400 mt-0.5" />
                <div>
                  <p className="text-xs text-rock-500">Rock Type</p>
                  <p className="text-sm text-rock-900">{STONE_TYPE_LABELS[route.stoneType]}</p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Calendar className="w-4 h-4 text-rock-400 mt-0.5" />
              <div>
                <p className="text-xs text-rock-500">Added</p>
                <p className="text-sm text-rock-900">{formatDate(route.createdAt)}</p>
              </div>
            </div>

            {firstClimb && (
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-rock-400 mt-0.5" />
                <div>
                  <p className="text-xs text-rock-500">First Logged</p>
                  <p className="text-sm text-rock-900">{formatDate(firstClimb.date)}</p>
                </div>
              </div>
            )}

            {route.description && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-1">Description / Beta</p>
                <p className="text-sm text-rock-700 whitespace-pre-wrap">{route.description}</p>
              </div>
            )}

            {/* Climb Type Distribution */}
            {Object.keys(climbTypeDistribution).length > 0 && (
              <div className="pt-4 border-t border-rock-200">
                <p className="text-xs text-rock-500 mb-2">Climb Types</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(climbTypeDistribution).map(([type, count]) => (
                    <span
                      key={type}
                      className="px-2 py-1 bg-rock-100 rounded text-xs text-rock-700"
                    >
                      {CLIMB_TYPE_LABELS[type]}: {count}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </CardBody>
        </Card>

        {/* Right - Climbs */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-rock-900">
              My Climbs ({myClimbs.length})
            </h2>
            <Button onClick={() => setShowClimbModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Log Climb
            </Button>
          </div>

          {myClimbs.length > 0 ? (
            <div className="space-y-4">
              {myClimbs
                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                .map((climb) => (
                  <ClimbCard
                    key={climb.id}
                    climb={{ ...climb, route }}
                    onEdit={setEditingClimb}
                    onDelete={setDeleteClimbConfirm}
                  />
                ))}
            </div>
          ) : (
            <Card>
              <CardBody className="text-center py-12">
                <CheckCircle className="w-12 h-12 text-rock-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-rock-900 mb-2">No climbs yet</h3>
                <p className="text-rock-500 mb-4">Log your first climb on this route!</p>
                <Button onClick={() => setShowClimbModal(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Climb
                </Button>
              </CardBody>
            </Card>
          )}

          {friendClimbsList.length > 0 && (
            <>
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-rock-500" />
                <h2 className="text-lg font-semibold text-rock-900">
                  Friend Climbs ({friendClimbsList.length})
                </h2>
              </div>
              <div className="space-y-4">
                {friendClimbsList
                  .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                  .map((climb) => (
                    <Card key={climb.id} className="hover:shadow-md transition-shadow">
                      <CardBody>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <GradeBadge
                              grade={route.difficultyFrench}
                              size="lg"
                              system={getGradeBadgeSystem(route.location)}
                            />
                            <div>
                              <h3 className="font-semibold text-rock-900">{route.name}</h3>
                              <p className="text-sm text-rock-500">
                                {formatDate(climb.date)}
                              </p>
                              {climb.user && (
                                <Link
                                  to={`/friends/climbs/${climb.user.id}`}
                                  className="text-xs text-carabiner hover:underline"
                                >
                                  {climb.user.displayName}
                                </Link>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg text-send">
                              +{formatPoints(climb.points)}
                            </div>
                            <div className="text-xs text-rock-500">points</div>
                          </div>
                        </div>
                        <div className="mt-3 flex items-center gap-3 flex-wrap">
                          <ClimbTypeBadge type={climb.climbType} />
                          {climb.personalRating && (
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star
                                  key={i}
                                  className={`w-4 h-4 ${
                                    i < climb.personalRating!
                                      ? 'text-yellow-500 fill-yellow-500'
                                      : 'text-rock-300'
                                  }`}
                                />
                              ))}
                            </div>
                          )}
                          {climb.attemptCount > 1 && (
                            <span className="text-sm text-rock-500">
                              {climb.attemptCount} attempts
                            </span>
                          )}
                        </div>
                        {climb.comments && (
                          <p className="mt-3 text-sm text-rock-600 italic">
                            "{climb.comments}"
                          </p>
                        )}
                      </CardBody>
                    </Card>
                  ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      <Modal
        isOpen={showClimbModal}
        onClose={() => setShowClimbModal(false)}
        title="Log Climb"
        size="lg"
      >
        <ClimbForm
          routes={[route]}
          defaultRouteId={route.id}
          onSubmit={handleLogClimb}
          onCancel={() => setShowClimbModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingClimb}
        onClose={() => setEditingClimb(null)}
        title="Edit Climb"
        size="lg"
      >
        <ClimbForm
          climb={editingClimb}
          routes={[route]}
          defaultRouteId={route.id}
          onSubmit={handleUpdateClimb}
          onCancel={() => setEditingClimb(null)}
        />
      </Modal>

      <Modal
        isOpen={!!deleteClimbConfirm}
        onClose={() => setDeleteClimbConfirm(null)}
        title="Delete Climb"
      >
        <p className="text-rock-600 mb-4">
          Are you sure you want to delete this climb from {formatDate(deleteClimbConfirm?.date || '')}?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteClimbConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteClimb}>
            Delete
          </Button>
        </div>
      </Modal>

      <Modal
        isOpen={showDeleteRoute}
        onClose={() => setShowDeleteRoute(false)}
        title="Delete Route"
      >
        <p className="text-rock-600 mb-4">
          Are you sure you want to delete "{route.name}"? This will also delete all {climbs.length} climbs on this route.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setShowDeleteRoute(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRoute}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
