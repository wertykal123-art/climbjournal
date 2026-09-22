import { Router } from 'express'
import { exportData, importData } from '../controllers/export.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { validate } from '../middleware/validate.middleware.js'
import { exportLimiter } from '../middleware/rateLimit.middleware.js'
import { importDataSchema } from '../schemas/export.schema.js'

export const exportRouter = Router()
exportRouter.use(authenticate)
exportRouter.get('/json', exportLimiter, exportData)

export const importRouter = Router()
importRouter.use(authenticate)
importRouter.post('/json', validate(importDataSchema), importData)
