import { Router } from 'express'
import { getProfile, updateProfile, changePassword, deleteAccount } from '../controllers/users.controller.js'
import { validate } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import { updateProfileSchema, changePasswordSchema } from '../schemas/auth.schema.js'

const router = Router()

router.use(authenticate)

router.get('/profile', getProfile)
router.put('/profile', validate(updateProfileSchema), updateProfile)
router.put('/password', validate(changePasswordSchema), changePassword)
router.delete('/account', deleteAccount)

export default router
