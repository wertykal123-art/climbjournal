import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { CreateRouteInput, UpdateRouteInput, RouteFilters } from '../schemas/route.schema.js'
import { NotFoundError, ForbiddenError } from '../middleware/error.middleware.js'
import { getGradeIndex } from '../utils/grades.js'
import { frenchToUIAA } from '../utils/grades.js'

export async function getRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { locationId, minGrade, maxGrade, search, page, limit } = req.query as unknown as RouteFilters

    const where: Record<string, unknown> = { userId: req.user!.userId }

    if (locationId) {
      where.locationId = locationId
    }

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { visualId: { contains: search, mode: 'insensitive' } },
        { setter: { contains: search, mode: 'insensitive' } },
      ]
    }

    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where,
        include: {
          location: {
            select: { id: true, name: true, type: true },
          },
          _count: {
            select: { climbs: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.route.count({ where }),
    ])

    let filteredRoutes = routes
    if (minGrade || maxGrade) {
      const minIdx = minGrade ? getGradeIndex(minGrade) : -1
      const maxIdx = maxGrade ? getGradeIndex(maxGrade) : Infinity

      filteredRoutes = routes.filter((r) => {
        const idx = getGradeIndex(r.difficultyFrench)
        return idx >= minIdx && idx <= maxIdx
      })
    }

    res.json({
      data: filteredRoutes.map((r) => ({
        ...r,
        climbCount: (r as { _count: { climbs: number } })._count.climbs,
        _count: undefined,
      })),
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    next(error)
  }
}

export async function getRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        location: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: { climbs: true },
        },
      },
    })

    if (!route) {
      throw new NotFoundError('Route')
    }

    if (route.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to access this route')
    }

    res.json({
      ...route,
      climbCount: (route as { _count: { climbs: number } })._count.climbs,
      _count: undefined,
    })
  } catch (error) {
    next(error)
  }
}

export async function getLocationRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const locationId = req.params.locationId as string

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    })

    if (!location) {
      throw new NotFoundError('Location')
    }

    if (location.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to access this location')
    }

    const routes = await prisma.route.findMany({
      where: { locationId },
      include: {
        _count: {
          select: { climbs: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    res.json(
      routes.map((r) => ({
        ...r,
        climbCount: (r as { _count: { climbs: number } })._count.climbs,
        _count: undefined,
      }))
    )
  } catch (error) {
    next(error)
  }
}

export async function createRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as CreateRouteInput

    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    })

    if (!location) {
      throw new NotFoundError('Location')
    }

    if (location.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to add routes to this location')
    }

    const route = await prisma.route.create({
      data: {
        ...data,
        difficultyUIAA: data.difficultyUIAA || frenchToUIAA(data.difficultyFrench),
        userId: req.user!.userId,
      },
      include: {
        location: {
          select: { id: true, name: true, type: true },
        },
      },
    })

    res.status(201).json({ ...route, climbCount: 0 })
  } catch (error) {
    next(error)
  }
}

export async function updateRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string
    const data = req.body as UpdateRouteInput

    const existing = await prisma.route.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('Route')
    }

    if (existing.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to update this route')
    }

    const updateData: Record<string, unknown> = { ...data }
    if (data.difficultyFrench && !data.difficultyUIAA) {
      updateData.difficultyUIAA = frenchToUIAA(data.difficultyFrench)
    }

    const route = await prisma.route.update({
      where: { id },
      data: updateData,
      include: {
        location: {
          select: { id: true, name: true, type: true },
        },
        _count: {
          select: { climbs: true },
        },
      },
    })

    res.json({
      ...route,
      climbCount: (route as { _count: { climbs: number } })._count.climbs,
      _count: undefined,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteRoute(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string

    const existing = await prisma.route.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('Route')
    }

    if (existing.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to delete this route')
    }

    await prisma.route.delete({
      where: { id },
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
