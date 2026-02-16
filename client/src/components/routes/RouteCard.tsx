import { Link } from 'react-router-dom'
import { Route as RouteIcon, MoreVertical, Pencil, Trash2, CheckCircle, Globe, User, Mountain, RotateCcw, Ban } from 'lucide-react'
import { Route, StoneType } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import GradeBadge from './GradeBadge'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useGradingSystem } from '@/hooks/useGradingSystem'

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

interface RouteCardProps {
  route: Route
  onEdit?: (route: Route) => void
  onDelete?: (route: Route) => void
  onLogClimb?: (route: Route) => void
  onReset?: (route: Route) => void
  canEdit?: boolean // Override for friend-based permissions
}

export default function RouteCard({ route, onEdit, onDelete, onLogClimb, onReset, canEdit }: RouteCardProps) {
  const { user } = useAuth()
  const { getGradeBadgeSystem } = useGradingSystem()
  const isOwner = user?.id === route.userId
  // Use canEdit prop if provided, otherwise fall back to isOwner
  const hasEditPermission = canEdit !== undefined ? canEdit : isOwner
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <Card
      className={`hover:shadow-md transition-shadow ${route.isActive === false ? 'opacity-60' : ''}`}
      style={route.color ? {
        background: `linear-gradient(135deg, ${route.color}30 0%, ${route.color}15 50%, transparent 100%)`,
      } : undefined}
    >
      <CardBody>
        <div className="flex items-start justify-between">
          <Link to={`/routes/${route.id}`} className="flex-1">
            <div className="flex items-center gap-3">
              <GradeBadge grade={route.difficultyFrench} size="lg" system={getGradeBadgeSystem(route.location)} />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-rock-900">{route.name}</h3>
                  {route.color && (
                    <span
                      className="w-4 h-4 rounded-full border border-rock-300 flex-shrink-0"
                      style={{ backgroundColor: route.color }}
                      title={`Hold color: ${route.color}`}
                    />
                  )}
                </div>
                {route.location && (
                  <p className="text-sm text-rock-500">{route.location.name}</p>
                )}
              </div>
            </div>
          </Link>

          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              className="p-1 rounded-lg text-rock-400 hover:text-rock-600 hover:bg-rock-100"
            >
              <MoreVertical className="w-5 h-5" />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-rock-200 py-1 z-10">
                {onLogClimb && route.isActive !== false && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onLogClimb(route)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-send hover:bg-rock-50"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Log Climb
                  </button>
                )}
                {hasEditPermission && onReset && route.isActive !== false && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onReset(route)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rock-700 hover:bg-rock-50"
                  >
                    <Ban className="w-4 h-4" />
                    Mark as Reset
                  </button>
                )}
                {hasEditPermission && onEdit && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onEdit(route)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rock-700 hover:bg-rock-50"
                  >
                    <Pencil className="w-4 h-4" />
                    Edit
                  </button>
                )}
                {hasEditPermission && onDelete && (
                  <button
                    onClick={() => {
                      setShowMenu(false)
                      onDelete(route)
                    }}
                    className="flex items-center gap-2 w-full px-3 py-2 text-sm text-fall hover:bg-rock-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-3 flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-rock-600">
          {route.isActive === false && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-rock-200 rounded text-rock-500">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </div>
          )}
          {route.visualId && (
            <span className="px-2 py-0.5 bg-rock-100 rounded text-rock-700">
              {route.visualId}
            </span>
          )}
          {route.stoneType && (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-amber-100 rounded text-amber-800">
              <Mountain className="w-3.5 h-3.5" />
              <span>{STONE_TYPE_LABELS[route.stoneType]}</span>
            </div>
          )}
          {route.setter && <span>Set by {route.setter}</span>}
          <div className="flex items-center gap-1">
            <RouteIcon className="w-4 h-4" />
            <span>{route.climbCount || 0} climbs</span>
          </div>
          {route.isPublic && (
            <div className="flex items-center gap-1 text-send">
              <Globe className="w-4 h-4" />
              <span>Public</span>
            </div>
          )}
          {!isOwner && route.user && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{route.user.displayName}</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
