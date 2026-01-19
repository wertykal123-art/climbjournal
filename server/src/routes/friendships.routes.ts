import { Router } from 'express'
import {
  searchUsers,
  sendFriendRequest,
  getIncomingRequests,
  getOutgoingRequests,
  updateFriendRequest,
  getFriends,
  removeFriend,
} from '../controllers/friendships.controller.js'
import { validate, validateQuery } from '../middleware/validate.middleware.js'
import { authenticate } from '../middleware/auth.middleware.js'
import {
  sendFriendRequestSchema,
  updateFriendRequestSchema,
  searchUsersSchema,
} from '../schemas/friendship.schema.js'

const router = Router()

router.use(authenticate)

router.get('/search', validateQuery(searchUsersSchema), searchUsers)
router.post('/requests', validate(sendFriendRequestSchema), sendFriendRequest)
router.get('/requests/incoming', getIncomingRequests)
router.get('/requests/outgoing', getOutgoingRequests)
router.put('/requests/:id', validate(updateFriendRequestSchema), updateFriendRequest)
router.get('/', getFriends)
router.delete('/:id', removeFriend)

export default router
