import { Request, Response, NextFunction } from 'express'
import { prisma } from '../models/prisma.js'
import {
  SendFriendRequestInput,
  UpdateFriendRequestInput,
  SearchUsersInput,
} from '../schemas/friendship.schema.js'
import {
  NotFoundError,
  ForbiddenError,
  BadRequestError,
  ConflictError,
} from '../middleware/error.middleware.js'

const userSelect = {
  id: true,
  username: true,
  displayName: true,
  profilePicture: true,
}

export async function searchUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const { query } = req.query as unknown as SearchUsersInput
    const userId = req.user!.userId

    const users = await prisma.user.findMany({
      where: {
        AND: [
          { id: { not: userId } },
          {
            OR: [
              { username: { contains: query, mode: 'insensitive' } },
              { displayName: { contains: query, mode: 'insensitive' } },
            ],
          },
        ],
      },
      select: userSelect,
      take: 20,
    })

    res.json(users)
  } catch (error) {
    next(error)
  }
}

export async function sendFriendRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { addresseeId } = req.body as SendFriendRequestInput
    const requesterId = req.user!.userId

    if (requesterId === addresseeId) {
      throw new BadRequestError('Cannot send friend request to yourself')
    }

    const addressee = await prisma.user.findUnique({
      where: { id: addresseeId },
    })

    if (!addressee) {
      throw new NotFoundError('User')
    }

    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { requesterId, addresseeId },
          { requesterId: addresseeId, addresseeId: requesterId },
        ],
      },
    })

    if (existingFriendship) {
      if (existingFriendship.status === 'ACCEPTED') {
        throw new ConflictError('Already friends')
      }
      throw new ConflictError('Friend request already exists')
    }

    const friendship = await prisma.friendship.create({
      data: {
        requesterId,
        addresseeId,
      },
      include: {
        addressee: { select: userSelect },
      },
    })

    res.status(201).json(friendship)
  } catch (error) {
    next(error)
  }
}

export async function getIncomingRequests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId

    const requests = await prisma.friendship.findMany({
      where: {
        addresseeId: userId,
        status: 'PENDING',
      },
      include: {
        requester: { select: userSelect },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(requests)
  } catch (error) {
    next(error)
  }
}

export async function getOutgoingRequests(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.userId

    const requests = await prisma.friendship.findMany({
      where: {
        requesterId: userId,
        status: 'PENDING',
      },
      include: {
        addressee: { select: userSelect },
      },
      orderBy: { createdAt: 'desc' },
    })

    res.json(requests)
  } catch (error) {
    next(error)
  }
}

export async function updateFriendRequest(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string
    const { action } = req.body as UpdateFriendRequestInput
    const userId = req.user!.userId

    const friendship = await prisma.friendship.findUnique({
      where: { id },
    })

    if (!friendship) {
      throw new NotFoundError('Friend request')
    }

    if (friendship.addresseeId !== userId) {
      throw new ForbiddenError('Not authorized to update this friend request')
    }

    if (friendship.status !== 'PENDING') {
      throw new BadRequestError('Friend request has already been processed')
    }

    if (action === 'reject') {
      await prisma.friendship.delete({
        where: { id },
      })
      res.status(204).send()
      return
    }

    const updatedFriendship = await prisma.friendship.update({
      where: { id },
      data: { status: 'ACCEPTED' },
      include: {
        requester: { select: userSelect },
      },
    })

    res.json(updatedFriendship)
  } catch (error) {
    next(error)
  }
}

export async function getFriends(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.userId

    const friendships = await prisma.friendship.findMany({
      where: {
        status: 'ACCEPTED',
        OR: [{ requesterId: userId }, { addresseeId: userId }],
      },
      include: {
        requester: { select: userSelect },
        addressee: { select: userSelect },
      },
      orderBy: { updatedAt: 'desc' },
    })

    const friends = friendships.map((f) => ({
      friendshipId: f.id,
      ...(f.requesterId === userId ? f.addressee : f.requester),
    }))

    res.json(friends)
  } catch (error) {
    next(error)
  }
}

export async function removeFriend(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const id = req.params.id as string
    const userId = req.user!.userId

    const friendship = await prisma.friendship.findUnique({
      where: { id },
    })

    if (!friendship) {
      throw new NotFoundError('Friendship')
    }

    if (friendship.requesterId !== userId && friendship.addresseeId !== userId) {
      throw new ForbiddenError('Not authorized to remove this friendship')
    }

    await prisma.friendship.delete({
      where: { id },
    })

    res.status(204).send()
  } catch (error) {
    next(error)
  }
}
