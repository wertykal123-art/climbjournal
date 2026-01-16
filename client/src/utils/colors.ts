import { ClimbType } from '@/types/models'

export function getGradeColor(grade: string): string {
  const gradeNum = grade.replace(/[+\-]/g, '')

  if (gradeNum === '4' || gradeNum === '5a' || gradeNum === '5b') {
    return 'bg-green-500 text-white'
  }
  if (gradeNum === '5c' || gradeNum === '6a') {
    return 'bg-yellow-500 text-rock-900'
  }
  if (gradeNum === '6b' || gradeNum === '6c') {
    return 'bg-orange-500 text-white'
  }
  if (gradeNum === '7a' || gradeNum === '7b') {
    return 'bg-red-500 text-white'
  }
  if (gradeNum === '7c' || gradeNum === '8a') {
    return 'bg-purple-600 text-white'
  }
  return 'bg-rock-900 text-white'
}

export function getGradeColorHex(grade: string): string {
  const gradeNum = grade.replace(/[+\-]/g, '')

  if (gradeNum === '4' || gradeNum === '5a' || gradeNum === '5b') {
    return '#22c55e' // green-500
  }
  if (gradeNum === '5c' || gradeNum === '6a') {
    return '#eab308' // yellow-500
  }
  if (gradeNum === '6b' || gradeNum === '6c') {
    return '#f97316' // orange-500
  }
  if (gradeNum === '7a' || gradeNum === '7b') {
    return '#ef4444' // red-500
  }
  if (gradeNum === '7c' || gradeNum === '8a') {
    return '#9333ea' // purple-600
  }
  return '#0f172a' // rock-900
}

export const CLIMB_TYPE_COLORS: Record<ClimbType, string> = {
  OS: 'bg-yellow-500 text-yellow-900',
  FLASH: 'bg-gray-300 text-gray-800',
  RP: 'bg-orange-700 text-orange-50',
  PP: 'bg-blue-500 text-white',
  TOPROPE: 'bg-gray-500 text-white',
  AUTOBELAY: 'bg-gray-400 text-gray-900',
  TRY: 'bg-white border-2 border-gray-400 text-gray-600',
}

export const CLIMB_TYPE_LABELS: Record<ClimbType, string> = {
  OS: 'On-Sight',
  FLASH: 'Flash',
  RP: 'Redpoint',
  PP: 'Pinkpoint',
  TOPROPE: 'Top Rope',
  AUTOBELAY: 'Auto Belay',
  TRY: 'Attempt',
}

export function getClimbTypeColor(type: ClimbType): string {
  return CLIMB_TYPE_COLORS[type] || 'bg-gray-200 text-gray-800'
}

export function getClimbTypeLabel(type: ClimbType): string {
  return CLIMB_TYPE_LABELS[type] || type
}
