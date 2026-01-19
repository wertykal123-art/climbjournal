import { z } from 'zod'

export const sendFriendRequestSchema = z.object({
  addresseeId: z.string().uuid('Invalid user ID'),
})

export const updateFriendRequestSchema = z.object({
  action: z.enum(['accept', 'reject'], {
    errorMap: () => ({ message: 'Action must be accept or reject' }),
  }),
})

export const searchUsersSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(100),
})

export type SendFriendRequestInput = z.infer<typeof sendFriendRequestSchema>
export type UpdateFriendRequestInput = z.infer<typeof updateFriendRequestSchema>
export type SearchUsersInput = z.infer<typeof searchUsersSchema>
