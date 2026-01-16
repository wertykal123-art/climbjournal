import { useState, useEffect } from 'react'
import { Climb, Route, ClimbType } from '@/types/models'
import { CreateClimbRequest } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { Star } from 'lucide-react'
import { formatDateISO } from '@/utils/formatters'
import { calculatePoints } from '@/utils/points'

interface ClimbFormProps {
  climb?: Climb | null
  routes: Route[]
  defaultRouteId?: string
  onSubmit: (data: CreateClimbRequest) => Promise<void>
  onCancel: () => void
}

const CLIMB_TYPES: { value: ClimbType; label: string }[] = [
  { value: 'OS', label: 'On-Sight' },
  { value: 'FLASH', label: 'Flash' },
  { value: 'RP', label: 'Redpoint' },
  { value: 'PP', label: 'Pinkpoint' },
  { value: 'TOPROPE', label: 'Top Rope' },
  { value: 'AUTOBELAY', label: 'Auto Belay' },
  { value: 'TRY', label: 'Attempt' },
]

export default function ClimbForm({ climb, routes, defaultRouteId, onSubmit, onCancel }: ClimbFormProps) {
  const [routeId, setRouteId] = useState('')
  const [date, setDate] = useState(formatDateISO(new Date()))
  const [climbType, setClimbType] = useState<ClimbType>('RP')
  const [attemptCount, setAttemptCount] = useState('1')
  const [personalRating, setPersonalRating] = useState(0)
  const [comments, setComments] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (climb) {
      setRouteId(climb.routeId)
      setDate(formatDateISO(new Date(climb.date)))
      setClimbType(climb.climbType)
      setAttemptCount(climb.attemptCount.toString())
      setPersonalRating(climb.personalRating || 0)
      setComments(climb.comments || '')
    } else if (defaultRouteId) {
      setRouteId(defaultRouteId)
    } else if (routes.length > 0) {
      setRouteId(routes[0].id)
    }
  }, [climb, routes, defaultRouteId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        routeId,
        date,
        climbType,
        attemptCount: parseInt(attemptCount, 10),
        personalRating: personalRating || undefined,
        comments: comments || undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  const selectedRoute = routes.find((r) => r.id === routeId)
  const estimatedPoints = selectedRoute
    ? calculatePoints(selectedRoute.difficultyFrench, climbType)
    : 0

  const routeOptions = routes.map((r) => ({
    value: r.id,
    label: `${r.name} (${r.difficultyFrench}) - ${r.location?.name || 'Unknown'}`,
  }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Route"
        value={routeId}
        onChange={(e) => setRouteId(e.target.value)}
        options={routeOptions}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          required
        />

        <Select
          label="Climb Type"
          value={climbType}
          onChange={(e) => setClimbType(e.target.value as ClimbType)}
          options={CLIMB_TYPES}
        />
      </div>

      <Input
        label="Attempt Count"
        type="number"
        min="1"
        value={attemptCount}
        onChange={(e) => setAttemptCount(e.target.value)}
      />

      <div>
        <label className="block text-sm font-medium text-rock-700 mb-1">
          Personal Rating
        </label>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setPersonalRating(star === personalRating ? 0 : star)}
              className="p-1"
            >
              <Star
                className={`w-6 h-6 ${
                  star <= personalRating
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-rock-300 hover:text-rock-400'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-rock-700 mb-1">
          Comments
        </label>
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-rock-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-carabiner focus:border-transparent"
          placeholder="Notes about your climb..."
        />
      </div>

      {estimatedPoints > 0 && (
        <div className="p-3 bg-send/10 rounded-lg text-center">
          <span className="text-sm text-rock-600">Estimated points: </span>
          <span className="font-bold text-send">+{estimatedPoints}</span>
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="success" isLoading={isLoading}>
          {climb ? 'Update' : 'Log'} Climb
        </Button>
      </div>
    </form>
  )
}
