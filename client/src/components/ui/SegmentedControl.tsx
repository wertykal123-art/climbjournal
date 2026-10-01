interface SegmentedControlProps<T extends string> {
  value: T
  onChange: (value: T) => void
  options: { value: T; label: string }[]
  label: string
  size?: 'sm' | 'md'
}

/** Pill-style single-choice toggle (tabs for short option lists). */
export default function SegmentedControl<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'sm',
}: SegmentedControlProps<T>) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="inline-flex max-w-full overflow-x-auto p-1 bg-rock-100 rounded-lg"
    >
      {options.map((opt) => {
        const selected = opt.value === value
        return (
          <button
            key={opt.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(opt.value)}
            className={`whitespace-nowrap rounded-md font-medium transition-colors ${
              size === 'sm' ? 'px-3 py-1 text-sm' : 'px-4 py-1.5 text-sm sm:text-base'
            } ${
              selected
                ? 'bg-white text-rock-900 shadow-sm'
                : 'text-rock-600 hover:text-rock-900'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}
