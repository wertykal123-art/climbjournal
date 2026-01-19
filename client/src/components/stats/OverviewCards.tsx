import { OverviewStats } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import { formatNumber, formatPoints } from '@/utils/formatters'
import { TrendingUp, Target, Flame, Trophy, MapPin, Route } from 'lucide-react'
import GradeBadge from '@/components/routes/GradeBadge'
import { useGradingSystem } from '@/hooks/useGradingSystem'

interface OverviewCardsProps {
  stats: OverviewStats
}

export default function OverviewCards({ stats }: OverviewCardsProps) {
  const { getGradeBadgeSystem } = useGradingSystem()

  const cards = [
    {
      label: 'Total Points',
      value: formatPoints(stats.totalPoints),
      icon: TrendingUp,
      color: 'text-send',
      bg: 'bg-green-100',
    },
    {
      label: 'Total Climbs',
      value: formatNumber(stats.totalClimbs),
      icon: Target,
      color: 'text-carabiner',
      bg: 'bg-blue-100',
    },
    {
      label: 'Current Streak',
      value: `${stats.currentStreak} days`,
      icon: Flame,
      color: 'text-pump',
      bg: 'bg-orange-100',
    },
    {
      label: 'Best Streak',
      value: `${stats.bestStreak} days`,
      icon: Trophy,
      color: 'text-yellow-600',
      bg: 'bg-yellow-100',
    },
    {
      label: 'Locations',
      value: formatNumber(stats.totalLocations),
      icon: MapPin,
      color: 'text-purple-600',
      bg: 'bg-purple-100',
    },
    {
      label: 'Routes',
      value: formatNumber(stats.totalRoutes),
      icon: Route,
      color: 'text-rock-600',
      bg: 'bg-rock-100',
    },
  ]

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      {cards.map((card) => (
        <Card key={card.label}>
          <CardBody className="p-4">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <card.icon className={`w-5 h-5 ${card.color}`} />
              </div>
              <div>
                <p className="text-xs text-rock-500">{card.label}</p>
                <p className={`text-lg font-bold ${card.color}`}>{card.value}</p>
              </div>
            </div>
          </CardBody>
        </Card>
      ))}

      {stats.hardestGrade && (
        <Card className="col-span-2 md:col-span-1">
          <CardBody className="p-4">
            <p className="text-xs text-rock-500 mb-2">Hardest Send</p>
            <GradeBadge grade={stats.hardestGrade} size="lg" system={getGradeBadgeSystem(null)} />
          </CardBody>
        </Card>
      )}

      <Card className="col-span-2 md:col-span-2">
        <CardBody className="p-4">
          <p className="text-xs text-rock-500 mb-1">This Month</p>
          <div className="flex items-center gap-4">
            <div>
              <span className="text-2xl font-bold text-carabiner">
                {stats.thisMonthClimbs}
              </span>
              <span className="text-sm text-rock-500 ml-1">climbs</span>
            </div>
            <div className="text-rock-300">|</div>
            <div>
              <span className="text-2xl font-bold text-send">
                {formatPoints(stats.thisMonthPoints)}
              </span>
              <span className="text-sm text-rock-500 ml-1">points</span>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  )
}
