import { useState } from 'react'
import { Users, UserPlus, Inbox, Send, Activity } from 'lucide-react'
import { useFriends, useFriendRequests, useUserSearch } from '@/hooks/useFriendships'
import FriendCard from '@/components/friends/FriendCard'
import FriendRequestCard from '@/components/friends/FriendRequestCard'
import UserSearchForm from '@/components/friends/UserSearchForm'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button, { LinkButton } from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { getErrorMessage } from '@/api/client'
import { Friend } from '@/types/models'

type Tab = 'friends' | 'incoming' | 'outgoing'

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('friends')
  const [showSearchModal, setShowSearchModal] = useState(false)
  const [removeConfirm, setRemoveConfirm] = useState<Friend | null>(null)

  const {
    friends,
    isInitialLoading: friendsLoading,
    error: friendsError,
    removeFriend,
    refetch: refetchFriends,
  } = useFriends()
  const {
    incoming,
    outgoing,
    isInitialLoading: requestsLoading,
    error: requestsError,
    acceptRequest,
    rejectRequest,
    cancelRequest,
    refetch: refetchRequests,
  } = useFriendRequests()
  const { results, isLoading: searchLoading, error: searchError, lastQuery, search, sendRequest, clearResults } = useUserSearch()

  const handleAccept = async (id: string) => {
    try {
      await acceptRequest(id)
      refetchFriends()
      showToast('success', 'Friend request accepted!')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to accept request'))
    }
  }

  const handleReject = async (id: string) => {
    try {
      await rejectRequest(id)
      showToast('info', 'Friend request declined')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to decline request'))
    }
  }

  const handleCancel = async (id: string) => {
    try {
      await cancelRequest(id)
      showToast('info', 'Friend request cancelled')
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to cancel request'))
    }
  }

  const handleRemove = async () => {
    if (!removeConfirm) return
    try {
      await removeFriend(removeConfirm.friendshipId)
      showToast('success', `${removeConfirm.displayName} removed from friends`)
      setRemoveConfirm(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to remove friend'))
    }
  }

  const handleSendRequest = async (userId: string) => {
    try {
      await sendRequest(userId)
      refetchRequests()
      showToast('success', 'Friend request sent!')
    } catch (error) {
      showToast('error', getErrorMessage(error, 'Failed to send request'))
      throw error
    }
  }

  const handleCloseSearch = () => {
    setShowSearchModal(false)
    clearResults()
  }

  if (friendsLoading || requestsLoading) {
    return <PageSpinner />
  }

  const tabs = [
    { id: 'friends' as const, label: 'Friends', count: friends.length, icon: Users },
    { id: 'incoming' as const, label: 'Requests', count: incoming.length, icon: Inbox },
    { id: 'outgoing' as const, label: 'Sent', count: outgoing.length, icon: Send },
  ]

  const addFriendButton = (
    <Button onClick={() => setShowSearchModal(true)}>
      <UserPlus className="w-4 h-4" aria-hidden="true" />
      Add friend
    </Button>
  )

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Friends"
        subtitle="Manage your climbing buddies"
        actions={
          <>
            <LinkButton to="/friends/activity" variant="secondary">
              <Activity className="w-4 h-4" aria-hidden="true" />
              Activity
            </LinkButton>
            {addFriendButton}
          </>
        }
      />

      <div className="border-b border-rock-200 overflow-x-auto">
        <div role="tablist" aria-label="Friends sections" className="-mb-px flex gap-1 sm:gap-4 min-w-max">
          {tabs.map((tab) => {
            const selected = activeTab === tab.id
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                id={`tab-${tab.id}`}
                aria-selected={selected}
                aria-controls={`panel-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors ${
                  selected
                    ? 'border-carabiner text-carabiner'
                    : 'border-transparent text-rock-500 hover:text-rock-700 hover:border-rock-300'
                }`}
              >
                <tab.icon className="w-4 h-4" aria-hidden="true" />
                {tab.label}
                {tab.count > 0 && (
                  <span className={`px-2 py-0.5 rounded-full text-xs ${
                    selected ? 'bg-carabiner text-white' : tab.id === 'incoming' ? 'bg-fall text-white' : 'bg-rock-100 text-rock-600'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div role="tabpanel" id={`panel-${activeTab}`} aria-labelledby={`tab-${activeTab}`}>
        {activeTab === 'friends' && (
          friendsError && friends.length === 0 ? (
            <Card><ErrorState onRetry={refetchFriends} /></Card>
          ) : friends.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {friends.map((friend) => (
                <FriendCard key={friend.friendshipId} friend={friend} onRemove={setRemoveConfirm} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState
                icon={Users}
                title="No friends yet"
                message="Add friends to see their climbs and log climbs on their routes."
                action={addFriendButton}
              />
            </Card>
          )
        )}

        {activeTab === 'incoming' && (
          requestsError && incoming.length === 0 ? (
            <Card><ErrorState onRetry={refetchRequests} /></Card>
          ) : incoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
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
            <Card>
              <EmptyState icon={Inbox} title="No pending requests" message="Friend requests from others will appear here." />
            </Card>
          )
        )}

        {activeTab === 'outgoing' && (
          requestsError && outgoing.length === 0 ? (
            <Card><ErrorState onRetry={refetchRequests} /></Card>
          ) : outgoing.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {outgoing.map((request) => (
                <FriendRequestCard key={request.id} request={request} type="outgoing" onCancel={handleCancel} />
              ))}
            </div>
          ) : (
            <Card>
              <EmptyState icon={Send} title="No sent requests" message="Requests you send will wait here until they're accepted." />
            </Card>
          )
        )}
      </div>

      <Modal isOpen={showSearchModal} onClose={handleCloseSearch} title="Find Friends" size="lg">
        <UserSearchForm
          results={results}
          isLoading={searchLoading}
          error={searchError}
          lastQuery={lastQuery}
          onSearch={search}
          onSendRequest={handleSendRequest}
          onViewIncoming={() => {
            handleCloseSearch()
            setActiveTab('incoming')
          }}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!removeConfirm}
        onClose={() => setRemoveConfirm(null)}
        onConfirm={handleRemove}
        title="Remove friend?"
        message={
          <>
            You and <strong>{removeConfirm?.displayName}</strong> will no longer see each other's private routes and climbs.
          </>
        }
        confirmLabel="Remove"
      />
    </div>
  )
}
