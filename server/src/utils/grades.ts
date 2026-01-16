export const FRENCH_GRADES = [
  '4', '4+',
  '5a', '5a+', '5b', '5b+', '5c', '5c+',
  '6a', '6a+', '6b', '6b+', '6c', '6c+',
  '7a', '7a+', '7b', '7b+', '7c', '7c+',
  '8a', '8a+', '8b', '8b+', '8c', '8c+',
  '9a', '9a+', '9b', '9b+', '9c'
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

export function frenchToUIAA(french: string): string {
  return FRENCH_TO_UIAA[french] || french
}

export function getGradeIndex(grade: string): number {
  return FRENCH_GRADES.indexOf(grade as typeof FRENCH_GRADES[number])
}

export function compareGrades(a: string, b: string): number {
  return getGradeIndex(a) - getGradeIndex(b)
}

export function isValidFrenchGrade(grade: string): boolean {
  return FRENCH_GRADES.includes(grade as typeof FRENCH_GRADES[number])
}
