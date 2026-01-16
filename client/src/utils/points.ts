import { ClimbType } from '@/types/models'

export const GRADE_BASE_POINTS: Record<string, number> = {
  '4': 10,
  '4+': 15,
  '5a': 25,
  '5a+': 35,
  '5b': 50,
  '5b+': 65,
  '5c': 85,
  '5c+': 105,
  '6a': 130,
  '6a+': 160,
  '6b': 195,
  '6b+': 235,
  '6c': 280,
  '6c+': 330,
  '7a': 385,
  '7a+': 445,
  '7b': 510,
  '7b+': 580,
  '7c': 655,
  '7c+': 735,
  '8a': 820,
  '8a+': 910,
  '8b': 1005,
  '8b+': 1105,
  '8c': 1210,
  '8c+': 1320,
  '9a': 1435,
  '9a+': 1555,
  '9b': 1680,
  '9b+': 1810,
  '9c': 2075,
}

export const CLIMB_TYPE_MULTIPLIERS: Record<ClimbType, number> = {
  OS: 2.0,
  FLASH: 1.8,
  RP: 1.5,
  PP: 1.3,
  TOPROPE: 1.0,
  AUTOBELAY: 0.8,
  TRY: 0.3,
}

export function calculatePoints(frenchGrade: string, climbType: ClimbType): number {
  const basePoints = GRADE_BASE_POINTS[frenchGrade] || 0
  const multiplier = CLIMB_TYPE_MULTIPLIERS[climbType]
  return Math.round(basePoints * multiplier)
}

export function getBasePoints(frenchGrade: string): number {
  return GRADE_BASE_POINTS[frenchGrade] || 0
}

export function getMultiplier(climbType: ClimbType): number {
  return CLIMB_TYPE_MULTIPLIERS[climbType]
}
