import { useState, useCallback, useEffect, useRef } from 'react'
import { Friend, Friendship, UserSearchResult } from '@/types/models'
import { friendshipsApi } from '@/api/friendships.api'

export function useFriends() {
  const [friends, setFriends] = useState<Friend[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchFriends = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await friendshipsApi.getFriends()
      setFriends(data)
      setHasLoaded(true)
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
    /** True only until the first response; refetches keep the page mounted. */
    isInitialLoading: isLoading && !hasLoaded,
    error,
    refetch: fetchFriends,
    removeFriend,
  }
}

export function useFriendRequests() {
  const [incoming, setIncoming] = useState<Friendship[]>([])
  const [outgoing, setOutgoing] = useState<Friendship[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
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
      setHasLoaded(true)
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
    isInitialLoading: isLoading && !hasLoaded,
    error,
    refetch: fetchRequests,
    acceptRequest,
    rejectRequest,
    cancelRequest,
  }
}

export function useUserSearch() {
  const [results, setResults] = useState<UserSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<Error | null>(null)
  const [lastQuery, setLastQuery] = useState('')
  const requestIdRef = useRef(0)

  const search = useCallback(async (query: string) => {
    const trimmed = query.trim()
    const requestId = ++requestIdRef.current
    if (!trimmed) {
      setResults([])
      setLastQuery('')
      setError(null)
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await friendshipsApi.searchUsers(trimmed)
      if (requestId !== requestIdRef.current) return
      setResults(data)
      setLastQuery(trimmed)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(err as Error)
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false)
    }
  }, [])

  const sendRequest = async (addresseeId: string) => {
    await friendshipsApi.sendRequest({ addresseeId })
    // Keep the user in the list but show the request as pending.
    setResults((prev) =>
      prev.map((u) => (u.id === addresseeId ? { ...u, relationship: 'OUTGOING' } : u))
    )
  }

  const clearResults = useCallback(() => {
    requestIdRef.current++
    setResults([])
    setLastQuery('')
    setError(null)
    setIsLoading(false)
  }, [])

  return {
    results,
    isLoading,
    error,
    /** The query the current results belong to ('' before any search). */
    lastQuery,
    search,
    sendRequest,
    clearResults,
  }
}
