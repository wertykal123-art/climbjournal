import { useState, useEffect } from 'react'
import { Location, LocationType } from '@/types/models'
import { CreateLocationRequest } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'

interface LocationFormProps {
  location?: Location | null
  onSubmit: (data: CreateLocationRequest) => Promise<void>
  onCancel: () => void
}

export default function LocationForm({ location, onSubmit, onCancel }: LocationFormProps) {
  const [name, setName] = useState('')
  const [type, setType] = useState<LocationType>('GYM')
  const [address, setAddress] = useState('')
  const [country, setCountry] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (location) {
      setName(location.name)
      setType(location.type)
      setAddress(location.address || '')
      setCountry(location.country || '')
      setDescription(location.description || '')
    }
  }, [location])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      await onSubmit({
        name,
        type,
        address: address || undefined,
        country: country || undefined,
        description: description || undefined,
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        placeholder="e.g., Boulder World"
      />

      <Select
        label="Type"
        value={type}
        onChange={(e) => setType(e.target.value as LocationType)}
        options={[
          { value: 'GYM', label: 'Gym' },
          { value: 'CRAG', label: 'Outdoor Crag' },
        ]}
      />

      <Input
        label="Address"
        value={address}
        onChange={(e) => setAddress(e.target.value)}
        placeholder="Street address"
      />

      <Input
        label="Country"
        value={country}
        onChange={(e) => setCountry(e.target.value)}
        placeholder="e.g., Germany"
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
          placeholder="Notes about this location..."
        />
      </div>

      <div className="flex gap-3 justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {location ? 'Update' : 'Create'} Location
        </Button>
      </div>
    </form>
  )
}
