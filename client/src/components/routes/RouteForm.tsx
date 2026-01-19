import { useState, useEffect, useMemo } from 'react'
import { Route, Location, StoneType } from '@/types/models'
import { CreateRouteRequest } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { getGradeOptionsForSystem } from '@/utils/grades'
import { useGradingSystem } from '@/hooks/useGradingSystem'

const STONE_TYPE_OPTIONS: { value: StoneType; label: string }[] = [
  { value: 'GRANITE', label: 'Granite' },
  { value: 'LIMESTONE', label: 'Limestone' },
  { value: 'SANDSTONE', label: 'Sandstone' },
  { value: 'GNEISS', label: 'Gneiss' },
  { value: 'BASALT', label: 'Basalt' },
  { value: 'CONGLOMERATE', label: 'Conglomerate' },
  { value: 'QUARTZITE', label: 'Quartzite' },
  { value: 'SLATE', label: 'Slate' },
  { value: 'SCHIST', label: 'Schist' },
  { value: 'TUFF', label: 'Tuff' },
  { value: 'OTHER', label: 'Other' },
]

const PRESET_COLORS = [
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
  '#FFFFFF', // White
  '#000000', // Black
  '#6B7280', // Gray
]

interface RouteFormProps {
  route?: Route | null
  locations: Location[]
  defaultLocationId?: string
  onSubmit: (data: CreateRouteRequest) => Promise<void>
  onCancel: () => void
}

export default function RouteForm({ route, locations, defaultLocationId, onSubmit, onCancel }: RouteFormProps) {
  const [locationId, setLocationId] = useState('')
  const [name, setName] = useState('')
  const [difficultyFrench, setDifficultyFrench] = useState('6a')
  const [visualId, setVisualId] = useState('')
  const [setter, setSetter] = useState('')
  const [heightMeters, setHeightMeters] = useState('')
  const [description, setDescription] = useState('')
  const [color, setColor] = useState('')
  const [stoneType, setStoneType] = useState<StoneType | ''>('')
  const [isPublic, setIsPublic] = useState(false)
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

  useEffect(() => {
    if (route) {
      setLocationId(route.locationId)
      setName(route.name)
      setDifficultyFrench(route.difficultyFrench)
      setVisualId(route.visualId || '')
      setSetter(route.setter || '')
      setHeightMeters(route.heightMeters?.toString() || '')
      setDescription(route.description || '')
      setColor(route.color || '')
      setStoneType(route.stoneType || '')
      setIsPublic(route.isPublic || false)
    } else if (defaultLocationId) {
      setLocationId(defaultLocationId)
    } else if (locations.length > 0) {
      setLocationId(locations[0].id)
    }
  }, [route, locations, defaultLocationId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
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
        placeholder="e.g., Crimpy Corner"
      />

      <Select
        label={`Grade (${effectiveSystem === 'UIAA' ? 'UIAA' : 'French'})`}
        value={difficultyFrench}
        onChange={(e) => setDifficultyFrench(e.target.value)}
        options={gradeOptions}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Visual ID"
          value={visualId}
          onChange={(e) => setVisualId(e.target.value)}
          placeholder="e.g., Blue 12, Red Corner"
        />

        <Input
          label="Height (m)"
          type="number"
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
        <div>
          <label className="block text-sm font-medium text-rock-700 mb-2">
            Hold Color
          </label>
          <div className="flex flex-wrap gap-2">
            {PRESET_COLORS.map((presetColor) => (
              <button
                key={presetColor}
                type="button"
                onClick={() => setColor(presetColor)}
                className={`w-8 h-8 rounded-full border-2 transition-transform ${
                  color === presetColor
                    ? 'border-carabiner scale-110 ring-2 ring-carabiner ring-offset-2'
                    : 'border-rock-300 hover:scale-105'
                }`}
                style={{ backgroundColor: presetColor }}
                title={presetColor}
              />
            ))}
            <div className="relative">
              <input
                type="color"
                value={color || '#3B82F6'}
                onChange={(e) => setColor(e.target.value)}
                className="w-8 h-8 rounded-full cursor-pointer opacity-0 absolute inset-0"
              />
              <div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                  color && !PRESET_COLORS.includes(color)
                    ? 'border-carabiner ring-2 ring-carabiner ring-offset-2'
                    : 'border-rock-300'
                }`}
                style={{ backgroundColor: color && !PRESET_COLORS.includes(color) ? color : '#E5E7EB' }}
              >
                {(!color || PRESET_COLORS.includes(color)) && (
                  <span className="text-xs text-rock-500">+</span>
                )}
              </div>
            </div>
            {color && (
              <button
                type="button"
                onClick={() => setColor('')}
                className="text-xs text-rock-500 hover:text-rock-700 self-center ml-2"
              >
                Clear
              </button>
            )}
          </div>
        </div>
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

      <div>
        <label className="block text-sm font-medium text-rock-700 mb-1">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-rock-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-carabiner focus:border-transparent"
          placeholder="Beta, notes about the route..."
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPublicRoute"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="w-4 h-4 text-carabiner border-rock-300 rounded focus:ring-carabiner"
        />
        <label htmlFor="isPublicRoute" className="text-sm text-rock-700">
          Make this route public (visible to all users)
        </label>
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {route ? 'Update' : 'Create'} Route
        </Button>
      </div>
    </form>
  )
}
