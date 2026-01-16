import { Router } from 'express'
import { exportData, importData } from '../controllers/export.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { exportLimiter } from '../middleware/rateLimit.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/json', exportLimiter, exportData)
router.post('/json', importData)

export default router
