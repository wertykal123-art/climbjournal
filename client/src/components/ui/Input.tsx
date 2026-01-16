import { InputHTMLAttributes, forwardRef } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', label, error, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s/g, '-')

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-rock-700 mb-1">
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors ${
            error
              ? 'border-fall focus:ring-fall'
              : 'border-rock-300 focus:ring-carabiner'
          } ${className}`}
          {...props}
        />
        {error && <p className="mt-1 text-sm text-fall">{error}</p>}
      </div>
    )
  }
)

Input.displayName = 'Input'

export default Input
