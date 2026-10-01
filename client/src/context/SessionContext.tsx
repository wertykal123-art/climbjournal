import { createContext, ReactNode, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { Climb, Location } from '@/types/models'
import { useAuth } from './AuthContext'
import { formatDateISO } from '@/utils/formatters'
import { compareGrades } from '@/utils/grades'

export interface ClimbSession {
  userId: string
  location: Pick<Location, 'id' | 'name' | 'type' | 'defaultGradingSystem' | 'userId' | 'createdAt' | 'updatedAt'>
  startedAt: string
  climbs: Climb[]
}

export interface SessionSummary {
  climbCount: number
  sendCount: number
  points: number
  hardestSend: string | null
  newMaxGrade: string | null
}

interface SessionContextType {
  session: ClimbSession | null
  summary: SessionSummary
  startSession: (location: Location) => void
  /** Ends the session and returns it (for the recap). */
  endSession: () => ClimbSession | null
  /** Adds a freshly logged climb if it belongs to the active session. */
  recordClimb: (climb: Climb) => void
  removeClimb: (climbId: string) => void
}

const STORAGE_KEY = 'climbjournal.session'

const SessionContext = createContext<SessionContextType | undefined>(undefined)

export function summarizeSession(session: ClimbSession | null): SessionSummary {
  const climbs = session?.climbs ?? []
  const sends = climbs.filter((c) => c.climbType !== 'TRY')
  const hardestSend = sends.reduce<string | null>((max, c) => {
    const g = c.route?.difficultyFrench
    return g && (!max || compareGrades(g, max) > 0) ? g : max
  }, null)
  const newMax = climbs
    .map((c) => c.achievement?.grade)
    .filter((g): g is string => !!g)
    .reduce<string | null>((max, g) => (!max || compareGrades(g, max) > 0 ? g : max), null)
  return {
    climbCount: climbs.length,
    sendCount: sends.length,
    points: climbs.reduce((sum, c) => sum + c.points, 0),
    hardestSend,
    newMaxGrade: newMax,
  }
}

function load(userId: string | undefined): ClimbSession | null {
  if (!userId) return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as ClimbSession
    return parsed.userId === userId && parsed.location?.id ? parsed : null
  } catch {
    return null
  }
}

function save(session: ClimbSession | null) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session))
    else localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Session still works for this tab; it just won't survive a reload.
  }
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth()
  const [session, setSession] = useState<ClimbSession | null>(() => load(user?.id))

  // Switch sessions when the signed-in user changes (or logs out).
  useEffect(() => {
    setSession(load(user?.id))
  }, [user?.id])

  const update = useCallback((next: ClimbSession | null | ((prev: ClimbSession | null) => ClimbSession | null)) => {
    setSession((prev) => {
      const value = typeof next === 'function' ? next(prev) : next
      save(value)
      return value
    })
  }, [])

  const startSession = useCallback(
    (location: Location) => {
      if (!user) return
      update({
        userId: user.id,
        location: {
          id: location.id,
          name: location.name,
          type: location.type,
          defaultGradingSystem: location.defaultGradingSystem,
          userId: location.userId,
          createdAt: location.createdAt,
          updatedAt: location.updatedAt,
        },
        startedAt: new Date().toISOString(),
        climbs: [],
      })
    },
    [user, update]
  )

  const endSession = useCallback(() => {
    const ended = session
    update(null)
    return ended
  }, [session, update])

  const recordClimb = useCallback(
    (climb: Climb) => {
      update((prev) => {
        if (!prev) return prev
        const atLocation = climb.route?.locationId === prev.location.id
        const today = climb.date.slice(0, 10) === formatDateISO(new Date())
        if (!atLocation || !today || prev.climbs.some((c) => c.id === climb.id)) return prev
        return { ...prev, climbs: [climb, ...prev.climbs] }
      })
    },
    [update]
  )

  const removeClimb = useCallback(
    (climbId: string) => {
      update((prev) => (prev ? { ...prev, climbs: prev.climbs.filter((c) => c.id !== climbId) } : prev))
    },
    [update]
  )

  const summary = useMemo(() => summarizeSession(session), [session])

  return (
    <SessionContext.Provider value={{ session, summary, startSession, endSession, recordClimb, removeClimb }}>
      {children}
    </SessionContext.Provider>
  )
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error('useSession must be used within SessionProvider')
  return ctx
}
