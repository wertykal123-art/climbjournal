import { Link } from 'react-router-dom'
import { MapPin, Building2, Mountain, Route, Pencil, Trash2, Globe, User } from 'lucide-react'
import { Location } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import DropdownMenu from '@/components/ui/DropdownMenu'
import { useAuth } from '@/context/AuthContext'

interface LocationCardProps {
  location: Location
  onEdit?: (location: Location) => void
  onDelete?: (location: Location) => void
}

export default function LocationCard({ location, onEdit, onDelete }: LocationCardProps) {
  const { user } = useAuth()
  const isOwner = user?.id === location.userId
  const Icon = location.type === 'GYM' ? Building2 : Mountain
  const routeCount = location.routeCount || 0

  return (
    <Card className="h-full hover:shadow-md transition-shadow">
      <CardBody className="!p-4">
        <div className="flex items-start gap-2">
          <Link to={`/locations/${location.id}`} className="flex-1 min-w-0 flex items-center gap-3 rounded-lg group">
            <div className={`p-2.5 rounded-lg shrink-0 ${location.type === 'GYM' ? 'bg-carabiner-light text-carabiner' : 'bg-send-light text-send'}`}>
              <Icon className="w-5 h-5" aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <h3 className="font-semibold text-rock-900 truncate group-hover:text-carabiner">{location.name}</h3>
              <p className="text-sm text-rock-500">{location.type === 'GYM' ? 'Indoor gym' : 'Outdoor crag'}</p>
            </div>
          </Link>

          <DropdownMenu
            label={`Actions for ${location.name}`}
            items={[
              { label: 'Edit', icon: Pencil, onSelect: () => onEdit?.(location), hidden: !isOwner || !onEdit },
              { label: 'Delete', icon: Trash2, danger: true, onSelect: () => onDelete?.(location), hidden: !isOwner || !onDelete },
            ]}
          />
        </div>

        <div className="mt-3 flex items-center flex-wrap gap-x-3 gap-y-2 text-sm text-rock-600">
          {location.address && (
            <span className="flex items-center gap-1 min-w-0 max-w-full">
              <MapPin className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{location.address}</span>
            </span>
          )}
          <span className="inline-flex items-center gap-1">
            <Route className="w-4 h-4" aria-hidden="true" />
            {routeCount} {routeCount === 1 ? 'route' : 'routes'}
          </span>
          {location.isPublic && (
            <span className="inline-flex items-center gap-1 text-send">
              <Globe className="w-4 h-4" aria-hidden="true" />
              Public
            </span>
          )}
          {!isOwner && location.user && (
            <span className="inline-flex items-center gap-1 min-w-0">
              <User className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span className="truncate">{location.user.displayName}</span>
            </span>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
