import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'

interface PageHeaderProps {
  title: ReactNode
  subtitle?: ReactNode
  actions?: ReactNode
  backTo?: string
  backLabel?: string
  /** Content shown before the title (e.g. a grade badge or icon). */
  leading?: ReactNode
}

export default function PageHeader({ title, subtitle, actions, backTo, backLabel = 'Back', leading }: PageHeaderProps) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="flex items-start gap-2 sm:gap-3 min-w-0 flex-1 basis-60">
        {backTo && (
          <Link
            to={backTo}
            aria-label={backLabel}
            title={backLabel}
            className="p-2 -ml-2 rounded-lg text-rock-500 hover:text-rock-700 hover:bg-rock-100 transition-colors shrink-0"
          >
            <ArrowLeft className="w-5 h-5" aria-hidden="true" />
          </Link>
        )}
        {leading && <div className="shrink-0">{leading}</div>}
        <div className="min-w-0 flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-rock-900 break-words">{title}</h1>
          {subtitle && <div className="mt-0.5 text-sm sm:text-base text-rock-600">{subtitle}</div>}
        </div>
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}
