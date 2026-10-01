import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLeaderboard, useUserRank } from '@/hooks/useLeaderboard'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'
import PageHeader from '@/components/ui/PageHeader'
import SegmentedControl from '@/components/ui/SegmentedControl'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import Avatar from '@/components/ui/Avatar'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { InlineSpinner } from '@/components/ui/Spinner'
import { Trophy } from 'lucide-react'

type Period = 'all' | 'monthly' | 'weekly'

const TABS: { value: Period; label: string }[] = [
  { value: 'all', label: 'All time' },
  { value: 'monthly', label: 'This month' },
  { value: 'weekly', label: 'This week' },
]

const RANK_KEY: Record<Period, 'global' | 'monthly' | 'weekly'> = {
  all: 'global',
  monthly: 'monthly',
  weekly: 'weekly',
}

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all')
  const { user } = useAuth()
  const { entries, isLoading, error, refetch } = useLeaderboard(period)
  const { ranks } = useUserRank(user?.id)

  const myRank = ranks?.[RANK_KEY[period]] ?? 0
  const iAmListed = entries.some((e) => e.userId === user?.id)
  const periodLabel = TABS.find((t) => t.value === period)?.label.toLowerCase()

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader title="Leaderboard" subtitle="See how you stack up against other climbers" />

      <SegmentedControl label="Leaderboard period" value={period} onChange={setPeriod} options={TABS} size="md" />

      {ranks && !iAmListed && !isLoading && (
        <Card className="p-4 flex items-center gap-3">
          <Avatar src={user?.profilePicture} name={user?.displayName} size="md" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-rock-900 truncate">Your rank {periodLabel}</p>
            <p className="text-sm text-rock-500">
              {myRank > 0 ? 'Keep climbing to break into the top list!' : 'Log a climb to get ranked.'}
            </p>
          </div>
          <span className="text-xl font-bold text-carabiner tabular-nums">{myRank > 0 ? `#${myRank}` : '—'}</span>
        </Card>
      )}

      <Card className="overflow-hidden">
        <CardHeader>
          <CardTitle>{TABS.find((t) => t.value === period)?.label} rankings</CardTitle>
        </CardHeader>
        {error ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading && entries.length === 0 ? (
          <InlineSpinner height={240} />
        ) : entries.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="No rankings yet"
            message="Nobody has logged a climb in this period. Be the first!"
          />
        ) : (
          <div className={`relative transition-opacity ${isLoading ? 'opacity-50' : ''}`} aria-busy={isLoading}>
            <LeaderboardTable entries={entries} currentUserId={user?.id} />
          </div>
        )}
      </Card>
    </div>
  )
}
