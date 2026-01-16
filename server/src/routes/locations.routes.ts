import { Router } from 'express'
import {
  getLocations,
  getLocation,
  createLocation,
  updateLocation,
  deleteLocation,
} from '../controllers/locations.controller.js'
import { getLocationRoutes } from '../controllers/routes.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { createLocationSchema, updateLocationSchema } from '../schemas/location.schema.js'

const router = Router()

router.use(authenticate)

router.get('/', getLocations)
router.get('/:id', getLocation)
router.get('/:locationId/routes', getLocationRoutes)
router.post('/', validate(createLocationSchema), createLocation)
router.put('/:id', validate(updateLocationSchema), updateLocation)
router.delete('/:id', deleteLocation)

export default router
