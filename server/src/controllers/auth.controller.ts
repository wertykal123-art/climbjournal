import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import { hashPassword, verifyPassword } from '../utils/password.js'
import { signAccessToken, signRefreshToken, verifyToken, getRefreshTokenExpiry } from '../utils/jwt.js'
import { RegisterInput, LoginInput } from '../schemas/auth.schema.js'
import { ConflictError, UnauthorizedError, NotFoundError } from '../middleware/error.middleware.js'
import crypto from 'crypto'

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
        createdAt: true,
        updatedAt: true,
      },
    })

    const accessToken = signAccessToken({ userId: user.id, email: user.email })
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email })

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: getRefreshTokenExpiry(),
      },
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    })

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
    const refreshToken = signRefreshToken({ userId: user.id, email: user.email })

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: crypto.createHash('sha256').update(refreshToken).digest('hex'),
        expiresAt: getRefreshTokenExpiry(),
      },
    })

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    })

    res.json({
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        profilePicture: user.profilePicture,
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
      payload = verifyToken(refreshToken)
    } catch {
      throw new UnauthorizedError('Invalid refresh token')
    }

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
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

    const newAccessToken = signAccessToken({ userId: user.id, email: user.email })

    res.json({ accessToken: newAccessToken })
  } catch (error) {
    next(error)
  }
}

export async function logout(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken

    if (refreshToken) {
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex')
      await prisma.refreshToken.deleteMany({
        where: { token: tokenHash },
      })
    }

    res.clearCookie('refreshToken')
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
