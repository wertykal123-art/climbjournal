import { InputHTMLAttributes, forwardRef, useId } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  hint?: string
}

export const fieldClasses = (hasError?: boolean) =>
  `w-full px-3 py-2 border rounded-lg bg-white text-rock-900 placeholder:text-rock-400 focus:outline-none focus:ring-2 focus:border-transparent transition-colors disabled:bg-rock-50 disabled:text-rock-500 disabled:cursor-not-allowed ${
    hasError ? 'border-fall focus:ring-fall' : 'border-rock-300 focus:ring-carabiner'
  }`

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, hint, id, ...props }, ref) => {
    const generatedId = useId()
    const inputId = id || generatedId
    const describedBy = error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-rock-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy}
          className={`${fieldClasses(!!error)} ${className}`}
          {...props}
        />
        {error ? (
          <p id={`${inputId}-error`} className="mt-1 text-sm text-fall">{error}</p>
        ) : hint ? (
          <p id={`${inputId}-hint`} className="mt-1 text-xs text-rock-500">{hint}</p>
        ) : null}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
