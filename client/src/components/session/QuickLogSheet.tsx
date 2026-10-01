import { useState } from 'react'
import { Minus, Plus } from 'lucide-react'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import GradeBadge from '@/components/routes/GradeBadge'
import { ClimbType, Location, Route } from '@/types/models'
import { CLIMB_TYPE_OPTIONS } from '@/utils/colors'
import { calculatePoints } from '@/utils/points'
import { getLastClimbType } from '@/utils/prefs'
import { useGradingSystem } from '@/hooks/useGradingSystem'

interface QuickLogSheetProps {
  route: Route | null
  location: Pick<Location, 'defaultGradingSystem'> | null
  onClose: () => void
  onLog: (route: Route, climbType: ClimbType, attempts: number) => Promise<void>
  onMoreDetails: (route: Route, climbType: ClimbType) => void
}

/** Two-tap logging for sessions: pick a style, hit Log. */
export default function QuickLogSheet({ route, location, onClose, onLog, onMoreDetails }: QuickLogSheetProps) {
  return (
    <Modal isOpen={!!route} onClose={onClose} title={route ? `Log ${route.name}` : 'Log climb'} size="md">
      {route && (
        <QuickLogBody
          route={route}
          location={location}
          onClose={onClose}
          onLog={onLog}
          onMoreDetails={onMoreDetails}
        />
      )}
    </Modal>
  )
}

function QuickLogBody({ route, location, onLog, onMoreDetails }: Omit<QuickLogSheetProps, 'route'> & { route: Route }) {
  const { getGradeBadgeSystem } = useGradingSystem()
  const [climbType, setClimbType] = useState<ClimbType>(getLastClimbType)
  const [attempts, setAttempts] = useState(1)
  const [isLogging, setIsLogging] = useState(false)

  const points = calculatePoints(route.difficultyFrench, climbType)

  const submit = async () => {
    setIsLogging(true)
    try {
      await onLog(route, climbType, attempts)
    } finally {
      setIsLogging(false)
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <GradeBadge grade={route.difficultyFrench} size="lg" system={getGradeBadgeSystem(location as Location | null)} />
        <div className="min-w-0">
          <p className="font-semibold text-rock-900 truncate">{route.name}</p>
          {route.visualId && <p className="text-sm text-rock-500 truncate">{route.visualId}</p>}
        </div>
      </div>

      <fieldset>
        <legend className="block text-sm font-medium text-rock-700 mb-1.5">Style</legend>
        <div className="grid grid-cols-2 min-[400px]:grid-cols-3 gap-2">
          {CLIMB_TYPE_OPTIONS.map((opt) => {
            const selected = climbType === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setClimbType(opt.value)}
                className={`px-2 py-3 rounded-lg border text-sm font-medium transition-colors ${
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
      </fieldset>

      <div className="flex items-center justify-between gap-4">
        <span id="attempts-label" className="text-sm font-medium text-rock-700">Attempts</span>
        <div className="flex items-center gap-1" role="group" aria-labelledby="attempts-label">
          <Button
            variant="secondary"
            size="icon"
            aria-label="Fewer attempts"
            onClick={() => setAttempts((a) => Math.max(1, a - 1))}
            disabled={attempts <= 1}
          >
            <Minus className="w-4 h-4" aria-hidden="true" />
          </Button>
          <span className="w-10 text-center text-lg font-semibold tabular-nums" aria-live="polite">{attempts}</span>
          <Button variant="secondary" size="icon" aria-label="More attempts" onClick={() => setAttempts((a) => a + 1)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 pt-1">
        <Button variant="success" size="lg" onClick={submit} isLoading={isLogging} className="w-full">
          Log it · +{points} pts
        </Button>
        <button
          type="button"
          onClick={() => onMoreDetails(route, climbType)}
          className="text-sm text-rock-500 hover:text-rock-700 underline self-center"
          disabled={isLogging}
        >
          Add rating or notes
        </button>
      </div>
    </div>
  )
}
