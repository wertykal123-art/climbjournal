import { Link } from 'react-router-dom'
import { Route as RouteIcon, Pencil, Trash2, CheckCircle, Globe, User, Mountain, RotateCcw, Ban } from 'lucide-react'
import { Route } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import DropdownMenu from '@/components/ui/DropdownMenu'
import GradeBadge from './GradeBadge'
import { useAuth } from '@/context/AuthContext'
import { useGradingSystem } from '@/hooks/useGradingSystem'
import { getStoneTypeLabel } from '@/utils/colors'

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
  const isReset = route.isActive === false
  const climbCount = route.climbCount || 0

  return (
    <Card
      className={`h-full hover:shadow-md transition-shadow ${isReset ? 'opacity-70' : ''}`}
      style={route.color ? {
        background: `linear-gradient(135deg, ${route.color}30 0%, ${route.color}15 50%, white 100%)`,
      } : undefined}
    >
      <CardBody className="!p-4">
        <div className="flex items-start gap-2">
          <Link to={`/routes/${route.id}`} className="flex-1 min-w-0 flex items-center gap-3 rounded-lg group">
            <GradeBadge grade={route.difficultyFrench} size="lg" system={getGradeBadgeSystem(route.location)} />
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-semibold text-rock-900 truncate group-hover:text-carabiner">{route.name}</h3>
                {route.color && (
                  <span
                    className="w-3.5 h-3.5 rounded-full border border-rock-300 shrink-0"
                    style={{ backgroundColor: route.color }}
                    aria-hidden="true"
                  />
                )}
              </div>
              {route.location && (
                <p className="text-sm text-rock-500 truncate">{route.location.name}</p>
              )}
            </div>
          </Link>

          <DropdownMenu
            label={`Actions for ${route.name}`}
            items={[
              { label: 'Log climb', icon: CheckCircle, onSelect: () => onLogClimb?.(route), hidden: !onLogClimb || isReset },
              { label: 'Mark as reset', icon: Ban, onSelect: () => onReset?.(route), hidden: !hasEditPermission || !onReset || isReset },
              { label: 'Edit', icon: Pencil, onSelect: () => onEdit?.(route), hidden: !hasEditPermission || !onEdit },
              { label: 'Delete', icon: Trash2, danger: true, onSelect: () => onDelete?.(route), hidden: !hasEditPermission || !onDelete },
            ]}
          />
        </div>

        <div className="mt-3 flex items-center flex-wrap gap-x-3 gap-y-2 text-sm text-rock-600">
          {isReset && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-rock-200 rounded text-rock-600">
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              Reset
            </span>
          )}
          {route.visualId && (
            <span className="px-2 py-0.5 bg-rock-100 rounded text-rock-700 max-w-full truncate">
              {route.visualId}
            </span>
          )}
          {route.stoneType && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 rounded text-amber-800">
              <Mountain className="w-3.5 h-3.5" aria-hidden="true" />
              {getStoneTypeLabel(route.stoneType)}
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <RouteIcon className="w-4 h-4" aria-hidden="true" />
            {climbCount} {climbCount === 1 ? 'climb' : 'climbs'}
          </span>
          {route.isPublic && (
            <span className="inline-flex items-center gap-1 text-send">
              <Globe className="w-4 h-4" aria-hidden="true" />
              Public
            </span>
          )}
          {route.setter && <span className="truncate max-w-full">Set by {route.setter}</span>}
          {!isOwner && route.user && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <User className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{route.user.displayName}</span>
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
