import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { CreateClimbInput, UpdateClimbInput, ClimbFilters } from '../schemas/climb.schema.js'
import { NotFoundError, ForbiddenError } from '../middleware/error.middleware.js'
import { calculatePoints } from '../utils/points.js'

export async function getClimbs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { routeId, locationId, climbType, from, to, page, limit } = req.query as unknown as ClimbFilters

    const where: Record<string, unknown> = { userId: req.user!.userId }

    if (routeId) {
      where.routeId = routeId
    }

    if (locationId) {
      where.route = { locationId }
    }

    if (climbType) {
      const types = climbType.split(',')
      where.climbType = { in: types }
    }

    if (from || to) {
      where.date = {}
      if (from) {
        (where.date as Record<string, Date>).gte = new Date(from)
      }
      if (to) {
        (where.date as Record<string, Date>).lte = new Date(to)
      }
    }

    const [climbs, total] = await Promise.all([
      prisma.climb.findMany({
        where,
        include: {
          route: {
            include: {
              location: {
                select: { id: true, name: true, type: true },
              },
            },
          },
        },
        orderBy: { date: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.climb.count({ where }),
    ])

    res.json({
      data: climbs,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}

export async function getClimb(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string

    const climb = await prisma.climb.findUnique({
      where: { id },
      include: {
        route: {
          include: {
            location: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
    })

    if (!climb) {
      throw new NotFoundError('Climb')
    }

    if (climb.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to access this climb')
    }

    res.json(climb)
  } catch (error) {
    next(error)
  }
}

export async function getRouteClimbs(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const routeId = req.params.routeId as string

    const route = await prisma.route.findUnique({
      where: { id: routeId },
    })

    if (!route) {
      throw new NotFoundError('Route')
    }

    if (route.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to access this route')
    }

    const climbs = await prisma.climb.findMany({
      where: { routeId },
      orderBy: { date: 'desc' },
    })

    res.json(climbs)
  } catch (error) {
    next(error)
  }
}

export async function createClimb(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as CreateClimbInput

    const route = await prisma.route.findUnique({
      where: { id: data.routeId },
    })

    if (!route) {
      throw new NotFoundError('Route')
    }

    if (route.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to log climbs on this route')
    }

    const points = calculatePoints(route.difficultyFrench, data.climbType)

    const climb = await prisma.climb.create({
      data: {
        ...data,
        date: new Date(data.date),
        points,
        userId: req.user!.userId,
      },
      include: {
        route: {
          include: {
            location: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
    })

    res.status(201).json(climb)
  } catch (error) {
    next(error)
  }
}

export async function updateClimb(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string
    const data = req.body as UpdateClimbInput

    const existing = await prisma.climb.findUnique({
      where: { id },
      include: { route: true },
    })

    if (!existing) {
      throw new NotFoundError('Climb')
    }

    if (existing.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to update this climb')
    }

    const updateData: Record<string, unknown> = { ...data }

    if (data.date) {
      updateData.date = new Date(data.date)
    }

    if (data.climbType && existing.route) {
      updateData.points = calculatePoints(existing.route.difficultyFrench, data.climbType)
    }

    const climb = await prisma.climb.update({
      where: { id },
      data: updateData,
      include: {
        route: {
          include: {
            location: {
              select: { id: true, name: true, type: true },
            },
          },
        },
      },
    })

    res.json(climb)
  } catch (error) {
    next(error)
  }
}

export async function deleteClimb(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string

    const existing = await prisma.climb.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('Climb')
    }

    if (existing.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to delete this climb')
    }

    await prisma.climb.delete({
      where: { id },
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
