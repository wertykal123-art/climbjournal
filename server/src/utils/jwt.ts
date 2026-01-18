import jwt, { SignOptions } from 'jsonwebtoken'
import { config } from '../config/index.js'

export interface TokenPayload {
  userId: string
  email: string
}

export function signAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.expiresIn,
  } as SignOptions)
}

export function signRefreshToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: config.jwt.refreshExpiresIn,
  } as SignOptions)
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload
}

export function decodeToken(token: string): TokenPayload | null {
  try {
    return jwt.decode(token) as TokenPayload
  } catch {
    return null
  }
}

export function getRefreshTokenExpiry(): Date {
  const ms = parseTimeString(config.jwt.refreshExpiresIn)
  return new Date(Date.now() + ms)
}

function parseTimeString(timeStr: string): number {
  const match = timeStr.match(/^(\d+)([smhd])$/)
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000 // Default 7 days
  }

  const value = parseInt(match[1], 10)
  const unit = match[2]

  switch (unit) {
    case 's':
      return value * 1000
    case 'm':
      return value * 60 * 1000
    case 'h':
      return value * 60 * 60 * 1000
    case 'd':
      return value * 24 * 60 * 60 * 1000
    default:
      return 7 * 24 * 60 * 60 * 1000
  }
}
