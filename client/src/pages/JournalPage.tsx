import { useState } from 'react'
import { useClimbs } from '@/hooks/useClimbs'
import { useRoutes } from '@/hooks/useRoutes'
import ClimbCard from '@/components/climbs/ClimbCard'
import ClimbForm from '@/components/climbs/ClimbForm'
import QuickAddFAB from '@/components/climbs/QuickAddFAB'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { Climb } from '@/types/models'
import { BookOpen, ChevronLeft, ChevronRight } from 'lucide-react'

const CLIMB_TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  { value: 'OS', label: 'On-Sight' },
  { value: 'FLASH', label: 'Flash' },
  { value: 'RP', label: 'Redpoint' },
  { value: 'PP', label: 'Pinkpoint' },
  { value: 'TOPROPE', label: 'Top Rope' },
  { value: 'AUTOBELAY', label: 'Auto Belay' },
  { value: 'TRY', label: 'Attempt' },
]

export default function JournalPage() {
  const [filters, setFilters] = useState({
    climbType: '',
    from: '',
    to: '',
    page: 1,
    limit: 20,
  })

  const { climbs, page, totalPages, isLoading, createClimb, updateClimb, deleteClimb, refetch } = useClimbs(filters)
  const { routes } = useRoutes()

  const [showModal, setShowModal] = useState(false)
  const [editingClimb, setEditingClimb] = useState<Climb | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Climb | null>(null)

  const handleCreateClimb = async (data: Parameters<typeof createClimb>[0]) => {
    try {
      await createClimb(data)
      showToast('success', 'Climb logged successfully!')
      setShowModal(false)
      refetch()
    } catch {
      showToast('error', 'Failed to log climb')
    }
  }

  const handleUpdateClimb = async (data: Parameters<typeof createClimb>[0]) => {
    if (!editingClimb) return
    try {
      await updateClimb(editingClimb.id, data)
      showToast('success', 'Climb updated successfully!')
      setEditingClimb(null)
    } catch {
      showToast('error', 'Failed to update climb')
    }
  }

  const handleDeleteClimb = async () => {
    if (!deleteConfirm) return
    try {
      await deleteClimb(deleteConfirm.id)
      showToast('success', 'Climb deleted successfully!')
      setDeleteConfirm(null)
    } catch {
      showToast('error', 'Failed to delete climb')
    }
  }

  if (isLoading && climbs.length === 0) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rock-900">Climbing Journal</h1>
          <p className="text-rock-600">Track your climbing progress</p>
        </div>
        <Button onClick={() => setShowModal(true)} variant="success">
          Log Climb
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <Select
          value={filters.climbType}
          onChange={(e) => setFilters({ ...filters, climbType: e.target.value, page: 1 })}
          options={CLIMB_TYPE_OPTIONS}
          className="sm:w-40"
        />
        <Input
          type="date"
          value={filters.from}
          onChange={(e) => setFilters({ ...filters, from: e.target.value, page: 1 })}
          placeholder="From"
          className="sm:w-40"
        />
        <Input
          type="date"
          value={filters.to}
          onChange={(e) => setFilters({ ...filters, to: e.target.value, page: 1 })}
          placeholder="To"
          className="sm:w-40"
        />
      </div>

      {climbs.length > 0 ? (
        <>
          <div className="space-y-4">
            {climbs.map((climb) => (
              <ClimbCard
                key={climb.id}
                climb={climb}
                onEdit={setEditingClimb}
                onDelete={setDeleteConfirm}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ ...filters, page: page - 1 })}
                disabled={page === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="text-sm text-rock-600">
                Page {page} of {totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setFilters({ ...filters, page: page + 1 })}
                disabled={page === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <BookOpen className="w-12 h-12 text-rock-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-rock-900 mb-2">No climbs found</h3>
          <p className="text-rock-500 mb-4">
            {filters.climbType || filters.from || filters.to
              ? 'Try adjusting your filters'
              : 'Start logging your climbs to track your progress'}
          </p>
          {!filters.climbType && !filters.from && !filters.to && (
            <Button onClick={() => setShowModal(true)} variant="success">
              Log Your First Climb
            </Button>
          )}
        </div>
      )}

      <QuickAddFAB onClick={() => setShowModal(true)} />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Log Climb"
        size="lg"
      >
        <ClimbForm
          routes={routes}
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

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Climb"
      >
        <p className="text-rock-600 mb-4">
          Are you sure you want to delete this climb?
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteClimb}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
