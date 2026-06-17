export type ClimbType = 'OS' | 'FLASH' | 'RP' | 'PP' | 'TOPROPE' | 'AUTOBELAY' | 'TRY'

// Smooth ~10% geometric progression so the gap between consecutive grades
// stays proportional (no jarring jumps at the top end). Rounded to multiples
// of 5 for readability.
export const GRADE_BASE_POINTS: Record<string, number> = {
  '4': 100,
  '4+': 110,
  '5a': 120,
  '5a+': 135,
  '5b': 145,
  '5b+': 160,
  '5c': 175,
  '5c+': 195,
  '6a': 215,
  '6a+': 235,
  '6b': 260,
  '6b+': 285,
  '6c': 315,
  '6c+': 345,
  '7a': 380,
  '7a+': 420,
  '7b': 460,
  '7b+': 505,
  '7c': 555,
  '7c+': 610,
  '8a': 675,
  '8a+': 740,
  '8b': 815,
  '8b+': 895,
  '8c': 985,
  '8c+': 1085,
  '9a': 1190,
  '9a+': 1310,
  '9b': 1440,
  '9b+': 1585,
  '9c': 1745,
}

export const CLIMB_TYPE_MULTIPLIERS: Record<ClimbType, number> = {
  OS: 2.0,
  FLASH: 1.8,
  RP: 1.5,
  PP: 1.3,
  AUTOBELAY: 1.0,
  TOPROPE: 0.8,
  TRY: 0.3,
}

export function calculatePoints(frenchGrade: string, climbType: ClimbType): number {
  const basePoints = GRADE_BASE_POINTS[frenchGrade] || 0
  const multiplier = CLIMB_TYPE_MULTIPLIERS[climbType]
  return Math.round(basePoints * multiplier)
}
