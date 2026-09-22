import 'dotenv/config'

const nodeEnv = process.env.NODE_ENV || 'development'

function resolveJwtSecret(): string {
  const secret = process.env.JWT_SECRET
  if (secret && secret.length >= 32) {
    return secret
  }
  if (nodeEnv === 'production') {
    throw new Error(
      'JWT_SECRET must be set to a random string of at least 32 characters in production'
    )
  }
  if (secret) {
    console.warn('[config] JWT_SECRET is shorter than 32 characters — use a stronger secret')
    return secret
  }
  console.warn('[config] JWT_SECRET not set — using an insecure development-only fallback')
  return 'dev-secret-change-me'
}

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv,
  corsOrigin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  jwt: {
    secret: resolveJwtSecret(),
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || '7d',
  },
  bcrypt: {
    saltRounds: 12,
  },
}
