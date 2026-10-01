import { Link } from 'react-router-dom'
import { Climb } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import DropdownMenu from '@/components/ui/DropdownMenu'
import GradeBadge from '@/components/routes/GradeBadge'
import ClimbTypeBadge from './ClimbTypeBadge'
import { formatDate, formatPoints } from '@/utils/formatters'
import { Star, Pencil, Trash2, Repeat } from 'lucide-react'
import { useGradingSystem } from '@/hooks/useGradingSystem'

interface ClimbCardProps {
  climb: Climb
  onEdit?: (climb: Climb) => void
  onDelete?: (climb: Climb) => void
  /** Log the same route again (hidden for reset routes). */
  onLogAgain?: (climb: Climb) => void
  /** Show who logged it (friend activity feeds). */
  user?: { id: string; displayName: string }
  /** Hide the route/location line (e.g. on the route's own page). */
  hideRoute?: boolean
}

export function StarRating({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'md' }) {
  const cls = size === 'sm' ? 'w-4 h-4' : 'w-5 h-5'
  return (
    <span className="inline-flex items-center gap-0.5" role="img" aria-label={`Rated ${rating} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          aria-hidden="true"
          className={`${cls} ${i <= rating ? 'text-yellow-500 fill-yellow-500' : 'text-rock-300'}`}
        />
      ))}
    </span>
  )
}

export default function ClimbCard({ climb, onEdit, onDelete, onLogAgain, user, hideRoute }: ClimbCardProps) {
  const { getGradeBadgeSystem } = useGradingSystem()
  const color = climb.route?.color

  return (
    <Card
      className="hover:shadow-md transition-shadow"
      style={color ? {
        background: `linear-gradient(135deg, ${color}30 0%, ${color}15 50%, white 100%)`,
      } : undefined}
    >
      <CardBody className="!p-4">
        <div className="flex items-start gap-3">
          {climb.route && (
            <GradeBadge grade={climb.route.difficultyFrench} size="lg" system={getGradeBadgeSystem(climb.route?.location)} />
          )}
          <div className="min-w-0 flex-1">
            {!hideRoute && climb.route ? (
              <Link
                to={`/routes/${climb.routeId}`}
                className="block font-semibold text-rock-900 hover:text-carabiner truncate rounded"
              >
                {climb.route.name}
              </Link>
            ) : (
              <p className="font-semibold text-rock-900 truncate">{formatDate(climb.date)}</p>
            )}
            <p className="text-sm text-rock-500 truncate">
              {!hideRoute && climb.route?.location?.name && <>{climb.route.location.name} · </>}
              {hideRoute ? null : formatDate(climb.date)}
              {user && (
                <>
                  {!hideRoute && ' · '}
                  <Link to={`/friends/climbs/${user.id}`} className="text-carabiner hover:underline">
                    {user.displayName}
                  </Link>
                </>
              )}
            </p>
          </div>

          <div className="flex items-start gap-1 shrink-0">
            <div className="text-right">
              <div className="font-bold text-base sm:text-lg text-send leading-tight">
                +{formatPoints(climb.points)}
              </div>
              <div className="text-xs text-rock-500">pts</div>
            </div>

            <DropdownMenu
              label="Climb actions"
              items={[
                { label: 'Log again', icon: Repeat, onSelect: () => onLogAgain?.(climb), hidden: !onLogAgain || climb.route?.isActive === false },
                { label: 'Edit', icon: Pencil, onSelect: () => onEdit?.(climb), hidden: !onEdit },
                { label: 'Delete', icon: Trash2, danger: true, onSelect: () => onDelete?.(climb), hidden: !onDelete },
              ]}
            />
          </div>
        </div>

        <div className="mt-3 flex items-center gap-x-3 gap-y-2 flex-wrap">
          <ClimbTypeBadge type={climb.climbType} size="sm" />
          {climb.personalRating ? <StarRating rating={climb.personalRating} /> : null}
          {climb.attemptCount > 1 && (
            <span className="text-sm text-rock-500">{climb.attemptCount} attempts</span>
          )}
        </div>

        {climb.comments && (
          <p className="mt-3 text-sm text-rock-600 italic break-words">"{climb.comments}"</p>
        )}
      </CardBody>
    </Card>
  )
}
