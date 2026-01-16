import { Link } from 'react-router-dom'
import { Route as RouteIcon, MoreVertical, Pencil, Trash2, CheckCircle } from 'lucide-react'
import { Route } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import GradeBadge from './GradeBadge'
import { useState, useRef, useEffect } from 'react'

interface RouteCardProps {
  route: Route
  onEdit?: (route: Route) => void
  onDelete?: (route: Route) => void
  onLogClimb?: (route: Route) => void
}

export default function RouteCard({ route, onEdit, onDelete, onLogClimb }: RouteCardProps) {
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
    <Card className="hover:shadow-md transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between">
          <Link to={`/routes/${route.id}`} className="flex-1">
            <div className="flex items-center gap-3">
              <GradeBadge grade={route.difficultyFrench} size="lg" />
              <div>
                <h3 className="font-semibold text-rock-900">{route.name}</h3>
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
                {onLogClimb && (
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
                {onEdit && (
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
                {onDelete && (
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

        <div className="mt-3 flex items-center gap-4 text-sm text-rock-600">
          {route.visualId && (
            <span className="px-2 py-0.5 bg-rock-100 rounded text-rock-700">
              {route.visualId}
            </span>
          )}
          {route.setter && <span>Set by {route.setter}</span>}
          <div className="flex items-center gap-1">
            <RouteIcon className="w-4 h-4" />
            <span>{route.climbCount || 0} climbs</span>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
