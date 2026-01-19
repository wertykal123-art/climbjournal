import { UserMinus } from 'lucide-react'
import { Friend } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'

interface FriendCardProps {
  friend: Friend
  onRemove: (friendshipId: string) => void
}

export default function FriendCard({ friend, onRemove }: FriendCardProps) {
  return (
    <Card>
      <CardBody>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Avatar
              src={friend.profilePicture}
              name={friend.displayName}
              size="lg"
            />
            <div>
              <h3 className="font-semibold text-rock-900">{friend.displayName}</h3>
              <p className="text-sm text-rock-500">@{friend.username}</p>
            </div>
          </div>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRemove(friend.friendshipId)}
            title="Remove friend"
          >
            <UserMinus className="w-4 h-4" />
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
