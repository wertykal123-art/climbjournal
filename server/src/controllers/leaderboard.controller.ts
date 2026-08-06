import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { compareGrades } from '../utils/grades.js'

interface LeaderboardEntry {
  rank: number
  userId: string
  username: string
  displayName: string
  profilePicture: string | null
  totalPoints: number
  totalClimbs: number
  hardestGrade: string | null
}

// UTC boundaries to match how climb dates are stored.
function startOfMonthUTC(): Date {
  const now = new Date()
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
}

function startOfWeekUTC(): Date {
  const now = new Date()
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  start.setUTCDate(start.getUTCDate() - start.getUTCDay())
  return start
}

// Aggregates in the database (one row per user), instead of loading every
// user's every climb into memory. User details and hardest grades are only
// fetched for the requested page.
async function calculateLeaderboard(
  dateFilter: { gte: Date } | undefined,
  limit: number,
  offset: number
): Promise<LeaderboardEntry[]> {
  const whereClause = dateFilter ? { date: dateFilter } : {}

  const grouped = await prisma.climb.groupBy({
    by: ['userId'],
    where: whereClause,
    _sum: { points: true },
    _count: true,
    // userId tiebreak keeps equal-points users stable across page boundaries
    orderBy: [{ _sum: { points: 'desc' } }, { userId: 'asc' }],
    skip: offset,
    take: limit,
  })

  if (grouped.length === 0) {
    return []
  }

  const pageUserIds = grouped.map((g) => g.userId)

  const [users, gradeRows] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: pageUserIds } },
      select: {
        id: true,
        username: true,
        displayName: true,
        profilePicture: true,
      },
    }),
    prisma.climb.findMany({
      where: {
        userId: { in: pageUserIds },
        climbType: { not: 'TRY' },
        ...whereClause,
      },
      select: {
        userId: true,
        route: { select: { difficultyFrench: true } },
      },
    }),
  ])

  const userById = new Map(users.map((u) => [u.id, u]))

  const hardestByUser = new Map<string, string>()
  for (const row of gradeRows) {
    const current = hardestByUser.get(row.userId)
    if (!current || compareGrades(row.route.difficultyFrench, current) > 0) {
      hardestByUser.set(row.userId, row.route.difficultyFrench)
    }
  }

  return grouped
    .map((g, index) => {
      const user = userById.get(g.userId)
      if (!user) return null
      return {
        rank: offset + index + 1,
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        totalPoints: g._sum.points || 0,
        totalClimbs: g._count,
        hardestGrade: hardestByUser.get(g.userId) || null,
      }
    })
    .filter((entry): entry is LeaderboardEntry => entry !== null)
}

function parsePagination(req: Request): { limit: number; offset: number } {
  const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 100, 1), 100)
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0)
  return { limit, offset }
}

export async function getGlobalLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit, offset } = parsePagination(req)
    res.json(await calculateLeaderboard(undefined, limit, offset))
  } catch (error) {
    next(error)
  }
}

export async function getMonthlyLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit, offset } = parsePagination(req)
    res.json(await calculateLeaderboard({ gte: startOfMonthUTC() }, limit, offset))
  } catch (error) {
    next(error)
  }
}

export async function getWeeklyLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { limit, offset } = parsePagination(req)
    res.json(await calculateLeaderboard({ gte: startOfWeekUTC() }, limit, offset))
  } catch (error) {
    next(error)
  }
}

async function rankForPeriod(userId: string, dateFilter?: { gte: Date }): Promise<number> {
  const whereClause = dateFilter ? { date: dateFilter } : {}

  const userTotal = await prisma.climb.aggregate({
    where: { userId, ...whereClause },
    _sum: { points: true },
    _count: true,
  })

  if (userTotal._count === 0) {
    return 0
  }

  const points = userTotal._sum.points || 0

  // Rank = users with strictly more points, plus one. Aggregate rows are one
  // per user, so this stays small even with a large climb table.
  const grouped = await prisma.climb.groupBy({
    by: ['userId'],
    where: whereClause,
    _sum: { points: true },
  })
  const ahead = grouped.filter((g) => (g._sum.points || 0) > points).length

  return ahead + 1
}

export async function getUserRank(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.params.userId as string

    const [global, monthly, weekly] = await Promise.all([
      rankForPeriod(userId),
      rankForPeriod(userId, { gte: startOfMonthUTC() }),
      rankForPeriod(userId, { gte: startOfWeekUTC() }),
    ])

    res.json({ global, monthly, weekly })
  } catch (error) {
    next(error)
  }
}
