import { LeaderboardEntry } from '@/types/models'
import Avatar from '@/components/ui/Avatar'
import GradeBadge from '@/components/routes/GradeBadge'
import { formatPoints, formatNumber } from '@/utils/formatters'
import { Trophy, Medal } from 'lucide-react'
import { useGradingSystem } from '@/hooks/useGradingSystem'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
}

function RankCell({ rank }: { rank: number }) {
  if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" aria-label="Rank 1" role="img" />
  if (rank === 2) return <Medal className="w-5 h-5 text-rock-400" aria-label="Rank 2" role="img" />
  if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" aria-label="Rank 3" role="img" />
  return <span className="text-sm font-medium text-rock-500 tabular-nums">#{rank}</span>
}

export default function LeaderboardTable({ entries, currentUserId }: LeaderboardTableProps) {
  const { getGradeBadgeSystem } = useGradingSystem()

  return (
    <table className="w-full table-fixed">
      <thead className="bg-rock-50 border-b border-rock-200">
        <tr>
          <th scope="col" className="w-14 sm:w-16 pl-4 pr-2 py-3 text-left text-xs font-medium text-rock-500 uppercase">
            Rank
          </th>
          <th scope="col" className="px-2 py-3 text-left text-xs font-medium text-rock-500 uppercase">
            Climber
          </th>
          <th scope="col" className="w-20 sm:w-24 px-2 py-3 text-right text-xs font-medium text-rock-500 uppercase">
            Points
          </th>
          <th scope="col" className="w-20 px-2 py-3 text-right text-xs font-medium text-rock-500 uppercase hidden sm:table-cell">
            Climbs
          </th>
          <th scope="col" className="w-24 pl-2 pr-4 py-3 text-right text-xs font-medium text-rock-500 uppercase hidden md:table-cell">
            Hardest
          </th>
        </tr>
      </thead>
      <tbody className="divide-y divide-rock-200">
        {entries.map((entry) => {
          const isMe = entry.userId === currentUserId
          return (
            <tr
              key={entry.userId}
              aria-current={isMe ? 'true' : undefined}
              className={isMe ? 'bg-carabiner-light' : 'hover:bg-rock-50'}
            >
              <td className="pl-4 pr-2 py-3">
                <RankCell rank={entry.rank} />
              </td>
              <td className="px-2 py-3">
                <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                  <Avatar src={entry.profilePicture} name={entry.displayName} size="sm" />
                  <div className="min-w-0">
                    <div className="font-medium text-rock-900 truncate">
                      {entry.displayName}
                      {isMe && <span className="ml-1.5 text-xs font-semibold text-carabiner">(You)</span>}
                    </div>
                    <div className="text-xs sm:text-sm text-rock-500 truncate">@{entry.username}</div>
                  </div>
                </div>
              </td>
              <td className="px-2 py-3 text-right">
                <span className="font-bold text-send tabular-nums">{formatPoints(entry.totalPoints)}</span>
              </td>
              <td className="px-2 py-3 text-right text-rock-600 tabular-nums hidden sm:table-cell">
                {formatNumber(entry.totalClimbs)}
              </td>
              <td className="pl-2 pr-4 py-3 text-right hidden md:table-cell">
                {entry.hardestGrade ? (
                  <GradeBadge grade={entry.hardestGrade} size="sm" system={getGradeBadgeSystem(null)} />
                ) : (
                  <span className="text-rock-400">—</span>
                )}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
