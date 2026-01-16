import { Router } from 'express'
import { register, login, refresh, logout, getMe } from '../controllers/auth.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { authLimiter } from '../middleware/rateLimit.middleware.js'
import { registerSchema, loginSchema } from '../schemas/auth.schema.js'

const router = Router()

router.post('/register', authLimiter, validate(registerSchema), register)
router.post('/login', authLimiter, validate(loginSchema), login)
router.post('/refresh', refresh)
router.post('/logout', logout)
router.get('/me', authenticate, getMe)

export default router
