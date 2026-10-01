import { useState, useEffect, useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { Climb, Route, ClimbType } from '@/types/models'
import { CreateClimbRequest, UpdateClimbRequest } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import RoutePicker from './RoutePicker'
import { getLastClimbType } from '@/utils/prefs'
import Textarea from '@/components/ui/Textarea'
import EmptyState from '@/components/ui/EmptyState'
import { InlineSpinner } from '@/components/ui/Spinner'
import { Star, Route as RouteIcon, Plus } from 'lucide-react'
import { formatDateISO } from '@/utils/formatters'
import { calculatePoints } from '@/utils/points'
import { CLIMB_TYPE_OPTIONS } from '@/utils/colors'

interface ClimbFormProps {
  climb?: Climb | null
  routes: Route[]
  defaultRouteId?: string
  onSubmit: (data: CreateClimbRequest) => Promise<void>
  onCancel: () => void
  /** While true and no routes are known yet, show a spinner instead of the empty state. */
  routesLoading?: boolean
  /** Style to preselect for a new climb (defaults to the last style used). */
  defaultClimbType?: ClimbType
  recentRouteIds?: string[]
  preferredLocationId?: string | null
  /** Enables "New route" in the picker. */
  onCreateRoute?: (nameHint: string) => void
}

const TYPE_HINTS: Partial<Record<ClimbType, string>> = {
  OS: 'First try, no beta',
  FLASH: 'First try, with beta',
  RP: 'Clean lead after practice',
  PP: 'Lead on pre-placed draws',
  TRY: "Didn't send (yet)",
}

export default function ClimbForm({
  climb,
  routes,
  defaultRouteId,
  onSubmit,
  onCancel,
  routesLoading,
  defaultClimbType,
  recentRouteIds,
  preferredLocationId,
  onCreateRoute,
}: ClimbFormProps) {
  // The modal unmounts this form when closed, so props are read once on
  // mount. Re-syncing on every new `routes` array wiped in-progress edits.
  // New climbs start with no route unless one was given, so the picker opens.
  const [routeId, setRouteId] = useState(() => climb?.routeId ?? defaultRouteId ?? '')
  const [date, setDate] = useState(() => formatDateISO(climb ? new Date(climb.date) : new Date()))
  const [climbType, setClimbType] = useState<ClimbType>(() => climb?.climbType ?? defaultClimbType ?? getLastClimbType())
  const [attemptCount, setAttemptCount] = useState(String(climb?.attemptCount ?? 1))
  const [personalRating, setPersonalRating] = useState(climb?.personalRating ?? 0)
  const [comments, setComments] = useState(climb?.comments ?? '')
  const [isLoading, setIsLoading] = useState(false)

  // A default route may only appear in the list once routes have loaded,
  // or change later (a route just created from the picker); adopt each new
  // default once, without overriding the user's later picks.
  const appliedDefaultRef = useRef<string | undefined>(climb ? undefined : defaultRouteId)
  useEffect(() => {
    if (climb || !defaultRouteId || appliedDefaultRef.current === defaultRouteId && routeId) return
    if (routes.some((r) => r.id === defaultRouteId)) {
      appliedDefaultRef.current = defaultRouteId
      setRouteId(defaultRouteId)
    }
  }, [climb, routeId, routes, defaultRouteId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const attempts = attemptCount ? Math.max(1, parseInt(attemptCount, 10) || 1) : undefined

    try {
      if (climb) {
        // Update: routeId is intentionally omitted (a climb stays on its
        // route), and null clears a rating/comment the user removed.
        const update: UpdateClimbRequest = {
          date,
          climbType,
          attemptCount: attempts,
          personalRating: personalRating || null,
          comments: comments || null,
        }
        await onSubmit(update as CreateClimbRequest)
      } else {
        await onSubmit({
          routeId,
          date,
          climbType,
          attemptCount: attempts,
          personalRating: personalRating || undefined,
          comments: comments || undefined,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Editing a climb whose route is no longer in the (active-only) list:
  // still show it so the picker isn't blank.
  const pickerRoutes = useMemo(
    () =>
      climb?.route && !routes.some((r) => r.id === climb.routeId)
        ? [climb.route as Route, ...routes]
        : routes,
    [climb, routes]
  )

  const selectedRoute = pickerRoutes.find((r) => r.id === routeId)
  const estimatedPoints = selectedRoute
    ? calculatePoints(selectedRoute.difficultyFrench, climbType)
    : 0

  if (!climb && routes.length === 0 && routesLoading) {
    return <InlineSpinner height={160} />
  }

  if (!climb && routes.length === 0) {
    return (
      <EmptyState
        compact
        icon={RouteIcon}
        title="No routes to log yet"
        message="Climbs are logged against a route. Create one to get started."
        action={
          <div className="flex flex-col sm:flex-row gap-2">
            {onCreateRoute ? (
              <Button onClick={() => onCreateRoute('')}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                Create a route
              </Button>
            ) : (
              <Link to="/routes" onClick={onCancel} className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-carabiner text-white font-medium hover:bg-carabiner-dark">
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add a route
              </Link>
            )}
            <Button variant="secondary" onClick={onCancel}>Close</Button>
          </div>
        }
      />
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <RoutePicker
        routes={pickerRoutes}
        value={routeId}
        onChange={setRouteId}
        recentRouteIds={recentRouteIds}
        preferredLocationId={preferredLocationId}
        onCreateNew={climb ? undefined : onCreateRoute}
        disabled={!!climb}
      />

      <fieldset>
        <legend className="block text-sm font-medium text-rock-700 mb-1.5">Style</legend>
        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 sm:grid-cols-4 gap-2">
          {CLIMB_TYPE_OPTIONS.map((opt) => {
            const selected = climbType === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                title={TYPE_HINTS[opt.value]}
                onClick={() => setClimbType(opt.value)}
                className={`px-2 py-2 rounded-lg border text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-carabiner text-white border-carabiner'
                    : 'bg-white text-rock-700 border-rock-300 hover:border-carabiner hover:text-carabiner'
                }`}
              >
                {opt.label}
              </button>
            )
          })}
        </div>
        {TYPE_HINTS[climbType] && (
          <p className="mt-1.5 text-xs text-rock-500">{TYPE_HINTS[climbType]}</p>
        )}
      </fieldset>

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4">
        <Input
          label="Date"
          type="date"
          value={date}
          max={formatDateISO(new Date())}
          onChange={(e) => setDate(e.target.value)}
          required
        />
        <Input
          label="Attempts"
          type="number"
          inputMode="numeric"
          min="1"
          value={attemptCount}
          onChange={(e) => setAttemptCount(e.target.value)}
        />
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-rock-700 mb-1">Your rating</legend>
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setPersonalRating(star === personalRating ? 0 : star)}
              aria-label={`${star} star${star > 1 ? 's' : ''}`}
              aria-pressed={star <= personalRating}
              className="p-1.5 rounded-lg hover:bg-rock-100"
            >
              <Star
                aria-hidden="true"
                className={`w-6 h-6 ${
                  star <= personalRating
                    ? 'text-yellow-500 fill-yellow-500'
                    : 'text-rock-300'
                }`}
              />
            </button>
          ))}
          {personalRating > 0 && (
            <button
              type="button"
              onClick={() => setPersonalRating(0)}
              className="ml-2 text-xs text-rock-500 hover:text-rock-700 underline"
            >
              Clear
            </button>
          )}
        </div>
      </fieldset>

      <Textarea
        label="Notes"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        placeholder="Beta, conditions, how it felt…"
      />

      {estimatedPoints > 0 && (
        <div className="p-3 bg-send-light border border-send/20 rounded-lg text-center">
          <span className="text-sm text-rock-600">Estimated points: </span>
          <span className="font-bold text-send">+{estimatedPoints}</span>
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" variant="success" isLoading={isLoading} disabled={!routeId}>
          {climb ? 'Save changes' : 'Log climb'}
        </Button>
      </div>
    </form>
  )
}
