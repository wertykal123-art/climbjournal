import { ReactNode } from 'react'
import { LucideIcon, AlertTriangle, RefreshCw } from 'lucide-react'
import Button from './Button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  message?: ReactNode
  action?: ReactNode
  compact?: boolean
  className?: string
}

export default function EmptyState({ icon: Icon, title, message, action, compact, className = '' }: EmptyStateProps) {
  return (
    <div className={`flex flex-col items-center text-center ${compact ? 'py-8 px-4' : 'py-12 px-4'} ${className}`}>
      {Icon && (
        <div className={`rounded-full bg-rock-100 flex items-center justify-center mb-3 ${compact ? 'w-12 h-12' : 'w-16 h-16'}`}>
          <Icon className={`text-rock-400 ${compact ? 'w-6 h-6' : 'w-8 h-8'}`} aria-hidden="true" />
        </div>
      )}
      <h3 className="text-base sm:text-lg font-medium text-rock-900">{title}</h3>
      {message && <p className="mt-1 text-sm text-rock-500 max-w-sm">{message}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  )
}

export function ErrorState({
  message = "We couldn't load this. Check your connection and try again.",
  onRetry,
  compact,
}: {
  message?: string
  onRetry?: () => void
  compact?: boolean
}) {
  return (
    <EmptyState
      icon={AlertTriangle}
      title="Something went wrong"
      message={message}
      compact={compact}
      action={
        onRetry && (
          <Button variant="secondary" size="sm" onClick={onRetry}>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Try again
          </Button>
        )
      }
    />
  )
}
