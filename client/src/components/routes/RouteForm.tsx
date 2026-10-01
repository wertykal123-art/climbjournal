import { useState, useEffect, useMemo } from 'react'
import { Check } from 'lucide-react'
import { Route, Location, StoneType } from '@/types/models'
import { CreateRouteRequest, UpdateRouteRequest } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { STONE_TYPE_OPTIONS } from '@/utils/colors'
import { getGradeOptionsForSystem } from '@/utils/grades'
import { useGradingSystem } from '@/hooks/useGradingSystem'

const PRESET_COLORS: { hex: string; name: string }[] = [
  { hex: '#EF4444', name: 'Red' },
  { hex: '#F97316', name: 'Orange' },
  { hex: '#EAB308', name: 'Yellow' },
  { hex: '#22C55E', name: 'Green' },
  { hex: '#3B82F6', name: 'Blue' },
  { hex: '#8B5CF6', name: 'Purple' },
  { hex: '#EC4899', name: 'Pink' },
  { hex: '#FFFFFF', name: 'White' },
  { hex: '#000000', name: 'Black' },
  { hex: '#6B7280', name: 'Gray' },
]
const PRESET_HEXES = PRESET_COLORS.map((c) => c.hex)

interface RouteFormProps {
  route?: Route | null
  locations: Location[]
  defaultLocationId?: string
  onSubmit: (data: CreateRouteRequest) => Promise<void>
  onCancel: () => void
  /** Prefill the name of a new route. */
  initialName?: string
  submitLabel?: string
}

