import { useState, useEffect, useMemo } from 'react'
import { useClimbs } from '@/hooks/useClimbs'
import { useRoutes } from '@/hooks/useRoutes'
import ClimbCard from '@/components/climbs/ClimbCard'
import ClimbForm from '@/components/climbs/ClimbForm'
import ClimbFilters, { ClimbFilterValues } from '@/components/climbs/ClimbFilters'
import QuickAddFAB from '@/components/climbs/QuickAddFAB'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import Pagination from '@/components/ui/Pagination'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { getErrorMessage } from '@/api/client'
import { Climb } from '@/types/models'
import { BookOpen, Plus, SearchX } from 'lucide-react'

export default function JournalPage() {
  const [filters, setFilters] = useState({
    climbType: '',
    from: '',
    to: '',
    page: 1,
    limit: 20,
  })

  const { climbs, total, page, totalPages, isLoading, isInitialLoading, error, refetch, createClimb, updateClimb, deleteClimb } = useClimbs(filters)
  const { routes, isInitialLoading: routesLoading } = useRoutes()
  const activeRoutes = useMemo(() => routes.filter((r) => r.isActive !== false), [routes])

  const [showModal, setShowModal] = useState(false)
  const [editingClimb, setEditingClimb] = useState<Climb | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Climb | null>(null)

  // If a delete or filter change shrinks the result set, don't strand the
  // user on a page past the end. (Empty result sets report totalPages 0,
  // hence the max(1, ...) so page 1 never "clamps" to itself in a loop.)
  useEffect(() => {
    const lastPage = Math.max(1, totalPages)
    if (!isLoading && filters.page > lastPage) {
      setFilters((f) => ({ ...f, page: lastPage }))
    }
  }, [isLoading, totalPages, filters.page])

  const handleCreateClimb = async (data: Parameters<typeof createClimb>[0]) => {
    try {
      await createClimb(data)
      showToast('success', 'Climb logged!')
      setShowModal(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to log climb'))
    }
  }

  const handleUpdateClimb = async (data: Parameters<typeof createClimb>[0]) => {
    if (!editingClimb) return
    try {
      await updateClimb(editingClimb.id, data)
      showToast('success', 'Climb updated')
      setEditingClimb(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update climb'))
    }
  }

  const handleDeleteClimb = async () => {
    if (!deleteConfirm) return
    try {
      await deleteClimb(deleteConfirm.id)
      showToast('success', 'Climb deleted')
      setDeleteConfirm(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to delete climb'))
    }
  }

  const handleFilterChange = (values: ClimbFilterValues) => {
    setFilters((f) => ({ ...f, ...values, page: 1 }))
  }

  // Full-page spinner only on first load; afterwards keep the filters
  // mounted so typing/selecting doesn't lose focus.
  if (isInitialLoading) {
    return <PageSpinner />
  }

  const isFiltered = !!(filters.climbType || filters.from || filters.to)

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Journal"
        subtitle={total > 0 ? `${total} ${total === 1 ? 'climb' : 'climbs'}${isFiltered ? ' match your filters' : ' logged'}` : 'Every climb you log, in one place'}
        actions={
          <Button onClick={() => setShowModal(true)} variant="success">
            <Plus className="w-4 h-4" aria-hidden="true" />
            Log climb
          </Button>
        }
      />

      <ClimbFilters
        values={{ climbType: filters.climbType, from: filters.from, to: filters.to }}
        onChange={handleFilterChange}
      />

      {error ? (
        <Card><ErrorState onRetry={refetch} /></Card>
      ) : climbs.length > 0 ? (
        <div className={`space-y-3 transition-opacity ${isLoading ? 'opacity-60' : ''}`} aria-busy={isLoading}>
          {climbs.map((climb) => (
            <ClimbCard
              key={climb.id}
              climb={climb}
              onEdit={setEditingClimb}
              onDelete={setDeleteConfirm}
            />
          ))}
          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={(p) => setFilters((f) => ({ ...f, page: p }))}
          />
        </div>
      ) : isFiltered ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="No climbs match"
            message="Try a different type or date range."
            action={
              <Button variant="secondary" onClick={() => handleFilterChange({ climbType: '', from: '', to: '' })}>
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={BookOpen}
            title="Your journal is empty"
            message="Start logging your climbs to track your progress."
            action={
              <Button onClick={() => setShowModal(true)} variant="success">
                <Plus className="w-4 h-4" aria-hidden="true" />
                Log your first climb
              </Button>
            }
          />
        </Card>
      )}

      <QuickAddFAB onClick={() => setShowModal(true)} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Log Climb"
        size="lg"
      >
        <ClimbForm
          routes={activeRoutes}
          routesLoading={routesLoading}
          onSubmit={handleCreateClimb}
          onCancel={() => setShowModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingClimb}
        onClose={() => setEditingClimb(null)}
        title="Edit Climb"
        size="lg"
      >
        <ClimbForm
          climb={editingClimb}
          routes={routes}
          onSubmit={handleUpdateClimb}
          onCancel={() => setEditingClimb(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteClimb}
        title="Delete climb?"
        message={
          <>
            This removes your climb on <strong>{deleteConfirm?.route?.name ?? 'this route'}</strong> and its points. This can't be undone.
          </>
        }
      />
    </div>
  )
}
