import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'
import { useSession } from '@/context/SessionContext'
import { useElapsed } from '@/hooks/useElapsed'
import { formatPoints } from '@/utils/formatters'

/** Persistent bottom bar while a session is running (hidden on the session page itself). */
export default function SessionBar() {
  const { session, summary } = useSession()
  const elapsed = useElapsed(session?.startedAt)
  const { pathname } = useLocation()

  if (!session || pathname === '/session') return null

  return (
    <Link
      to="/session"
      className="fixed z-30 bottom-0 inset-x-0 lg:left-60 flex items-center gap-3 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] bg-rock-900 text-white shadow-[0_-4px_12px_rgba(0,0,0,0.15)] hover:bg-rock-800 transition-colors"
      aria-label={`Session at ${session.location.name}, ${elapsed}, ${summary.climbCount} ${summary.climbCount === 1 ? "climb" : "climbs"}. Open session`}
    >
      <span className="relative flex w-2.5 h-2.5 shrink-0" aria-hidden="true">
        <span className="absolute inline-flex h-full w-full rounded-full bg-send opacity-75 animate-ping" />
        <span className="relative inline-flex w-2.5 h-2.5 rounded-full bg-send" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold truncate">{session.location.name}</p>
        <p className="text-xs text-rock-300 tabular-nums truncate">
          {elapsed} · {summary.climbCount} {summary.climbCount === 1 ? 'climb' : 'climbs'} · {formatPoints(summary.points)} pts
        </p>
      </div>
      <span className="text-sm font-medium text-white/90 shrink-0 flex items-center gap-0.5">
        Session <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </span>
    </Link>
  )
}
