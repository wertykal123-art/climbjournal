import { SelectHTMLAttributes, forwardRef, useId } from 'react'
import { fieldClasses } from './Input'

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  options: Array<{ value: string; label: string }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', label, error, id, options, ...props }, ref) => {
    const generatedId = useId()
    const selectId = id || generatedId

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={selectId} className="block text-sm font-medium text-rock-700 mb-1">
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${selectId}-error` : undefined}
          className={`${fieldClasses(!!error)} truncate ${className}`}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {error && <p id={`${selectId}-error`} className="mt-1 text-sm text-fall">{error}</p>}
      </div>
    )
  }
)

Select.displayName = 'Select'

export default Select
