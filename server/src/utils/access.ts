import { prisma } from '../models/prisma.js'

export async function getFriendIds(userId: string): Promise<string[]> {
  const friendships = await prisma.friendship.findMany({
    where: {
      status: 'ACCEPTED',
      OR: [{ requesterId: userId }, { addresseeId: userId }],
    },
    select: {
      requesterId: true,
      addresseeId: true,
    },
  })

  const friendIds = friendships.map((f) =>
    f.requesterId === userId ? f.addresseeId : f.requesterId
  )

  return friendIds
}

// A route is visible to its creator, to everyone if public, to the creator's
// friends, and to whoever shares its location (the location owner and their
// friends) — the same people who can add and edit routes there.
export function canViewRoute(
  userId: string,
  friendIds: string[],
  route: { userId: string; isPublic: boolean; location: { userId: string } }
): boolean {
  return (
    route.userId === userId ||
    route.isPublic ||
    friendIds.includes(route.userId) ||
    route.location.userId === userId ||
    friendIds.includes(route.location.userId)
  )
}

export async function areFriends(userId1: string, userId2: string): Promise<boolean> {
  const friendship = await prisma.friendship.findFirst({
    where: {
      status: 'ACCEPTED',
      OR: [
        { requesterId: userId1, addresseeId: userId2 },
        { requesterId: userId2, addresseeId: userId1 },
      ],
    },
  })

  return !!friendship
}
