import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { CreateLocationInput, UpdateLocationInput } from '../schemas/location.schema.js'
import { NotFoundError, ForbiddenError } from '../middleware/error.middleware.js'
import { getFriendIds } from '../utils/access.js'

const userSelect = {
  id: true,
  username: true,
  displayName: true,
  profilePicture: true,
}

export async function getLocations(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId
    const friendIds = await getFriendIds(userId)

    const locations = await prisma.location.findMany({
      where: {
        OR: [
          { userId },
          { isPublic: true },
          { userId: { in: friendIds } },
        ],
      },
      include: {
        user: { select: userSelect },
        _count: {
          select: { routes: true },
        },
      },
      orderBy: { name: 'asc' },
    })

    res.json(
      locations.map((loc) => ({
        ...loc,
        routeCount: (loc as { _count: { routes: number } })._count.routes,
        _count: undefined,
      }))
    )
  } catch (error) {
    next(error)
  }
}

export async function getLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string
    const userId = req.user!.userId

    const location = await prisma.location.findUnique({
      where: { id },
      include: {
        user: { select: userSelect },
        _count: {
          select: { routes: true },
        },
      },
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

    res.json({
      ...location,
      routeCount: (location as { _count: { routes: number } })._count.routes,
      _count: undefined,
    })
  } catch (error) {
    next(error)
  }
}

export async function createLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const data = req.body as CreateLocationInput

    const location = await prisma.location.create({
      data: {
        ...data,
        userId: req.user!.userId,
      },
    })

    res.status(201).json({ ...location, routeCount: 0 })
  } catch (error) {
    next(error)
  }
}

export async function updateLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string
    const data = req.body as UpdateLocationInput

    const existing = await prisma.location.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('Location')
    }

    if (existing.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to update this location')
    }

    const location = await prisma.location.update({
      where: { id },
      data,
      include: {
        _count: {
          select: { routes: true },
        },
      },
    })

    res.json({
      ...location,
      routeCount: (location as { _count: { routes: number } })._count.routes,
      _count: undefined,
    })
  } catch (error) {
    next(error)
  }
}

export async function deleteLocation(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string

    const existing = await prisma.location.findUnique({
      where: { id },
    })

    if (!existing) {
      throw new NotFoundError('Location')
    }

    if (existing.userId !== req.user!.userId) {
      throw new ForbiddenError('Not authorized to delete this location')
    }

    await prisma.location.delete({
      where: { id },
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
