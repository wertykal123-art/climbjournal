import { ClimbType } from '@/types/models'
import { getClimbTypeColor, getClimbTypeLabel } from '@/utils/colors'

interface ClimbTypeBadgeProps {
  type: ClimbType
  size?: 'sm' | 'md' | 'lg'
}

export default function ClimbTypeBadge({ type, size = 'md' }: ClimbTypeBadgeProps) {
  const colorClass = getClimbTypeColor(type)

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${colorClass} ${sizes[size]}`}
    >
      {getClimbTypeLabel(type)}
    </span>
  )
}
