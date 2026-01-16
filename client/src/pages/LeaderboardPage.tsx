import { useState } from 'react'
import { useAuth } from '@/context/AuthContext'
import { useLeaderboard } from '@/hooks/useLeaderboard'
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable'
import { PageSpinner } from '@/components/ui/Spinner'

type Period = 'all' | 'monthly' | 'weekly'

const TABS: { value: Period; label: string }[] = [
  { value: 'all', label: 'All Time' },
  { value: 'monthly', label: 'This Month' },
  { value: 'weekly', label: 'This Week' },
]

export default function LeaderboardPage() {
  const [period, setPeriod] = useState<Period>('all')
  const { user } = useAuth()
  const { entries, isLoading } = useLeaderboard(period)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-rock-900">Leaderboard</h1>
        <p className="text-rock-600">See how you stack up against other climbers</p>
      </div>

      <div className="flex gap-2">
        {TABS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setPeriod(tab.value)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              period === tab.value
                ? 'bg-carabiner text-white'
                : 'bg-rock-100 text-rock-700 hover:bg-rock-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <PageSpinner />
      ) : (
        <LeaderboardTable
          entries={entries}
          currentUserId={user?.id}
          title={TABS.find((t) => t.value === period)?.label + ' Rankings'}
        />
      )}
    </div>
  )
}
