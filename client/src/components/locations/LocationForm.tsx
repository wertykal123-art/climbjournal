import { useState } from 'react'
import { Location, LocationType, GradingSystem } from '@/types/models'
import { CreateLocationRequest, UpdateLocationRequest } from '@/types/api'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import Textarea from '@/components/ui/Textarea'
import { Building2, Mountain } from 'lucide-react'

interface LocationFormProps {
  location?: Location | null
  onSubmit: (data: CreateLocationRequest) => Promise<void>
  onCancel: () => void
}

export default function LocationForm({ location, onSubmit, onCancel }: LocationFormProps) {
  // The modal unmounts the form on close, so initial state from props is enough.
  const [name, setName] = useState(location?.name ?? '')
  const [type, setType] = useState<LocationType>(location?.type ?? 'GYM')
  const [address, setAddress] = useState(location?.address ?? '')
  const [country, setCountry] = useState(location?.country ?? '')
  const [description, setDescription] = useState(location?.description ?? '')
  const [isPublic, setIsPublic] = useState(location?.isPublic ?? false)
  const [defaultGradingSystem, setDefaultGradingSystem] = useState<GradingSystem>(location?.defaultGradingSystem ?? 'FRENCH')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (location) {
        // null clears a field the user emptied; undefined would keep the old value.
        const update: UpdateLocationRequest = {
          name,
          type,
          address: address || null,
          country: country || null,
          description: description || null,
          isPublic,
          defaultGradingSystem,
        }
        await onSubmit(update as CreateLocationRequest)
      } else {
        await onSubmit({
          name,
          type,
          address: address || undefined,
          country: country || undefined,
          description: description || undefined,
          isPublic,
          defaultGradingSystem,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  const typeOptions: { value: LocationType; label: string; icon: typeof Building2 }[] = [
    { value: 'GYM', label: 'Indoor gym', icon: Building2 },
    { value: 'CRAG', label: 'Outdoor crag', icon: Mountain },
  ]

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Input
        label="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
        maxLength={200}
        placeholder="e.g., Boulder World"
      />

      <fieldset>
        <legend className="block text-sm font-medium text-rock-700 mb-1.5">Type</legend>
        <div className="grid grid-cols-2 gap-2">
          {typeOptions.map((opt) => {
            const selected = type === opt.value
            return (
              <button
                key={opt.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setType(opt.value)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg border text-sm font-medium transition-colors ${
                  selected
                    ? 'bg-carabiner text-white border-carabiner'
                    : 'bg-white text-rock-700 border-rock-300 hover:border-carabiner hover:text-carabiner'
                }`}
              >
                <opt.icon className="w-4 h-4" aria-hidden="true" />
                {opt.label}
              </button>
            )
          })}
        </div>
      </fieldset>

      <Select
        label="Default grading system"
        value={defaultGradingSystem}
        onChange={(e) => setDefaultGradingSystem(e.target.value as GradingSystem)}
        options={[
          { value: 'FRENCH', label: 'French (6a, 7b, …)' },
          { value: 'UIAA', label: 'UIAA (VI, VIII, …)' },
        ]}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </div>

      <Textarea
        label="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Notes about this location…"
      />

      <label className="flex items-start gap-3 p-3 rounded-lg border border-rock-200 cursor-pointer hover:bg-rock-50">
        <input
          type="checkbox"
          checked={isPublic}
          onChange={(e) => setIsPublic(e.target.checked)}
          className="mt-0.5 w-4 h-4 text-carabiner border-rock-300 rounded focus:ring-carabiner"
        />
        <span className="text-sm">
          <span className="font-medium text-rock-800">Public location</span>
          <span className="block text-rock-500">Anyone can see it and log climbs on its routes.</span>
        </span>
      </label>

      <div className="flex flex-col-reverse sm:flex-row gap-2 sm:gap-3 sm:justify-end pt-2">
        <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isLoading}>
          {location ? 'Save changes' : 'Create location'}
        </Button>
      </div>
    </form>
  )
}
