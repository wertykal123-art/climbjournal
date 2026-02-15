import { Router } from 'express'
import {
  getClimbs,
  getClimb,
  getFriendClimbs,
  createClimb,
  updateClimb,
  deleteClimb,
} from '../controllers/climbs.controller.js'
import { validate, validateQuery } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { createClimbSchema, updateClimbSchema, climbFiltersSchema } from '../schemas/climb.schema.js'

const router = Router()

router.use(authenticate)

router.get('/', validateQuery(climbFiltersSchema), getClimbs)
router.get('/friends', validateQuery(climbFiltersSchema), getFriendClimbs)
router.get('/friends/:userId', validateQuery(climbFiltersSchema), getFriendClimbs)
router.get('/:id', getClimb)
router.post('/', validate(createClimbSchema), createClimb)
router.put('/:id', validate(updateClimbSchema), updateClimb)
router.delete('/:id', deleteClimb)

export default router
