import { Router } from 'express'
import {
  getRoutes,
  getRoute,
  createRoute,
  updateRoute,
  deleteRoute,
} from '../controllers/routes.controller.js'
import { getRouteClimbs } from '../controllers/climbs.controller.js'
import { validate, validateQuery } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { createRouteSchema, updateRouteSchema, routeFiltersSchema } from '../schemas/route.schema.js'

const router = Router()

router.use(authenticate)

router.get('/', validateQuery(routeFiltersSchema), getRoutes)
router.get('/:id', getRoute)
router.get('/:routeId/climbs', getRouteClimbs)
router.post('/', validate(createRouteSchema), createRoute)
router.put('/:id', validate(updateRouteSchema), updateRoute)
router.delete('/:id', deleteRoute)

export default router
