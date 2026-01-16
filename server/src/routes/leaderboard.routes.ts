import { Router } from 'express'
import {
  getGlobalLeaderboard,
  getMonthlyLeaderboard,
  getWeeklyLeaderboard,
  getUserRank,
} from '../controllers/leaderboard.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/global', getGlobalLeaderboard)
router.get('/monthly', getMonthlyLeaderboard)
router.get('/weekly', getWeeklyLeaderboard)
router.get('/user/:userId', getUserRank)

export default router
