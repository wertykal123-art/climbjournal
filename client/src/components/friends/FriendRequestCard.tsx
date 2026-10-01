import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { Friendship } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import { formatRelativeTime } from '@/utils/formatters'

interface FriendRequestCardProps {
  request: Friendship
  type: 'incoming' | 'outgoing'
  onAccept?: (id: string) => Promise<void>
  onReject?: (id: string) => Promise<void>
  onCancel?: (id: string) => Promise<void>
}

export default function FriendRequestCard({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
}: FriendRequestCardProps) {
  const [pending, setPending] = useState<'accept' | 'reject' | 'cancel' | null>(null)
  const user = type === 'incoming' ? request.requester : request.addressee

  if (!user) return null

  const run = async (action: 'accept' | 'reject' | 'cancel', fn?: (id: string) => Promise<void>) => {
    if (!fn) return
    setPending(action)
    try {
      await fn(request.id)
    } finally {
      // The card usually unmounts on success; this only matters on failure.
      setPending(null)
    }
  }

  return (
    <Card>
      <CardBody className="!p-4">
        <div className="flex items-center gap-3">
          <Avatar src={user.profilePicture} name={user.displayName} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-rock-900 truncate">{user.displayName}</h3>
            <p className="text-sm text-rock-500 truncate">
              @{user.username}
              {request.createdAt && <span className="text-rock-400"> · {formatRelativeTime(request.createdAt)}</span>}
            </p>
          </div>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          {type === 'incoming' ? (
            <>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => run('reject', onReject)}
                isLoading={pending === 'reject'}
                disabled={pending !== null}
              >
                {pending !== 'reject' && <X className="w-4 h-4" aria-hidden="true" />}
                Decline
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => run('accept', onAccept)}
                isLoading={pending === 'accept'}
                disabled={pending !== null}
              >
                {pending !== 'accept' && <Check className="w-4 h-4" aria-hidden="true" />}
                Accept
              </Button>
            </>
          ) : (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => run('cancel', onCancel)}
              isLoading={pending === 'cancel'}
            >
              Cancel request
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
