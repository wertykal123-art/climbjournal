import { Router } from 'express'
import authRoutes from './auth.routes.js'
import usersRoutes from './users.routes.js'
import locationsRoutes from './locations.routes.js'
import routesRoutes from './routes.routes.js'
import climbsRoutes from './climbs.routes.js'
import statsRoutes from './stats.routes.js'
import leaderboardRoutes from './leaderboard.routes.js'
import exportRoutes from './export.routes.js'

const router = Router()

router.use('/auth', authRoutes)
router.use('/users', usersRoutes)
router.use('/locations', locationsRoutes)
router.use('/routes', routesRoutes)
router.use('/climbs', climbsRoutes)
router.use('/stats', statsRoutes)
router.use('/leaderboard', leaderboardRoutes)
router.use('/export', exportRoutes)
router.use('/import', exportRoutes)

export default router
