import { useEffect, useState } from 'react'
import { Search, UserPlus, Check, Clock, Inbox, SearchX } from 'lucide-react'
import { UserSearchResult } from '@/types/models'
import Avatar from '@/components/ui/Avatar'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Spinner from '@/components/ui/Spinner'
import EmptyState from '@/components/ui/EmptyState'

interface UserSearchFormProps {
  results: UserSearchResult[]
  isLoading: boolean
  error?: Error | null
  lastQuery: string
  onSearch: (query: string) => void
  onSendRequest: (userId: string) => Promise<void>
  /** Called for users who already sent you a request. */
  onViewIncoming?: () => void
}

export default function UserSearchForm({
  results,
  isLoading,
  error,
  lastQuery,
  onSearch,
  onSendRequest,
  onViewIncoming,
}: UserSearchFormProps) {
  const [query, setQuery] = useState('')
  const [sendingId, setSendingId] = useState<string | null>(null)

  // Search as you type (debounced); Enter searches immediately.
  useEffect(() => {
    const timer = setTimeout(() => onSearch(query), 300)
    return () => clearTimeout(timer)
  }, [query, onSearch])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSearch(query)
  }

  const handleSendRequest = async (userId: string) => {
    setSendingId(userId)
    try {
      await onSendRequest(userId)
    } catch {
      // Error toast shown by parent
    } finally {
      setSendingId(null)
    }
  }

  const trimmed = query.trim()

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} role="search" className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rock-400 pointer-events-none" aria-hidden="true" />
        <Input
          type="search"
          aria-label="Search users"
          placeholder="Search by username or name…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 pr-10"
          autoComplete="off"
          maxLength={100}
        />
        {isLoading && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2">
            <Spinner size="sm" />
          </span>
        )}
      </form>

      {error ? (
        <p className="text-sm text-fall text-center py-4">Search failed. Check your connection and try again.</p>
      ) : !trimmed ? (
        <p className="text-sm text-rock-500 text-center py-6">Find climbing partners by their username or display name.</p>
      ) : results.length === 0 && !isLoading && lastQuery === trimmed ? (
        <EmptyState compact icon={SearchX} title="No users found" message={`Nobody matches "${trimmed}".`} />
      ) : (
        <ul className="divide-y divide-rock-200 border border-rock-200 rounded-lg" aria-live="polite">
          {results.map((user) => (
            <li key={user.id} className="flex items-center gap-3 p-3">
              <Avatar src={user.profilePicture} name={user.displayName} size="md" />
              <div className="min-w-0 flex-1">
                <p className="font-medium text-rock-900 truncate">{user.displayName}</p>
                <p className="text-sm text-rock-500 truncate">@{user.username}</p>
              </div>
              <div className="shrink-0">
                {user.relationship === 'FRIENDS' ? (
                  <span className="inline-flex items-center gap-1 text-sm text-send font-medium">
                    <Check className="w-4 h-4" aria-hidden="true" />
                    Friends
                  </span>
                ) : user.relationship === 'OUTGOING' ? (
                  <span className="inline-flex items-center gap-1 text-sm text-rock-500">
                    <Clock className="w-4 h-4" aria-hidden="true" />
                    Requested
                  </span>
                ) : user.relationship === 'INCOMING' ? (
                  <Button variant="secondary" size="sm" onClick={onViewIncoming}>
                    <Inbox className="w-4 h-4" aria-hidden="true" />
                    Respond
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSendRequest(user.id)}
                    isLoading={sendingId === user.id}
                    disabled={sendingId !== null && sendingId !== user.id}
                  >
                    {sendingId !== user.id && <UserPlus className="w-4 h-4" aria-hidden="true" />}
                    Add
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
