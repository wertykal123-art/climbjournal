import { useState } from 'react'
import { Users, UserPlus, Inbox, Send } from 'lucide-react'
import { useFriends, useFriendRequests, useUserSearch } from '@/hooks/useFriendships'
import FriendCard from '@/components/friends/FriendCard'
import FriendRequestCard from '@/components/friends/FriendRequestCard'
import UserSearchForm from '@/components/friends/UserSearchForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'

type Tab = 'friends' | 'incoming' | 'outgoing'

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('friends')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState<string | null>(null)

  const { friends, isLoading: friendsLoading, removeFriend, refetch: refetchFriends } = useFriends()
  const {
    incoming,
    outgoing,
    isLoading: requestsLoading,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    refetch: refetchRequests,
  } = useFriendRequests()
  const { results, isLoading: searchLoading, search, sendRequest, clearResults } = useUserSearch()

  const handleAccept = async (id: string) => {
    try {
      await acceptRequest(id)
      refetchFriends()
      showToast('success', 'Friend request accepted!')
    } catch {
      showToast('error', 'Failed to accept request')
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectRequest(id)
      showToast('success', 'Friend request rejected')
    } catch {
      showToast('error', 'Failed to reject request')
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest(id)
      showToast('success', 'Friend request cancelled')
    } catch {
      showToast('error', 'Failed to cancel request')
    }
  }

  const handleRemove = async () => {
    if (!removeConfirm) return
    try {
      await removeFriend(removeConfirm)
      showToast('success', 'Friend removed')
      setRemoveConfirm(null)
    } catch {
      showToast('error', 'Failed to remove friend')
    }
  }

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest(userId)
      refetchRequests()
      showToast('success', 'Friend request sent!')
    } catch {
      showToast('error', 'Failed to send request')
    }
  }

  const handleCloseSearch = () => {
    setShowSearchModal(false)
    clearResults()
  }

  const isLoading = friendsLoading || requestsLoading

  if (isLoading) {
    return <PageSpinner />
  }

  const tabs = [
    { id: 'friends' as const, label: 'Friends', count: friends.length, icon: Users },
    { id: 'incoming' as const, label: 'Incoming', count: incoming.length, icon: Inbox },
    { id: 'outgoing' as const, label: 'Outgoing', count: outgoing.length, icon: Send },
  ]

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rock-900">Friends</h1>
          <p className="text-rock-600">Manage your climbing buddies</p>
        </div>
        <Button onClick={() => setShowSearchModal(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Add Friend
        </Button>
      </div>

      <div className="border-b border-rock-200">
        <nav className="-mb-px flex gap-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 py-3 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === tab.id
                  ? 'border-carabiner text-carabiner'
                  : 'border-transparent text-rock-500 hover:text-rock-700 hover:border-rock-300'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
              {tab.count > 0 && (
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  activeTab === tab.id
                    ? 'bg-carabiner text-white'
                    : 'bg-rock-100 text-rock-600'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === 'friends' && (
        <>
          {friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {friends.map((friend) => (
                <FriendCard
                  key={friend.friendshipId}
                  friend={friend}
                  onRemove={setRemoveConfirm}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-rock-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-rock-900 mb-2">No friends yet</h3>
              <p className="text-rock-500 mb-4">Add friends to see and log climbs on their routes.</p>
              <Button onClick={() => setShowSearchModal(true)}>
                <UserPlus className="w-4 h-4 mr-2" />
                Add Friend
              </Button>
            </div>
          )}
        </>
      )}

      {activeTab === 'incoming' && (
        <>
          {incoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {incoming.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  type="incoming"
                  onAccept={handleAccept}
                  onReject={handleReject}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Inbox className="w-12 h-12 text-rock-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-rock-900 mb-2">No incoming requests</h3>
              <p className="text-rock-500">Friend requests from others will appear here.</p>
            </div>
          )}
        </>
      )}

      {activeTab === 'outgoing' && (
        <>
          {outgoing.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {outgoing.map((request) => (
                <FriendRequestCard
                  key={request.id}
                  request={request}
                  type="outgoing"
                  onCancel={handleCancel}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Send className="w-12 h-12 text-rock-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-rock-900 mb-2">No outgoing requests</h3>
              <p className="text-rock-500">Pending friend requests you've sent will appear here.</p>
            </div>
          )}
        </>
      )}

      <Modal
        isOpen={showSearchModal}
        onClose={handleCloseSearch}
        title="Find Friends"
        size="lg"
      >
        <UserSearchForm
          results={results}
          isLoading={searchLoading}
          onSearch={search}
          onSendRequest={handleSendRequest}
        />
      </Modal>

      <Modal
        isOpen={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        title="Remove Friend"
      >
        <p className="text-rock-600 mb-4">
          Are you sure you want to remove this friend? You will no longer be able to see each other's routes.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setRemoveConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleRemove}>
            Remove
          </Button>
        </div>
      </Modal>
    </div>
  )
}
