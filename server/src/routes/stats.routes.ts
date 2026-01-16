import { Router } from 'express'
import {
  getOverview,
  getTimeline,
  getDistribution,
  getTypes,
  getPyramid,
  getProgression,
} from '../controllers/stats.controller.js'
import { authenticate } from '../middleware/auth.middleware.js'

const router = Router()

router.use(authenticate)

router.get('/overview', getOverview)
router.get('/timeline', getTimeline)
router.get('/distribution', getDistribution)
router.get('/types', getTypes)
router.get('/pyramid', getPyramid)
router.get('/progression', getProgression)

export default router
