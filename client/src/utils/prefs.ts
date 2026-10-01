import { ClimbType } from '@/types/models'
import { CLIMB_TYPE_ORDER } from './colors'

// Per-device conveniences. Storage can be unavailable (private mode), so
// every access is guarded and falls back to defaults.

const KEYS = {
  lastClimbType: 'climbjournal.lastClimbType',
  lastLocationId: 'climbjournal.lastLocationId',
}

function read(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function write(key: string, value: string) {
  try {
    localStorage.setItem(key, value)
  } catch {
    // Not persisted; harmless.
  }
}

export function getLastClimbType(): ClimbType {
  const saved = read(KEYS.lastClimbType)
  return CLIMB_TYPE_ORDER.includes(saved as ClimbType) ? (saved as ClimbType) : 'RP'
}

export function setLastClimbType(type: ClimbType) {
  write(KEYS.lastClimbType, type)
}

export function getLastLocationId(): string | null {
  return read(KEYS.lastLocationId)
}

export function setLastLocationId(id: string) {
  write(KEYS.lastLocationId, id)
}
