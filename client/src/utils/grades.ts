export const FRENCH_GRADES = [
  '4', '4+',
  '5a', '5a+', '5b', '5b+', '5c', '5c+',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
  '9a', '9a+', '9b', '9b+', '9c'
] as const

export const UIAA_GRADES = [
  'IV', 'IV+',
  'V-', 'V', 'V+', 'VI-', 'VI', 'VI+',
  'VI+', 'VII-', 'VII', 'VII+', 'VIII-', 'VIII',
  'VIII+', 'VIII+', 'IX-', 'IX', 'IX+', 'IX+',
  'X-', 'X', 'X+', 'XI-', 'XI', 'XI+',
  'XII-', 'XII', 'XII+', 'XII+', 'XII+'
] as const

export const FRENCH_TO_UIAA: Record<string, string> = {
  '4': 'IV',
  '4+': 'IV+',
  '5a': 'V-',
  '5a+': 'V',
  '5b': 'V+',
  '5b+': 'VI-',
  '5c': 'VI',
  '5c+': 'VI+',
  '6a': 'VI+',
  '6a+': 'VII-',
  '6b': 'VII',
  '6b+': 'VII+',
  '6c': 'VIII-',
  '6c+': 'VIII',
  '7a': 'VIII+',
  '7a+': 'VIII+',
  '7b': 'IX-',
  '7b+': 'IX',
  '7c': 'IX+',
  '7c+': 'IX+',
  '8a': 'X-',
  '8a+': 'X',
  '8b': 'X+',
  '8b+': 'XI-',
  '8c': 'XI',
  '8c+': 'XI+',
  '9a': 'XII-',
  '9a+': 'XII',
  '9b': 'XII+',
  '9b+': 'XII+',
  '9c': 'XII+',
}

// Reverse mapping from UIAA to French (using the first French grade that maps to each UIAA)
export const UIAA_TO_FRENCH: Record<string, string> = {
  'IV': '4',
  'IV+': '4+',
  'V-': '5a',
  'V': '5a+',
  'V+': '5b',
  'VI-': '5b+',
  'VI': '5c',
  'VI+': '6a',
  'VII-': '6a+',
  'VII': '6b',
  'VII+': '6b+',
  'VIII-': '6c',
  'VIII': '6c+',
  'VIII+': '7a',
  'IX-': '7b',
  'IX': '7b+',
  'IX+': '7c',
  'X-': '8a',
  'X': '8a+',
  'X+': '8b',
  'XI-': '8b+',
  'XI': '8c',
  'XI+': '8c+',
  'XII-': '9a',
  'XII': '9a+',
  'XII+': '9b',
}

export function frenchToUIAA(french: string): string {
  return FRENCH_TO_UIAA[french] || french
}

export function uiaaToFrench(uiaa: string): string {
  return UIAA_TO_FRENCH[uiaa] || uiaa
}

export type GradingSystemType = 'FRENCH' | 'UIAA'

export function formatGradeWithSecondary(frenchGrade: string, primarySystem: GradingSystemType): string {
  const uiaaGrade = frenchToUIAA(frenchGrade)
  if (primarySystem === 'UIAA') {
    return `${uiaaGrade} (${frenchGrade})`
  }
  return `${frenchGrade} (${uiaaGrade})`
}

export function getGradeOptionsForSystem(primarySystem: GradingSystemType): { value: string; label: string }[] {
  return FRENCH_GRADES.map((frenchGrade) => ({
    value: frenchGrade,
    label: formatGradeWithSecondary(frenchGrade, primarySystem),
  }))
}

export function getGradeIndex(grade: string): number {
  return FRENCH_GRADES.indexOf(grade as typeof FRENCH_GRADES[number])
}

export function compareGrades(a: string, b: string): number {
  return getGradeIndex(a) - getGradeIndex(b)
}

export function isHarderGrade(grade: string, than: string): boolean {
  return getGradeIndex(grade) > getGradeIndex(than)
}
