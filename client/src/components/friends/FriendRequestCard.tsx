import { Check, X } from 'lucide-react'
import { Friendship } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

interface FriendRequestCardProps {
  request: Friendship
  type: 'incoming' | 'outgoing'
  onAccept?: (id: string) => void
  onReject?: (id: string) => void
  onCancel?: (id: string) => void
}

export default function FriendRequestCard({
  request,
  type,
  onAccept,
  onReject,
  onCancel,
}: FriendRequestCardProps) {
  const user = type === 'incoming' ? request.requester : request.addressee

  if (!user) return null

  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={user.profilePicture}
              name={user.displayName}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-rock-900">{user.displayName}</h3>
              <p className="text-sm text-rock-500">@{user.username}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {type === 'incoming' ? (
              <>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => onAccept?.(request.id)}
                  title="Accept"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => onReject?.(request.id)}
                  title="Reject"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => onCancel?.(request.id)}
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
