import { useState, useEffect, useCallback } from 'react'
import { friendshipsApi } from '@/api/friendships.api'
import { Friend } from '@/types/models'

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [friendIds, setFriendIds] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFriends()
  }, [])

  const loadFriends = async () => {
    try {
      const data = await friendshipsApi.getFriends()
      setFriends(data)
      setFriendIds(new Set(data.map((f) => f.id)))
    } catch {
      // Silently fail - user might not have friends yet
    } finally {
      setIsLoading(false)
    }
  }

  const isFriend = useCallback(
    (userId: string | undefined): boolean => {
      if (!userId) return false
      return friendIds.has(userId)
    },
    [friendIds]
  )

  const refresh = useCallback(() => {
    loadFriends()
  }, [])

  return { friends, friendIds, isFriend, isLoading, refresh }
}
