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

async function calculateLeaderboard(
  dateFilter?: { gte: Date }
): Promise<LeaderboardEntry[]> {
  const whereClause = dateFilter ? { date: dateFilter } : {}

  const users = await prisma.user.findMany({
    select: {
      id: true,
      username: true,
      displayName: true,
      profilePicture: true,
      climbs: {
        where: whereClause,
        include: { route: true },
      },
    },
  })

  const leaderboard = users
    .map((user) => {
      const totalPoints = user.climbs.reduce((sum, c) => sum + c.points, 0)
      const totalClimbs = user.climbs.length

      const successfulClimbs = user.climbs.filter((c) => c.climbType !== 'TRY')
      let hardestGrade: string | null = null
      if (successfulClimbs.length > 0) {
        hardestGrade = successfulClimbs.reduce((hardest, climb) => {
          if (!hardest || compareGrades(climb.route.difficultyFrench, hardest) > 0) {
            return climb.route.difficultyFrench
          }
          return hardest
        }, '' as string)
      }

      return {
        userId: user.id,
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        totalPoints,
        totalClimbs,
        hardestGrade,
      }
    })
    .filter((u) => u.totalClimbs > 0)
    .sort((a, b) => b.totalPoints - a.totalPoints)
    .map((entry, index) => ({
      rank: index + 1,
      ...entry,
    }))

  return leaderboard
}

export async function getGlobalLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 100
    const offset = parseInt(req.query.offset as string) || 0

    const leaderboard = await calculateLeaderboard()
    const paginated = leaderboard.slice(offset, offset + limit)

    res.json(paginated)
  } catch (error) {
    next(error)
  }
}

export async function getMonthlyLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 100
    const offset = parseInt(req.query.offset as string) || 0

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const leaderboard = await calculateLeaderboard({ gte: startOfMonth })
    const paginated = leaderboard.slice(offset, offset + limit)

    res.json(paginated)
  } catch (error) {
    next(error)
  }
}

export async function getWeeklyLeaderboard(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const limit = parseInt(req.query.limit as string) || 100
    const offset = parseInt(req.query.offset as string) || 0

    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const leaderboard = await calculateLeaderboard({ gte: startOfWeek })
    const paginated = leaderboard.slice(offset, offset + limit)

    res.json(paginated)
  } catch (error) {
    next(error)
  }
}

export async function getUserRank(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { userId } = req.params

    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const startOfWeek = new Date()
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay())
    startOfWeek.setHours(0, 0, 0, 0)

    const [globalBoard, monthlyBoard, weeklyBoard] = await Promise.all([
      calculateLeaderboard(),
      calculateLeaderboard({ gte: startOfMonth }),
      calculateLeaderboard({ gte: startOfWeek }),
    ])

    const globalRank = globalBoard.find((e) => e.userId === userId)?.rank || 0
    const monthlyRank = monthlyBoard.find((e) => e.userId === userId)?.rank || 0
    const weeklyRank = weeklyBoard.find((e) => e.userId === userId)?.rank || 0

    res.json({
      global: globalRank,
      monthly: monthlyRank,
      weekly: weeklyRank,
    })
  } catch (error) {
    next(error)
  }
}
