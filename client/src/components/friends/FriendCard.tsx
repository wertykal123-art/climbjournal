import { UserMinus, BookOpen } from 'lucide-react'
import { Friend } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import { LinkButton } from '@/components/ui/Button'
import DropdownMenu from '@/components/ui/DropdownMenu'

interface FriendCardProps {
  friend: Friend
  onRemove: (friend: Friend) => void
}

export default function FriendCard({ friend, onRemove }: FriendCardProps) {
  return (
    <Card>
      <CardBody className="!p-4">
        <div className="flex items-center gap-3">
          <Avatar src={friend.profilePicture} name={friend.displayName} size="lg" />
          <div className="min-w-0 flex-1">
            <h3 className="font-semibold text-rock-900 truncate">{friend.displayName}</h3>
            <p className="text-sm text-rock-500 truncate">@{friend.username}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <LinkButton
              to={`/friends/climbs/${friend.id}`}
              variant="secondary"
              size="sm"
              aria-label={`View ${friend.displayName}'s climbs`}
            >
              <BookOpen className="w-4 h-4" aria-hidden="true" />
              <span className="hidden min-[400px]:inline">Climbs</span>
            </LinkButton>
            <DropdownMenu
              label={`More actions for ${friend.displayName}`}
              items={[
                { label: 'Remove friend', icon: UserMinus, danger: true, onSelect: () => onRemove(friend) },
              ]}
            />
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
