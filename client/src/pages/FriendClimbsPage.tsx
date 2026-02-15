import { useState, useEffect, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { climbsApi } from '@/api/climbs.api'
import { friendshipsApi } from '@/api/friendships.api'
import { FriendClimb, Friend } from '@/types/models'
import { PaginatedResponse } from '@/types/api'
import { Card, CardBody } from '@/components/ui/Card'
import GradeBadge from '@/components/routes/GradeBadge'
import ClimbTypeBadge from '@/components/climbs/ClimbTypeBadge'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { PageSpinner } from '@/components/ui/Spinner'
import { formatDate, formatPoints } from '@/utils/formatters'
import { useGradingSystem } from '@/hooks/useGradingSystem'
import { ChevronLeft, ChevronRight, ArrowLeft, Activity, Star } from 'lucide-react'

const CLIMB_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'OS', label: 'On-Sight' },
  { value: 'FLASH', label: 'Flash' },
  { value: 'RP', label: 'Redpoint' },
  { value: 'PP', label: 'Pinkpoint' },
  { value: 'TOPROPE', label: 'Top Rope' },
  { value: 'AUTOBELAY', label: 'Auto Belay' },
  { value: 'TRY', label: 'Attempt' },
]

export default function FriendClimbsPage() {
  const { userId } = useParams<{ userId?: string }>()
  const { getGradeBadgeSystem } = useGradingSystem()

  const [filters, setFilters] = useState({
    climbType: '',
    from: '',
    to: '',
    page: 1,
    limit: 20,
  })
  const [data, setData] = useState<PaginatedResponse<FriendClimb> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [friend, setFriend] = useState<Friend | null>(null)

  const fetchClimbs = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await climbsApi.getFriendClimbs({
        ...filters,
        userId,
      })
      setData(response)
    } catch {
      // handled by empty state
    } finally {
      setIsLoading(false)
    }
  }, [userId, filters])

  useEffect(() => {
    fetchClimbs()
  }, [fetchClimbs])

  useEffect(() => {
    if (userId) {
      friendshipsApi.getFriends().then((friends) => {
        const found = friends.find((f) => f.id === userId)
        if (found) setFriend(found)
      })
    }
  }, [userId])

  const climbs = data?.data ?? []
  const page = data?.page ?? 1
  const totalPages = data?.totalPages ?? 1

  if (isLoading && climbs.length === 0) {
    return <PageSpinner />
  }

  const title = friend
    ? `${friend.displayName}'s Climbs`
    : 'Friend Activity'

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to={userId ? '/friends' : '/friends/activity'}
            className="p-2 rounded-lg text-rock-600 hover:bg-rock-100"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-rock-900">{title}</h1>
            <p className="text-rock-600">
              {userId ? 'View their climbing progress' : 'See what your friends have been climbing'}
            </p>
          </div>
        </div>
      </div>

      {!userId && (
        <div className="flex gap-2 overflow-x-auto pb-2">
          <Link to="/friends/activity">
            <Button variant="primary" size="sm">All Friends</Button>
          </Link>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={filters.climbType}
          onChange={(e) => setFilters({ ...filters, climbType: e.target.value, page: 1 })}
          options={CLIMB_TYPE_OPTIONS}
          className="sm:w-40"
        />
        <Input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value, page: 1 })}
          placeholder="From"
          className="sm:w-40"
        />
        <Input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value, page: 1 })}
          placeholder="To"
          className="sm:w-40"
        />
      </div>

      {climbs.length > 0 ? (
        <>
          <div className="space-y-4">
            {climbs.map((climb) => (
              <Card key={climb.id} className="hover:shadow-md transition-shadow">
                <CardBody>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {climb.route && (
                        <GradeBadge
                          grade={climb.route.difficultyFrench}
                          size="lg"
                          system={getGradeBadgeSystem(climb.route?.location)}
                        />
                      )}
                      <div>
                        <h3 className="font-semibold text-rock-900">{climb.route?.name}</h3>
                        <p className="text-sm text-rock-500">
                          {climb.route?.location?.name} - {formatDate(climb.date)}
                        </p>
                        {climb.user && (
                          <Link
                            to={`/friends/climbs/${climb.user.id}`}
                            className="text-xs text-carabiner hover:underline"
                          >
                            {climb.user.displayName}
                          </Link>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg text-send">
                        +{formatPoints(climb.points)}
                      </div>
                      <div className="text-xs text-rock-500">points</div>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center gap-3 flex-wrap">
                    <ClimbTypeBadge type={climb.climbType} />

                    {climb.personalRating && (
                      <div className="flex items-center gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < climb.personalRating!
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-rock-300'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {climb.attemptCount > 1 && (
                      <span className="text-sm text-rock-500">
                        {climb.attemptCount} attempts
                      </span>
                    )}
                  </div>

                  {climb.comments && (
                    <p className="mt-3 text-sm text-rock-600 italic">
                      "{climb.comments}"
                    </p>
                  )}
                </CardBody>
              </Card>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ ...filters, page: page - 1 })}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-rock-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ ...filters, page: page + 1 })}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 text-rock-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-rock-900 mb-2">No climbs found</h3>
          <p className="text-rock-500">
            {filters.climbType || filters.from || filters.to
              ? 'Try adjusting your filters'
              : userId
                ? "This friend hasn't logged any climbs yet"
                : 'Your friends haven\'t logged any climbs yet'}
          </p>
        </div>
      )}
    </div>
  )
}
