import { useState, useEffect, useCallback, useRef } from 'react'
import { useParams, Link } from 'react-router-dom'
import { climbsApi } from '@/api/climbs.api'
import { friendshipsApi } from '@/api/friendships.api'
import { getErrorMessage } from '@/api/client'
import { FriendClimb, Friend } from '@/types/models'
import { PaginatedResponse } from '@/types/api'
import ClimbCard from '@/components/climbs/ClimbCard'
import ClimbFilters, { ClimbFilterValues } from '@/components/climbs/ClimbFilters'
import Button, { LinkButton } from '@/components/ui/Button'
import Avatar from '@/components/ui/Avatar'
import Pagination from '@/components/ui/Pagination'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { Activity, SearchX, UserPlus } from 'lucide-react'

const EMPTY_FILTERS: ClimbFilterValues = { climbType: '', from: '', to: '' }

export default function FriendClimbsPage() {
  const { userId } = useParams<{ userId?: string }>()

  const [filters, setFilters] = useState({ ...EMPTY_FILTERS, page: 1, limit: 20 })
  const [data, setData] = useState<PaginatedResponse<FriendClimb> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [friends, setFriends] = useState<Friend[] | null>(null)
  const requestIdRef = useRef(0)

  // Reset filters and results when switching between friends.
  useEffect(() => {
    setFilters({ ...EMPTY_FILTERS, page: 1, limit: 20 })
    setData(null)
  }, [userId])

  const fetchClimbs = useCallback(async () => {
    const requestId = ++requestIdRef.current
    try {
      setIsLoading(true)
      setError(null)
      const response = await climbsApi.getFriendClimbs({ ...filters, userId })
      if (requestId !== requestIdRef.current) return
      setData(response)
    } catch (err) {
      if (requestId !== requestIdRef.current) return
      setError(getErrorMessage(err, "We couldn't load these climbs."))
    } finally {
      if (requestId === requestIdRef.current) setIsLoading(false)
    }
  }, [userId, filters])

  useEffect(() => {
    fetchClimbs()
  }, [fetchClimbs])

  useEffect(() => {
    friendshipsApi
      .getFriends()
      .then(setFriends)
      .catch(() => setFriends([]))
  }, [])

  const climbs = data?.data ?? []
  const page = data?.page ?? 1
  const totalPages = data?.totalPages ?? 1

  // Don't strand the user on a page past the end when the result set shrinks.
  // Compare against max(1, totalPages): an empty result set reports
  // totalPages 0, and "clamping" page 1 to 1 forever would loop the fetch.
  useEffect(() => {
    const lastPage = Math.max(1, totalPages)
    if (!isLoading && filters.page > lastPage) {
      setFilters((f) => ({ ...f, page: lastPage }))
    }
  }, [isLoading, totalPages, filters.page])

  if (isLoading && !data && !error) {
    return <PageSpinner />
  }

  const friend = userId ? friends?.find((f) => f.id === userId) : undefined
  const title = userId ? (friend ? `${friend.displayName}'s climbs` : 'Friend climbs') : 'Friend activity'
  const isFiltered = !!(filters.climbType || filters.from || filters.to)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        backTo={userId ? '/friends/activity' : '/friends'}
        backLabel={userId ? 'Back to friend activity' : 'Back to friends'}
        title={title}
        subtitle={userId ? 'Their recent climbing progress' : 'See what your friends have been climbing'}
      />

      {friends && friends.length > 0 && (
        <nav aria-label="Filter by friend" className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto">
          <ul className="flex gap-2 pb-1 min-w-max">
            <li>
              <Link
                to="/friends/activity"
                aria-current={!userId ? 'page' : undefined}
                className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                  !userId ? 'bg-carabiner text-white border-carabiner' : 'bg-white text-rock-700 border-rock-300 hover:border-carabiner'
                }`}
              >
                All friends
              </Link>
            </li>
            {friends.map((f) => {
              const active = f.id === userId
              return (
                <li key={f.id}>
                  <Link
                    to={`/friends/climbs/${f.id}`}
                    aria-current={active ? 'page' : undefined}
                    className={`inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full text-sm font-medium border transition-colors ${
                      active ? 'bg-carabiner text-white border-carabiner' : 'bg-white text-rock-700 border-rock-300 hover:border-carabiner'
                    }`}
                  >
                    <Avatar src={f.profilePicture} name={f.displayName} size="sm" className="!w-6 !h-6 !text-[10px]" />
                    <span className="max-w-[10rem] truncate">{f.displayName}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}

      <ClimbFilters
        values={{ climbType: filters.climbType, from: filters.from, to: filters.to }}
        onChange={(values) => setFilters((f) => ({ ...f, ...values, page: 1 }))}
      />

      {error ? (
        <Card><ErrorState message={error} onRetry={fetchClimbs} /></Card>
      ) : climbs.length > 0 ? (
        <div className={`space-y-3 transition-opacity ${isLoading ? 'opacity-60' : ''}`} aria-busy={isLoading}>
          {climbs.map((climb) => (
            <ClimbCard key={climb.id} climb={climb} user={userId ? undefined : climb.user} />
          ))}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </div>
      ) : isFiltered ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="No climbs match"
            message="Try a different type or date range."
            action={
              <Button variant="secondary" onClick={() => setFilters((f) => ({ ...f, ...EMPTY_FILTERS, page: 1 }))}>
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : friends && friends.length === 0 && !userId ? (
        <Card>
          <EmptyState
            icon={UserPlus}
            title="No friends yet"
            message="Add friends to follow their climbing here."
            action={<LinkButton to="/friends">Find friends</LinkButton>}
          />
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={Activity}
            title="No climbs yet"
            message={userId ? "This friend hasn't logged any climbs yet." : "Your friends haven't logged any climbs yet."}
          />
        </Card>
      )}
    </div>
  )
}
