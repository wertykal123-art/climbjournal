import { useState, useCallback, useEffect } from 'react'
import { LeaderboardEntry } from '@/types/models'
import { LeaderboardParams } from '@/types/api'
import { leaderboardApi } from '@/api/leaderboard.api'

export function useLeaderboard(period: 'all' | 'monthly' | 'weekly' = 'all', params?: LeaderboardParams) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLeaderboard = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      let data: LeaderboardEntry[]
      switch (period) {
        case 'monthly':
          data = await leaderboardApi.getMonthly(params)
          break
        case 'weekly':
          data = await leaderboardApi.getWeekly(params)
          break
        default:
          data = await leaderboardApi.getGlobal(params)
      }

      setEntries(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [period, params?.limit, params?.offset])

  useEffect(() => {
    fetchLeaderboard()
  }, [fetchLeaderboard])

  return {
    entries,
    isLoading,
    error,
    refetch: fetchLeaderboard,
  }
}

export function useUserRank(userId: string | undefined) {
  const [ranks, setRanks] = useState<{ global: number; monthly: number; weekly: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRanks = useCallback(async () => {
    if (!userId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await leaderboardApi.getUserRank(userId)
      setRanks(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    fetchRanks()
  }, [fetchRanks])

  return { ranks, isLoading, error, refetch: fetchRanks }
}