export default function RouteForm({ route, locations, defaultLocationId, onSubmit, onCancel, initialName, submitLabel }: RouteFormProps) {
  // The modal unmounts the form on close, so props are read once on mount.
  // (Re-syncing on every new `locations` array wiped in-progress edits.)
  const [locationId, setLocationId] = useState(() => route?.locationId ?? defaultLocationId ?? locations[0]?.id ?? '')
  const [name, setName] = useState(route?.name ?? initialName ?? '')
  const [difficultyFrench, setDifficultyFrench] = useState(route?.difficultyFrench ?? '6a')
  const [visualId, setVisualId] = useState(route?.visualId ?? '')
  const [setter, setSetter] = useState(route?.setter ?? '')
  const [heightMeters, setHeightMeters] = useState(route?.heightMeters?.toString() ?? '')
  const [description, setDescription] = useState(route?.description ?? '')
  const [color, setColor] = useState(route?.color ?? '')
  const [stoneType, setStoneType] = useState<StoneType | ''>(route?.stoneType ?? '')
  const [isPublic, setIsPublic] = useState(route?.isPublic ?? false)
  const [isLoading, setIsLoading] = useState(false)

  const { getEffectiveSystem } = useGradingSystem()

  const selectedLocation = useMemo(
    () => locations.find((l) => l.id === locationId) || null,
    [locations, locationId]
  )

  const effectiveSystem = getEffectiveSystem(selectedLocation)
  const gradeOptions = useMemo(
    () => getGradeOptionsForSystem(effectiveSystem),
    [effectiveSystem]
  )

  // Locations may arrive after the form opens; pick a default once they do.
  useEffect(() => {
    if (!locationId && locations.length > 0) {
      setLocationId(defaultLocationId ?? locations[0].id)
    }
  }, [locationId, locations, defaultLocationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (route) {
        // Update: send null for emptied fields so they are actually cleared
        // (undefined would leave the old value in place).
        const update: UpdateRouteRequest = {
          locationId,
          name,
          difficultyFrench,
          visualId: visualId || null,
          setter: setter || null,
          heightMeters: heightMeters ? parseFloat(heightMeters) : null,
          description: description || null,
          color: color || null,
          stoneType: stoneType || null,
          isPublic,
        }
        await onSubmit(update as CreateRouteRequest)
      } else {
        await onSubmit({
          locationId,
          name,
          difficultyFrench,
          visualId: visualId || undefined,
          setter: setter || undefined,
          heightMeters: heightMeters ? parseFloat(heightMeters) : undefined,
          description: description || undefined,
          color: color || undefined,
          stoneType: stoneType || undefined,
          isPublic,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const locationOptions = locations.map((l) => ({ value: l.id, label: l.name }))

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Select
        label="Location"
        value={locationId}
        onChange={(e) => setLocationId(e.target.value)}
        options={locationOptions}
        required
      />

      <Input
        label="Route Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={200}
        placeholder="e.g., Crimpy Corner"
      />

      <Select
        label={`Grade (${effectiveSystem === 'UIAA' ? 'UIAA' : 'French'})`}
        value={difficultyFrench}
        onChange={(e) => setDifficultyFrench(e.target.value)}
        options={gradeOptions}
      />

      <div className="grid grid-cols-1 min-[400px]:grid-cols-2 gap-4">
        <Input
          label="Visual ID"
          value={visualId}
          onChange={(e) => setVisualId(e.target.value)}
          placeholder="e.g., Blue 12, Red Corner"
        />

        <Input
          label="Height (m)"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.1"
          value={heightMeters}
          onChange={(e) => setHeightMeters(e.target.value)}
          placeholder="e.g., 12.5"
        />
      </div>

      <Input
        label="Setter"
        value={setter}
        onChange={(e) => setSetter(e.target.value)}
        placeholder="Route setter name"
      />

      {selectedLocation?.type === 'GYM' && (
        <fieldset>
          <legend className="block text-sm font-medium text-rock-700 mb-2">Hold color</legend>
          <div className="flex flex-wrap items-center gap-2">
            {PRESET_COLORS.map((preset) => {
              const selected = color.toUpperCase() === preset.hex
              return (
                <button
                  key={preset.hex}
                  type="button"
                  onClick={() => setColor(selected ? '' : preset.hex)}
                  aria-label={preset.name}
                  aria-pressed={selected}
                  title={preset.name}
                  className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-transform ${
                    selected
                      ? 'border-carabiner ring-2 ring-carabiner ring-offset-2'
                      : 'border-rock-300 hover:scale-105'
                  }`}
                  style={{ backgroundColor: preset.hex }}
                >
                  {selected && (
                    <Check
                      className={`w-4 h-4 ${['#FFFFFF', '#EAB308'].includes(preset.hex) ? 'text-rock-900' : 'text-white'}`}
                      aria-hidden="true"
                    />
                  )}
                </button>
              )
            })}
            <label
              title="Custom color"
              className={`relative w-9 h-9 rounded-full border-2 flex items-center justify-center cursor-pointer focus-within:ring-2 focus-within:ring-carabiner focus-within:ring-offset-2 ${
                color && !PRESET_HEXES.includes(color.toUpperCase())
                  ? 'border-carabiner ring-2 ring-carabiner ring-offset-2'
                  : 'border-dashed border-rock-400'
              }`}
              style={{ backgroundColor: color && !PRESET_HEXES.includes(color.toUpperCase()) ? color : '#F1F5F9' }}
            >
              <input
                type="color"
                aria-label="Custom hold color"
                value={color || '#3B82F6'}
                onChange={(e) => setColor(e.target.value)}
                className="absolute inset-0 w-full h-full rounded-full cursor-pointer opacity-0"
              />
              {(!color || PRESET_HEXES.includes(color.toUpperCase())) && (
                <span className="text-sm text-rock-500" aria-hidden="true">+</span>
              )}
            </label>
            {color && (
              <button
                type="button"
                onClick={() => setColor('')}
                className="text-xs text-rock-500 hover:text-rock-700 underline ml-1"
              >
                Clear
              </button>
            )}
          </div>
        </fieldset>
      )}

      {selectedLocation?.type === 'CRAG' && (
        <Select
          label="Stone Type"
          value={stoneType}
          onChange={(e) => setStoneType(e.target.value as StoneType | '')}
          options={[
            { value: '', label: 'Select stone type...' },
            ...STONE_TYPE_OPTIONS,
          ]}
        />
      )}

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Beta, notes about the route…"
      />

      <label className="flex items-start gap-3 p-3 rounded-lg border border-rock-200 cursor-pointer hover:bg-rock-50">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-carabiner border-rock-300 rounded focus:ring-carabiner"
        />
        <span className="text-sm">
          <span className="font-medium text-rock-800">Public route</span>
          <span className="block text-rock-500">Visible to all users.</span>
        </span>
      </label>

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading} disabled={!locationId}>
          {submitLabel ?? (route ? 'Save changes' : 'Create route')}
        </Button>
      </div>
    </form>
  )
}
