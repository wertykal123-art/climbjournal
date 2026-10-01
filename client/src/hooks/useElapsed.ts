import { useEffect, useState } from 'react'

/** Live "h:mm" / "m min" elapsed label since an ISO timestamp. */
export function formatElapsed(ms: number): string {
  const totalMinutes = Math.max(0, Math.floor(ms / 60000))
  const hours = Math.floor(totalMinutes / 60)
  const minutes = totalMinutes % 60
  if (hours === 0) return `${minutes} min`
  return `${hours}h ${String(minutes).padStart(2, '0')}m`
}

export function useElapsed(startedAt: string | undefined, intervalMs = 15000): string {
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    if (!startedAt) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), intervalMs)
    return () => clearInterval(id)
  }, [startedAt, intervalMs])

  return startedAt ? formatElapsed(now - new Date(startedAt).getTime()) : ''
}
