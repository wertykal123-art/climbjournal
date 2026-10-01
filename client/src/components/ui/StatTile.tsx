import { ReactNode } from 'react'
import { LucideIcon } from 'lucide-react'

interface StatTileProps {
  label: string
  value: ReactNode
  icon?: LucideIcon
  iconClassName?: string
  hint?: ReactNode
}

export default function StatTile({ label, value, icon: Icon, iconClassName = 'bg-carabiner-light text-carabiner', hint }: StatTileProps) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-rock-200 p-3 sm:p-4 flex items-center gap-3 min-w-0">
      {Icon && (
        <div className={`hidden min-[400px]:flex w-10 h-10 rounded-lg items-center justify-center shrink-0 ${iconClassName}`}>
          <Icon className="w-5 h-5" aria-hidden="true" />
        </div>
      )}
      <div className="min-w-0">
        <p className="text-xs sm:text-sm text-rock-500 truncate">{label}</p>
        <p className="text-lg sm:text-xl font-bold text-rock-900 truncate">{value}</p>
        {hint && <p className="text-xs text-rock-500 truncate">{hint}</p>}
      </div>
    </div>
  )
}
