import { Link } from 'react-router-dom'
import { MapPin, Building2, Mountain, Route, MoreVertical, Pencil, Trash2, Globe, User } from 'lucide-react'
import { Location } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import { useState, useRef, useEffect } from 'react'
import { useAuth } from '@/context/AuthContext'

interface LocationCardProps {
  location: Location
  onEdit?: (location: Location) => void
  onDelete?: (location: Location) => void
}

export default function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
  const { user } = useAuth()
  const isOwner = user?.id === location.userId
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

  const Icon = location.type === 'GYM' ? Building2 : Mountain

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardBody>
        <div className="flex items-start justify-between">
          <Link to={`/locations/${location.id}`} className="flex-1">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${location.type === 'GYM' ? 'bg-blue-100 text-carabiner' : 'bg-green-100 text-send'}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-rock-900">{location.name}</h3>
                <p className="text-sm text-rock-500">{location.type === 'GYM' ? 'Gym' : 'Outdoor Crag'}</p>
              </div>
            </div>
          </Link>

          {isOwner && (onEdit || onDelete) && (
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
                        onEdit(location)
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
                        onDelete(location)
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
          )}
        </div>

        <div className="mt-4 flex items-center flex-wrap gap-x-4 gap-y-2 text-sm text-rock-600">
          {location.address && (
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span className="truncate">{location.address}</span>
            </div>
          )}
          <div className="flex items-center gap-1">
            <Route className="w-4 h-4" />
            <span>{location.routeCount || 0} routes</span>
          </div>
          {location.isPublic && (
            <div className="flex items-center gap-1 text-send">
              <Globe className="w-4 h-4" />
              <span>Public</span>
            </div>
          )}
          {!isOwner && location.user && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              <span>{location.user.displayName}</span>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
