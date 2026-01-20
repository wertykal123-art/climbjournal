import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { CreateRouteInput, UpdateRouteInput, RouteFilters } from '../schemas/route.schema.js'
import { NotFoundError, ForbiddenError } from '../middleware/error.middleware.js'
import { getGradeIndex } from '../utils/grades.js'
import { frenchToUIAA } from '../utils/grades.js'
import { getFriendIds, areFriends } from '../utils/access.js'

const userSelect = {
  id: true,
  username: true,
  displayName: true,
  profilePicture: true,
}

export async function getRoutes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { locationId, minGrade, maxGrade, search, page, limit } = req.query as unknown as RouteFilters
    const userId = req.user!.userId
    const friendIds = await getFriendIds(userId)

    const where: Record<string, unknown> = {
      OR: [
        { userId },
        { isPublic: true },
        { userId: { in: friendIds } },
      ],
    }

    if (locationId) {
      where.locationId = locationId
    }

    if (search) {
      where.AND = [
        {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { visualId: { contains: search, mode: 'insensitive' } },
            { setter: { contains: search, mode: 'insensitive' } },
          ],
        },
      ]
    }

    const [routes, total] = await Promise.all([
      prisma.route.findMany({
        where,
        include: {
          user: { select: userSelect },
          location: {
            select: { id: true, name: true, type: true, userId: true },
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
    const userId = req.user!.userId

    const route = await prisma.route.findUnique({
      where: { id },
      include: {
        user: { select: userSelect },
        location: {
          select: { id: true, name: true, type: true, userId: true },
        },
        _count: {
          select: { climbs: true },
        },
      },
    })

    if (!route) {
      throw new NotFoundError('Route')
    }

    const isOwner = route.userId === userId
    if (!isOwner && !route.isPublic) {
      const friendIds = await getFriendIds(userId)
      if (!friendIds.includes(route.userId)) {
        throw new ForbiddenError('Not authorized to access this route')
      }
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
    const userId = req.user!.userId

    const location = await prisma.location.findUnique({
      where: { id: locationId },
    })

    if (!location) {
      throw new NotFoundError('Location')
    }

    const isOwner = location.userId === userId
    if (!isOwner && !location.isPublic) {
      const friendIds = await getFriendIds(userId)
      if (!friendIds.includes(location.userId)) {
        throw new ForbiddenError('Not authorized to access this location')
      }
    }

    const routes = await prisma.route.findMany({
      where: { locationId },
      include: {
        user: { select: userSelect },
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
    const userId = req.user!.userId

    const location = await prisma.location.findUnique({
      where: { id: data.locationId },
    })

    if (!location) {
      throw new NotFoundError('Location')
    }

    // Allow creating routes on own locations or friend's locations
    const isOwner = location.userId === userId
    const isFriend = !isOwner && await areFriends(userId, location.userId)

    if (!isOwner && !isFriend) {
      throw new ForbiddenError('Not authorized to add routes to this location')
    }

    const route = await prisma.route.create({
      data: {
        ...data,
        difficultyUIAA: data.difficultyUIAA || frenchToUIAA(data.difficultyFrench),
        userId: userId,
      },
      include: {
        location: {
          select: { id: true, name: true, type: true, userId: true },
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
    const userId = req.user!.userId

    const existing = await prisma.route.findUnique({
      where: { id },
      include: {
        location: { select: { userId: true } },
      },
    })

    if (!existing) {
      throw new NotFoundError('Route')
    }

    // Allow editing if user owns the route OR is a friend of the location owner
    const isRouteOwner = existing.userId === userId
    const isLocationOwnerFriend = !isRouteOwner && await areFriends(userId, existing.location.userId)

    if (!isRouteOwner && !isLocationOwnerFriend) {
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
          select: { id: true, name: true, type: true, userId: true },
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
    const userId = req.user!.userId

    const existing = await prisma.route.findUnique({
      where: { id },
      include: {
        location: { select: { userId: true } },
      },
    })

    if (!existing) {
      throw new NotFoundError('Route')
    }

    // Allow deleting if user owns the route OR owns the location
    const isRouteOwner = existing.userId === userId
    const isLocationOwner = existing.location.userId === userId

    if (!isRouteOwner && !isLocationOwner) {
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
