import { X } from 'lucide-react'
import Select from '@/components/ui/Select'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { CLIMB_TYPE_OPTIONS } from '@/utils/colors'

export interface ClimbFilterValues {
  climbType: string
  from: string
  to: string
}

interface ClimbFiltersProps {
  values: ClimbFilterValues
  onChange: (values: ClimbFilterValues) => void
}

const TYPE_OPTIONS = [{ value: '', label: 'All types' }, ...CLIMB_TYPE_OPTIONS]

export default function ClimbFilters({ values, onChange }: ClimbFiltersProps) {
  const isFiltered = !!(values.climbType || values.from || values.to)

  return (
    <div className="grid grid-cols-2 sm:grid-cols-[minmax(0,12rem)_minmax(0,10rem)_minmax(0,10rem)_auto] gap-3 items-end">
      <div className="col-span-2 sm:col-span-1">
        <Select
          label="Type"
          value={values.climbType}
          onChange={(e) => onChange({ ...values, climbType: e.target.value })}
          options={TYPE_OPTIONS}
        />
      </div>
      <Input
        label="From"
        type="date"
        value={values.from}
        max={values.to || undefined}
        onChange={(e) => onChange({ ...values, from: e.target.value })}
      />
      <Input
        label="To"
        type="date"
        value={values.to}
        min={values.from || undefined}
        onChange={(e) => onChange({ ...values, to: e.target.value })}
      />
      {isFiltered && (
        <Button
          variant="ghost"
          size="sm"
          className="col-span-2 sm:col-span-1 justify-self-start sm:mb-1"
          onClick={() => onChange({ climbType: '', from: '', to: '' })}
        >
          <X className="w-4 h-4" aria-hidden="true" />
          Clear filters
        </Button>
      )}
    </div>
  )
}
