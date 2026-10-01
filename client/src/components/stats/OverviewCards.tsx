import { OverviewStats } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import StatTile from '@/components/ui/StatTile'
import { formatNumber, formatPoints } from '@/utils/formatters'
import { TrendingUp, Target, Flame, Trophy, MapPin, Route } from 'lucide-react'
import GradeBadge from '@/components/routes/GradeBadge'
import { useGradingSystem } from '@/hooks/useGradingSystem'

interface OverviewCardsProps {
  stats: OverviewStats
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`

export default function OverviewCards({ stats }: OverviewCardsProps) {
  const { getGradeBadgeSystem } = useGradingSystem()

  const tiles = [
    { label: 'Total Points', value: formatPoints(stats.totalPoints), icon: TrendingUp, iconClassName: 'bg-send-light text-send' },
    { label: 'Total Climbs', value: formatNumber(stats.totalClimbs), icon: Target, iconClassName: 'bg-carabiner-light text-carabiner' },
    { label: 'Current Streak', value: plural(stats.currentStreak, 'day'), icon: Flame, iconClassName: 'bg-pump-light text-pump' },
    { label: 'Best Streak', value: plural(stats.bestStreak, 'day'), icon: Trophy, iconClassName: 'bg-yellow-50 text-yellow-600' },
    { label: 'Locations', value: formatNumber(stats.totalLocations), icon: MapPin, iconClassName: 'bg-purple-50 text-purple-600' },
    { label: 'Routes', value: formatNumber(stats.totalRoutes), icon: Route, iconClassName: 'bg-rock-100 text-rock-600' },
  ]

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <Card>
          <CardBody className="!p-4">
            <p className="text-xs sm:text-sm text-rock-500 mb-1">This Month</p>
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <div>
                <span className="text-2xl font-bold text-carabiner">{stats.thisMonthClimbs}</span>
                <span className="text-sm text-rock-500 ml-1">{stats.thisMonthClimbs === 1 ? 'climb' : 'climbs'}</span>
              </div>
              <div>
                <span className="text-2xl font-bold text-send">{formatPoints(stats.thisMonthPoints)}</span>
                <span className="text-sm text-rock-500 ml-1">points</span>
              </div>
            </div>
          </CardBody>
        </Card>
        <Card>
          <CardBody className="!p-4">
            <p className="text-xs sm:text-sm text-rock-500 mb-2">Hardest Send</p>
            {stats.hardestGrade ? (
              <GradeBadge grade={stats.hardestGrade} size="lg" system={getGradeBadgeSystem(null)} />
            ) : (
              <p className="text-sm text-rock-400">No sends yet</p>
            )}
          </CardBody>
        </Card>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
        {tiles.map((tile) => (
          <StatTile key={tile.label} {...tile} />
        ))}
      </div>
    </div>
  )
}
