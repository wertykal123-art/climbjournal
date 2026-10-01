import { ClimbType, StoneType } from '@/types/models'

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
  AUTOBELAY: 'bg-teal-100 text-teal-800',
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

export const CLIMB_TYPE_ORDER: ClimbType[] = ['OS', 'FLASH', 'RP', 'PP', 'TOPROPE', 'AUTOBELAY', 'TRY']

export const CLIMB_TYPE_OPTIONS: { value: ClimbType; label: string }[] = CLIMB_TYPE_ORDER.map((type) => ({
  value: type,
  label: CLIMB_TYPE_LABELS[type],
}))

/** Chart colours; every type gets a distinct hue. */
export const CLIMB_TYPE_HEX: Record<ClimbType, string> = {
  OS: '#EAB308', // gold
  FLASH: '#94A3B8', // silver
  RP: '#B45309', // bronze
  PP: '#3B82F6', // blue
  TOPROPE: '#475569', // slate
  AUTOBELAY: '#14B8A6', // teal
  TRY: '#CBD5E1', // light slate
}

export const STONE_TYPE_LABELS: Record<StoneType, string> = {
  GRANITE: 'Granite',
  LIMESTONE: 'Limestone',
  SANDSTONE: 'Sandstone',
  GNEISS: 'Gneiss',
  BASALT: 'Basalt',
  CONGLOMERATE: 'Conglomerate',
  QUARTZITE: 'Quartzite',
  SLATE: 'Slate',
  SCHIST: 'Schist',
  TUFF: 'Tuff',
  OTHER: 'Other',
}

export const STONE_TYPE_OPTIONS: { value: StoneType; label: string }[] = (
  Object.keys(STONE_TYPE_LABELS) as StoneType[]
).map((type) => ({ value: type, label: STONE_TYPE_LABELS[type] }))

export function getStoneTypeLabel(type: string): string {
  return STONE_TYPE_LABELS[type as StoneType] || type
}

/** Shared chart styling (rock-200 grid, rock-500 ticks). */
export const CHART_GRID_COLOR = '#e2e8f0'
export const CHART_TICK_COLOR = '#64748b'
