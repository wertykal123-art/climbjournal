import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { BadRequestError } from '../middleware/error.middleware.js'

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
      locations: locations.map((loc) => ({
        name: loc.name,
        type: loc.type,
        address: loc.address,
        country: loc.country,
        description: loc.description,
      })),
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
    const data = req.body

    if (!data || !data.locations || !data.routes || !data.climbs) {
      throw new BadRequestError('Invalid import data format')
    }

    const imported = {
      locations: 0,
      routes: 0,
      climbs: 0,
    }

    // Import locations
    const locationMap: Record<string, string> = {}
    for (const loc of data.locations) {
      const existing = await prisma.location.findFirst({
        where: { userId, name: loc.name },
      })

      if (existing) {
        locationMap[loc.name] = existing.id
      } else {
        const created = await prisma.location.create({
          data: {
            userId,
            name: loc.name,
            type: loc.type,
            address: loc.address,
            country: loc.country,
            description: loc.description,
          },
        })
        locationMap[loc.name] = created.id
        imported.locations++
      }
    }

    // Import routes
    const routeMap: Record<string, string> = {}
    for (const route of data.routes) {
      const locationId = locationMap[route.locationName]
      if (!locationId) continue

      const key = `${route.locationName}:${route.name}`
      const existing = await prisma.route.findFirst({
        where: { userId, locationId, name: route.name },
      })

      if (existing) {
        routeMap[key] = existing.id
      } else {
        const created = await prisma.route.create({
          data: {
            userId,
            locationId,
            name: route.name,
            difficultyFrench: route.difficultyFrench,
            difficultyUIAA: route.difficultyUIAA,
            heightMeters: route.heightMeters,
            protectionCount: route.protectionCount,
            visualId: route.visualId,
            setter: route.setter,
            description: route.description,
          },
        })
        routeMap[key] = created.id
        imported.routes++
      }
    }

    // Import climbs
    for (const climb of data.climbs) {
      const key = `${climb.locationName}:${climb.routeName}`
      const routeId = routeMap[key]
      if (!routeId) continue

      const climbDate = new Date(climb.date)

      const existing = await prisma.climb.findFirst({
        where: {
          userId,
          routeId,
          date: climbDate,
          climbType: climb.climbType,
        },
      })

      if (!existing) {
        await prisma.climb.create({
          data: {
            userId,
            routeId,
            date: climbDate,
            climbType: climb.climbType,
            attemptCount: climb.attemptCount || 1,
            personalRating: climb.personalRating,
            comments: climb.comments,
            points: climb.points,
          },
        })
        imported.climbs++
      }
    }

    res.json({
      message: 'Import completed successfully',
      imported,
    })
  } catch (error) {
    next(error)
  }
}
