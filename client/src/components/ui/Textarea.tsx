import { TextareaHTMLAttributes, forwardRef, useId } from 'react'
import { fieldClasses } from './Input'

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className = '', label, error, id, rows = 3, ...props }, ref) => {
    const generatedId = useId()
    const textareaId = id || generatedId

    return (
      <div className="w-full min-w-0">
        {label && (
          <label htmlFor={textareaId} className="block text-sm font-medium text-rock-700 mb-1">
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          rows={rows}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${textareaId}-error` : undefined}
          className={`${fieldClasses(!!error)} resize-y ${className}`}
          {...props}
        />
        {error && <p id={`${textareaId}-error`} className="mt-1 text-sm text-fall">{error}</p>}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'

export default Textarea
