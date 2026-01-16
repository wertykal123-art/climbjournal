import { useState, useEffect } from 'react'
import { Route, Location } from '@/types/models'
import { CreateRouteRequest } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { FRENCH_GRADES } from '@/utils/grades'

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
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (route) {
      setLocationId(route.locationId)
      setName(route.name)
      setDifficultyFrench(route.difficultyFrench)
      setVisualId(route.visualId || '')
      setSetter(route.setter || '')
      setHeightMeters(route.heightMeters?.toString() || '')
      setDescription(route.description || '')
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
      })
    } finally {
      setIsLoading(false)
    }
  }

  const gradeOptions = FRENCH_GRADES.map((g) => ({ value: g, label: g }))
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
        label="Grade (French)"
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
