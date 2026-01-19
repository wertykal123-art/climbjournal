import { useState, useCallback, useEffect } from 'react'
import { Friend, Friendship, UserSummary } from '@/types/models'
import { friendshipsApi } from '@/api/friendships.api'

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchFriends = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await friendshipsApi.getFriends()
      setFriends(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFriends()
  }, [fetchFriends])

  const removeFriend = async (friendshipId: string) => {
    await friendshipsApi.removeFriend(friendshipId)
    setFriends((prev) => prev.filter((f) => f.friendshipId !== friendshipId))
  }

  return {
    friends,
    isLoading,
    error,
    refetch: fetchFriends,
    removeFriend,
  }
}

export function useFriendRequests() {
  const [incoming, setIncoming] = useState<Friendship[]>([])
  const [outgoing, setOutgoing] = useState<Friendship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRequests = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const [incomingData, outgoingData] = await Promise.all([
        friendshipsApi.getIncomingRequests(),
        friendshipsApi.getOutgoingRequests(),
      ])
      setIncoming(incomingData)
      setOutgoing(outgoingData)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const acceptRequest = async (id: string) => {
    await friendshipsApi.updateRequest(id, { action: 'accept' })
    setIncoming((prev) => prev.filter((r) => r.id !== id))
  }

  const rejectRequest = async (id: string) => {
    await friendshipsApi.updateRequest(id, { action: 'reject' })
    setIncoming((prev) => prev.filter((r) => r.id !== id))
  }

  const cancelRequest = async (id: string) => {
    await friendshipsApi.removeFriend(id)
    setOutgoing((prev) => prev.filter((r) => r.id !== id))
  }

  return {
    incoming,
    outgoing,
    isLoading,
    error,
    refetch: fetchRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
  }
}

export function useUserSearch() {
  const [results, setResults] = useState<UserSummary[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const search = async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await friendshipsApi.searchUsers(query)
      setResults(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }

  const sendRequest = async (addresseeId: string) => {
    await friendshipsApi.sendRequest({ addresseeId })
    setResults((prev) => prev.filter((u) => u.id !== addresseeId))
  }

  const clearResults = () => {
    setResults([])
  }

  return {
    results,
    isLoading,
    error,
    search,
    sendRequest,
    clearResults,
  }
}
