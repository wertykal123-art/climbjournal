import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { ImportDataInput } from '../schemas/export.schema.js'
import { calculatePoints, ClimbType } from '../utils/points.js'
import { frenchToUIAA } from '../utils/grades.js'

export async function exportData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        preferredGradingSystem: true,
      },
    })

    const locations = await prisma.location.findMany({
      where: { userId },
      select: {
        name: true,
        type: true,
        address: true,
        country: true,
        description: true,
        isPublic: true,
        defaultGradingSystem: true,
      },
    })

    const routes = await prisma.route.findMany({
      where: { userId },
      include: {
        location: {
          select: { name: true },
        },
      },
    })

    const climbs = await prisma.climb.findMany({
      where: { userId },
      include: {
        route: {
          include: {
            location: {
              select: { name: true },
            },
          },
        },
      },
    })

    const exportData = {
      user,
      locations,
      routes: routes.map((route) => ({
        locationName: route.location.name,
        name: route.name,
        difficultyFrench: route.difficultyFrench,
        difficultyUIAA: route.difficultyUIAA,
        heightMeters: route.heightMeters,
        protectionCount: route.protectionCount,
        visualId: route.visualId,
        setter: route.setter,
        description: route.description,
        color: route.color,
        stoneType: route.stoneType,
        isPublic: route.isPublic,
        isActive: route.isActive,
      })),
      climbs: climbs.map((climb) => ({
        routeName: climb.route.name,
        locationName: climb.route.location.name,
        date: climb.date.toISOString(),
        climbType: climb.climbType,
        attemptCount: climb.attemptCount,
        personalRating: climb.personalRating,
        comments: climb.comments,
        points: climb.points,
      })),
      exportedAt: new Date().toISOString(),
    }

    res.json(exportData)
  } catch (error) {
    next(error)
  }
}

export async function importData(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const data = req.body as ImportDataInput

    const imported = await prisma.$transaction(
      async (tx) => {
        const counts = { locations: 0, routes: 0, climbs: 0 }

        // Import locations
        const locationMap: Record<string, string> = {}
        for (const loc of data.locations) {
          const existing = await tx.location.findFirst({
            where: { userId, name: loc.name },
          })

          if (existing) {
            locationMap[loc.name] = existing.id
          } else {
            const created = await tx.location.create({
              data: {
                userId,
                name: loc.name,
                type: loc.type,
                address: loc.address,
                country: loc.country,
                description: loc.description,
                isPublic: loc.isPublic,
                defaultGradingSystem: loc.defaultGradingSystem,
              },
            })
            locationMap[loc.name] = created.id
            counts.locations++
          }
        }

        // Import routes; remember each route's grade to recompute climb points
        const routeMap: Record<string, { id: string; difficultyFrench: string }> = {}
        for (const route of data.routes) {
          const locationId = locationMap[route.locationName]
          if (!locationId) continue

          const key = `${route.locationName}:${route.name}`
          const existing = await tx.route.findFirst({
            where: { userId, locationId, name: route.name },
          })

          if (existing) {
            routeMap[key] = { id: existing.id, difficultyFrench: existing.difficultyFrench }
          } else {
            const created = await tx.route.create({
              data: {
                userId,
                locationId,
                name: route.name,
                difficultyFrench: route.difficultyFrench,
                difficultyUIAA: route.difficultyUIAA ?? frenchToUIAA(route.difficultyFrench),
                heightMeters: route.heightMeters,
                protectionCount: route.protectionCount,
                visualId: route.visualId,
                setter: route.setter,
                description: route.description,
                color: route.color,
                stoneType: route.stoneType,
                isPublic: route.isPublic,
                isActive: route.isActive,
              },
            })
            routeMap[key] = { id: created.id, difficultyFrench: created.difficultyFrench }
            counts.routes++
          }
        }

        // Import climbs
        for (const climb of data.climbs) {
          const key = `${climb.locationName}:${climb.routeName}`
          const route = routeMap[key]
          if (!route) continue

          const climbDate = new Date(climb.date)

          const existing = await tx.climb.findFirst({
            where: {
              userId,
              routeId: route.id,
              date: climbDate,
              climbType: climb.climbType,
            },
          })

          if (!existing) {
            await tx.climb.create({
              data: {
                userId,
                routeId: route.id,
                date: climbDate,
                climbType: climb.climbType,
                attemptCount: climb.attemptCount,
                personalRating: climb.personalRating,
                comments: climb.comments,
                points: calculatePoints(route.difficultyFrench, climb.climbType as ClimbType),
              },
            })
            counts.climbs++
          }
        }

        return counts
      },
      { timeout: 120_000 }
    )

    res.json({
      message: 'Import completed successfully',
      imported,
    })
  } catch (error) {
    next(error)
  }
}
