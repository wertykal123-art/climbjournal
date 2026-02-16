import { Climb } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import GradeBadge from '@/components/routes/GradeBadge'
import ClimbTypeBadge from './ClimbTypeBadge'
import { formatDate, formatPoints } from '@/utils/formatters'
import { Star, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useGradingSystem } from '@/hooks/useGradingSystem'

interface ClimbCardProps {
  climb: Climb
  onEdit?: (climb: Climb) => void
  onDelete?: (climb: Climb) => void
}

export default function ClimbCard({ climb, onEdit, onDelete }: ClimbCardProps) {
  const { getGradeBadgeSystem } = useGradingSystem()
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
      className="hover:shadow-md transition-shadow"
      style={climb.route?.color ? {
        background: `linear-gradient(135deg, ${climb.route.color}30 0%, ${climb.route.color}15 50%, transparent 100%)`,
      } : undefined}
    >
      <CardBody>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            {climb.route && (
              <GradeBadge grade={climb.route.difficultyFrench} size="lg" system={getGradeBadgeSystem(climb.route?.location)} />
            )}
            <div>
              <h3 className="font-semibold text-rock-900">{climb.route?.name}</h3>
              <p className="text-sm text-rock-500">
                {climb.route?.location?.name} - {formatDate(climb.date)}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <div className="font-bold text-lg text-send">
                +{formatPoints(climb.points)}
              </div>
              <div className="text-xs text-rock-500">points</div>
            </div>

            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="p-1 rounded-lg text-rock-400 hover:text-rock-600 hover:bg-rock-100"
              >
                <MoreVertical className="w-5 h-5" />
              </button>
              {showMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-lg shadow-lg border border-rock-200 py-1 z-10">
                  {onEdit && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onEdit(climb)
                      }}
                      className="flex items-center gap-2 w-full px-3 py-2 text-sm text-rock-700 hover:bg-rock-50"
                    >
                      <Pencil className="w-4 h-4" />
                      Edit
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => {
                        setShowMenu(false)
                        onDelete(climb)
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
  )
}
