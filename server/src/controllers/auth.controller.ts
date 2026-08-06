import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signAccessToken, signRefreshToken, verifyToken, getRefreshTokenExpiry } from '../utils/jwt.js'
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js'
import { ConflictError, UnauthorizedError, NotFoundError } from '../middleware/error.middleware.js'
import { config } from '../config/index.js'
import crypto from 'crypto'

const REFRESH_COOKIE = 'refreshToken'

// Shared between set and clear: browsers only reliably clear a cookie when
// the attributes match the ones it was set with.
export const refreshCookieOptions = {
  httpOnly: true,
  secure: config.nodeEnv === 'production',
  sameSite: 'strict' as const,
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

async function issueRefreshToken(res: Response, userId: string, email: string): Promise<void> {
  const refreshToken = signRefreshToken({ userId, email })

  await prisma.refreshToken.create({
    data: {
      userId,
      token: hashToken(refreshToken),
      expiresAt: getRefreshTokenExpiry(),
    },
  })

  // Opportunistically drop this user's expired tokens so the table
  // doesn't grow forever.
  await prisma.refreshToken.deleteMany({
    where: { userId, expiresAt: { lt: new Date() } },
  })

  res.cookie(REFRESH_COOKIE, refreshToken, {
    ...refreshCookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  })
}

export async function register(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, username, displayName, password } = req.body as RegisterInput

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    })

    if (existingUser) {
      if (existingUser.email === email) {
        throw new ConflictError('Email already registered')
      }
      throw new ConflictError('Username already taken')
    }

    const passwordHash = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        username,
        displayName,
        passwordHash,
      },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        preferredGradingSystem: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    const accessToken = signAccessToken({ userId: user.id, email: user.email })
    await issueRefreshToken(res, user.id, user.email)

    res.status(201).json({
      user,
      accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function login(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { email, password } = req.body as LoginInput

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const isValidPassword = await verifyPassword(password, user.passwordHash)
    if (!isValidPassword) {
      throw new UnauthorizedError('Invalid email or password')
    }

    const accessToken = signAccessToken({ userId: user.id, email: user.email })
    await issueRefreshToken(res, user.id, user.email)

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
        preferredGradingSystem: user.preferredGradingSystem,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      accessToken,
    })
  } catch (error) {
    next(error)
  }
}

export async function refresh(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken

    if (!refreshToken) {
      throw new UnauthorizedError('Refresh token required')
    }

    let payload
    try {
      payload = verifyToken(refreshToken, 'refresh')
    } catch {
      throw new UnauthorizedError('Invalid refresh token')
    }

    const tokenHash = hashToken(refreshToken)
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: tokenHash },
    })

    if (!storedToken || storedToken.expiresAt < new Date()) {
      throw new UnauthorizedError('Invalid or expired refresh token')
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    })

    if (!user) {
      throw new UnauthorizedError('User not found')
    }

    // Rotate: a refresh token is single-use, so a stolen copy stops working
    // as soon as either party uses it.
    await prisma.refreshToken.delete({ where: { id: storedToken.id } })

    const newAccessToken = signAccessToken({ userId: user.id, email: user.email })
    await issueRefreshToken(res, user.id, user.email)

    res.json({ accessToken: newAccessToken })
  } catch (error) {
    next(error)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken

    if (refreshToken) {
      await prisma.refreshToken.deleteMany({
        where: { token: hashToken(refreshToken) },
      })
    }

    res.clearCookie(REFRESH_COOKIE, refreshCookieOptions)
    res.json({ message: 'Logged out successfully' })
  } catch (error) {
    next(error)
  }
}

export async function getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.userId },
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        profilePicture: true,
        preferredGradingSystem: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user) {
      throw new NotFoundError('User')
    }

    res.json(user)
  } catch (error) {
    next(error)
  }
}
