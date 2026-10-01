// Mirrors server/src/schemas/auth.schema.ts so users see problems before submitting.

export const PASSWORD_RULES: { test: (pw: string) => boolean; label: string }[] = [
  { test: (pw) => pw.length >= 8, label: 'At least 8 characters' },
  { test: (pw) => /[A-Z]/.test(pw), label: 'An uppercase letter' },
  { test: (pw) => /[a-z]/.test(pw), label: 'A lowercase letter' },
  { test: (pw) => /[0-9]/.test(pw), label: 'A number' },
]

export function isStrongPassword(pw: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(pw))
}

export function validateUsername(username: string): string | undefined {
  if (username.length < 3) return 'Username must be at least 3 characters'
  if (username.length > 30) return 'Username must be at most 30 characters'
  if (!/^[a-zA-Z0-9_]+$/.test(username)) return 'Only letters, numbers, and underscores'
  return undefined
}
