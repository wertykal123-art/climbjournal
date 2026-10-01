import { Loader2 } from 'lucide-react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <span role="status" className="inline-flex">
      <Loader2 className={`animate-spin text-carabiner ${sizes[size]} ${className}`} aria-hidden="true" />
      <span className="sr-only">Loading…</span>
    </span>
  )
}

export function PageSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <Spinner size="lg" />
    </div>
  )
}

/** Spinner for use inside a card or chart area; fills the given height. */
export function InlineSpinner({ height = 200 }: { height?: number }) {
  return (
    <div className="flex items-center justify-center" style={{ height }}>
      <Spinner />
    </div>
  )
}
