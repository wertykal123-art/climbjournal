import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { compareGrades, FRENCH_GRADES } from '../utils/grades.js'

export async function getOverview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const [totalClimbs, totalRoutes, totalLocations, pointsResult, climbs] = await Promise.all([
      prisma.climb.count({ where: { userId } }),
      prisma.route.count({ where: { userId } }),
      prisma.location.count({ where: { userId } }),
      prisma.climb.aggregate({
        where: { userId },
        _sum: { points: true },
      }),
      prisma.climb.findMany({
        where: { userId },
        include: { route: true },
        orderBy: { date: 'desc' },
      }),
    ])

    const totalPoints = pointsResult._sum.points || 0

    // Find hardest grade
    let hardestGrade: string | null = null
    const successfulClimbs = climbs.filter((c) => c.climbType !== 'TRY')
    if (successfulClimbs.length > 0) {
      hardestGrade = successfulClimbs.reduce((hardest, climb) => {
        if (!hardest || compareGrades(climb.route.difficultyFrench, hardest) > 0) {
          return climb.route.difficultyFrench
        }
        return hardest
      }, '' as string)
    }

    // Calculate streaks
    let currentStreak = 0
    let bestStreak = 0
    let tempStreak = 0
    let lastDate: Date | null = null

    const climbDates = [...new Set(climbs.map((c) => c.date.toISOString().split('T')[0]))].sort().reverse()

    const today = new Date().toISOString().split('T')[0]
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]

    for (const dateStr of climbDates) {
      if (!lastDate) {
        if (dateStr === today || dateStr === yesterday) {
          tempStreak = 1
          currentStreak = 1
        }
        lastDate = new Date(dateStr)
        continue
      }

      const diff = (lastDate.getTime() - new Date(dateStr).getTime()) / 86400000

      if (diff === 1) {
        tempStreak++
        if (currentStreak > 0) {
          currentStreak = tempStreak
        }
      } else {
        bestStreak = Math.max(bestStreak, tempStreak)
        tempStreak = 1
      }

      lastDate = new Date(dateStr)
    }
    bestStreak = Math.max(bestStreak, tempStreak)

    // This month stats
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const thisMonthClimbs = climbs.filter((c) => c.date >= startOfMonth)
    const thisMonthPoints = thisMonthClimbs.reduce((sum, c) => sum + c.points, 0)

    res.json({
      totalClimbs,
      totalPoints,
      totalRoutes,
      totalLocations,
      hardestGrade,
      currentStreak,
      bestStreak,
      thisMonthClimbs: thisMonthClimbs.length,
      thisMonthPoints,
    })
  } catch (error) {
    next(error)
  }
}

export async function getTimeline(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const { period = 'year', groupBy = 'month' } = req.query as { period?: string; groupBy?: string }

    let startDate = new Date()
    switch (period) {
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
      case 'all':
        startDate = new Date(0)
        break
    }

    const climbs = await prisma.climb.findMany({
      where: {
        userId,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    })

    const groupedData: Record<string, { climbs: number; points: number }> = {}

    for (const climb of climbs) {
      let key: string
      const date = climb.date

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekStart = new Date(date)
          weekStart.setDate(date.getDate() - date.getDay())
          key = weekStart.toISOString().split('T')[0]
          break
        case 'month':
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
      }

      if (!groupedData[key]) {
        groupedData[key] = { climbs: 0, points: 0 }
      }
      groupedData[key].climbs++
      groupedData[key].points += climb.points
    }

    const timeline = Object.entries(groupedData)
      .map(([date, data]) => ({
        date,
        climbs: data.climbs,
        points: data.points,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))

    res.json(timeline)
  } catch (error) {
    next(error)
  }
}

export async function getDistribution(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const climbs = await prisma.climb.findMany({
      where: { userId, climbType: { not: 'TRY' } },
      include: { route: true },
    })

    const distribution: Record<string, { count: number; points: number }> = {}

    for (const climb of climbs) {
      const grade = climb.route.difficultyFrench
      if (!distribution[grade]) {
        distribution[grade] = { count: 0, points: 0 }
      }
      distribution[grade].count++
      distribution[grade].points += climb.points
    }

    const result = FRENCH_GRADES.filter((g) => distribution[g])
      .map((grade) => ({
        grade,
        count: distribution[grade].count,
        points: distribution[grade].points,
      }))

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getTypes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const climbs = await prisma.climb.groupBy({
      by: ['climbType'],
      where: { userId },
      _count: true,
    })

    const total = climbs.reduce((sum, c) => sum + c._count, 0)

    const result = climbs.map((c) => ({
      type: c.climbType,
      count: c._count,
      percentage: total > 0 ? Math.round((c._count / total) * 100) : 0,
    }))

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getPyramid(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const climbs = await prisma.climb.findMany({
      where: { userId, climbType: { not: 'TRY' } },
      include: { route: true },
    })

    const pyramid: Record<string, { count: number; points: number }> = {}

    for (const climb of climbs) {
      const grade = climb.route.difficultyFrench
      if (!pyramid[grade]) {
        pyramid[grade] = { count: 0, points: 0 }
      }
      pyramid[grade].count++
      pyramid[grade].points += climb.points
    }

    const result = FRENCH_GRADES.filter((g) => pyramid[g])
      .map((grade) => ({
        grade,
        count: pyramid[grade].count,
        points: pyramid[grade].points,
      }))
      .reverse() // Hardest grades first for pyramid view

    res.json(result)
  } catch (error) {
    next(error)
  }
}

export async function getProgression(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const climbs = await prisma.climb.findMany({
      where: { userId, climbType: { not: 'TRY' } },
      include: { route: true },
      orderBy: { date: 'asc' },
    })

    const progressionMap: Record<string, string> = {}
    let currentHardest = ''

    for (const climb of climbs) {
      const grade = climb.route.difficultyFrench
      const dateKey = climb.date.toISOString().split('T')[0]

      if (!currentHardest || compareGrades(grade, currentHardest) > 0) {
        currentHardest = grade
      }

      progressionMap[dateKey] = currentHardest
    }

    const result = Object.entries(progressionMap)
      .map(([date, hardestGrade]) => ({ date, hardestGrade }))
      .sort((a, b) => a.date.localeCompare(b.date))

    res.json(result)
  } catch (error) {
    next(error)
  }
}
