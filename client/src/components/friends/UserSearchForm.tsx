import { useState } from 'react'
import { Search, UserPlus } from 'lucide-react'
import { UserSummary } from '@/types/models'
import { Card, CardBody } from '@/components/ui/Card'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

interface UserSearchFormProps {
  results: UserSummary[]
  isLoading: boolean
  onSearch: (query: string) => void
  onSendRequest: (userId: string) => void
}

export default function UserSearchForm({
  results,
  isLoading,
  onSearch,
  onSendRequest,
}: UserSearchFormProps) {
  const [query, setQuery] = useState('')
  const [sentRequests, setSentRequests] = useState<Set<string>>(new Set())

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleSendRequest = async (userId: string) => {
    try {
      await onSendRequest(userId)
      setSentRequests((prev) => new Set([...prev, userId]))
    } catch {
      // Error handled by parent
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSearch} className="flex gap-2">
        <div className="flex-1">
          <Input
            placeholder="Search by username or display name..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <Button type="submit" isLoading={isLoading}>
          <Search className="w-4 h-4" />
        </Button>
      </form>

      {results.length > 0 && (
        <div className="space-y-2">
          {results.map((user) => (
            <Card key={user.id}>
              <CardBody className="py-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Avatar
                      src={user.profilePicture}
                      name={user.displayName}
                      size="md"
                    />
                    <div>
                      <h4 className="font-medium text-rock-900">{user.displayName}</h4>
                      <p className="text-sm text-rock-500">@{user.username}</p>
                    </div>
                  </div>
                  {sentRequests.has(user.id) ? (
                    <span className="text-sm text-rock-500">Request sent</span>
                  ) : (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleSendRequest(user.id)}
                    >
                      <UserPlus className="w-4 h-4 mr-1" />
                      Add
                    </Button>
                  )}
                </div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
