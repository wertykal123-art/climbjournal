import { LeaderboardEntry } from '@/types/models'
import { Card, CardBody, CardHeader } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import GradeBadge from '@/components/routes/GradeBadge'
import { formatPoints, formatNumber } from '@/utils/formatters'
import { Trophy, Medal } from 'lucide-react'

interface LeaderboardTableProps {
  entries: LeaderboardEntry[]
  currentUserId?: string
  title?: string
}

export default function LeaderboardTable({ entries, currentUserId, title }: LeaderboardTableProps) {
  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Trophy className="w-5 h-5 text-yellow-500" />
    if (rank === 2) return <Medal className="w-5 h-5 text-gray-400" />
    if (rank === 3) return <Medal className="w-5 h-5 text-orange-600" />
    return <span className="text-sm font-medium text-rock-500">#{rank}</span>
  }

  return (
    <Card>
      {title && (
        <CardHeader>
          <h3 className="font-semibold text-rock-900">{title}</h3>
        </CardHeader>
      )}
      <CardBody className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-rock-50 border-b border-rock-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-rock-500 uppercase">
                  Rank
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-rock-500 uppercase">
                  Climber
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-rock-500 uppercase">
                  Points
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-rock-500 uppercase hidden sm:table-cell">
                  Climbs
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-rock-500 uppercase hidden md:table-cell">
                  Hardest
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-rock-200">
              {entries.map((entry) => (
                <tr
                  key={entry.userId}
                  className={`${
                    entry.userId === currentUserId
                      ? 'bg-carabiner/5'
                      : 'hover:bg-rock-50'
                  }`}
                >
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="w-8">{getRankIcon(entry.rank)}</div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <Avatar
                        src={entry.profilePicture}
                        name={entry.displayName}
                        size="sm"
                      />
                      <div>
                        <div className="font-medium text-rock-900">
                          {entry.displayName}
                          {entry.userId === currentUserId && (
                            <span className="ml-2 text-xs text-carabiner">(You)</span>
                          )}
                        </div>
                        <div className="text-sm text-rock-500">@{entry.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <span className="font-bold text-send">
                      {formatPoints(entry.totalPoints)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap text-rock-600 hidden sm:table-cell">
                    {formatNumber(entry.totalClimbs)}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap hidden md:table-cell">
                    {entry.hardestGrade ? (
                      <GradeBadge grade={entry.hardestGrade} size="sm" />
                    ) : (
                      <span className="text-rock-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
              {entries.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-rock-500">
                    No entries yet. Start climbing to join the leaderboard!
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </CardBody>
    </Card>
  )
}
