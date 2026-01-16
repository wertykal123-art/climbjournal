import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { UpdateProfileInput, ChangePasswordInput } from '../schemas/auth.schema.js'
import { ConflictError, UnauthorizedError, NotFoundError } from '../middleware/error.middleware.js'

export async function getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            locations: true,
            routes: true,
            climbs: true,
          },
        },
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    res.json({
      ...user,
      totalLocations: user._count.locations,
      totalRoutes: user._count.routes,
      totalClimbs: user._count.climbs,
    })
  } catch (error) {
    next(error)
  }
}

export async function updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { displayName, username, profilePicture } = req.body as UpdateProfileInput

    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: {
          username,
          NOT: { id: req.user!.userId },
        },
      })

      if (existingUser) {
        throw new ConflictError('Username already taken')
      }
    }

    const user = await prisma.user.update({
      where: { id: req.user!.userId },
      data: {
        ...(displayName && { displayName }),
        ...(username && { username }),
        ...(profilePicture !== undefined && { profilePicture }),
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    res.json(user)
  } catch (error) {
    next(error)
  }
}

export async function changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { currentPassword, newPassword } = req.body as ChangePasswordInput

    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    const isValidPassword = await verifyPassword(currentPassword, user.passwordHash)
    if (!isValidPassword) {
      throw new UnauthorizedError('Current password is incorrect')
    }

    const newPasswordHash = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: req.user!.userId },
      data: { passwordHash: newPasswordHash },
    })

    res.json({ message: 'Password changed successfully' })
  } catch (error) {
    next(error)
  }
}

export async function deleteAccount(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    await prisma.user.delete({
      where: { id: req.user!.userId },
    })

    res.clearCookie('refreshToken')
    res.json({ message: 'Account deleted successfully' })
  } catch (error) {
    next(error)
  }
}
