import { getGradeColor } from '@/utils/colors'
import { frenchToUIAA } from '@/utils/grades'

interface GradeBadgeProps {
  grade: string
  system?: 'french' | 'uiaa' | 'both'
  size?: 'sm' | 'md' | 'lg'
}

export default function GradeBadge({ grade, system = 'french', size = 'md' }: GradeBadgeProps) {
  const colorClass = getGradeColor(grade)

  const sizes = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-sm',
    lg: 'px-3 py-1.5 text-base',
  }

  const displayGrade = system === 'uiaa' ? frenchToUIAA(grade) : grade
  const showBoth = system === 'both'

  return (
    <span
      className={`inline-flex items-center font-semibold rounded-full ${colorClass} ${sizes[size]}`}
    >
      {displayGrade}
      {showBoth && (
        <span className="ml-1 opacity-75">({frenchToUIAA(grade)})</span>
      )}
    </span>
  )
}
