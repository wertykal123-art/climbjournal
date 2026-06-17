import { prisma } from '../models/prisma.js'
import { calculatePoints, ClimbType } from '../utils/points.js'

/**
 * Recalculates the stored `points` for every climb using the current point
 * system (GRADE_BASE_POINTS x CLIMB_TYPE_MULTIPLIERS).
 *
 * Run after changing the point formula so existing journal entries,
 * leaderboards and stats reflect the new values:
 *   npx tsx src/scripts/recalculatePoints.ts
 */
async function main() {
  const climbs = await prisma.climb.findMany({
    include: { route: { select: { difficultyFrench: true } } },
  })

  console.log(`Recalculating points for ${climbs.length} climbs...`)

  let updated = 0
  for (const climb of climbs) {
    const points = calculatePoints(climb.route.difficultyFrench, climb.climbType as ClimbType)
    if (points !== climb.points) {
      await prisma.climb.update({
        where: { id: climb.id },
        data: { points },
      })
      updated++
    }
  }

  console.log(`Done. Updated ${updated} of ${climbs.length} climbs.`)
}

main()
  .catch((err) => {
    console.error(err)
    process.exitCode = 1
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
