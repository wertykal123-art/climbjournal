import { useState } from 'react'
import { useLocations } from '@/hooks/useLocations'
import LocationCard from '@/components/locations/LocationCard'
import LocationForm from '@/components/locations/LocationForm'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button from '@/components/ui/Button'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { getErrorMessage } from '@/api/client'
import { Location } from '@/types/models'
import { Plus, MapPin } from 'lucide-react'

export default function LocationsPage() {
  const { locations, isInitialLoading, error, refetch, createLocation, updateLocation, deleteLocation } = useLocations()
  const [showModal, setShowModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Location | null>(null)

  const handleCreate = async (data: Parameters<typeof createLocation>[0]) => {
    try {
      await createLocation(data)
      showToast('success', 'Location created')
      setShowModal(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to create location'))
    }
  }

  const handleUpdate = async (data: Parameters<typeof createLocation>[0]) => {
    if (!editingLocation) return
    try {
      await updateLocation(editingLocation.id, data)
      showToast('success', 'Location updated')
      setEditingLocation(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update location'))
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteLocation(deleteConfirm.id)
      showToast('success', 'Location deleted')
      setDeleteConfirm(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to delete location'))
    }
  }

  if (isInitialLoading) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Locations"
        subtitle="Manage your gyms and outdoor crags"
        actions={
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" aria-hidden="true" />
            Add location
          </Button>
        }
      />

      {error && locations.length === 0 ? (
        <Card><ErrorState onRetry={refetch} /></Card>
      ) : locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
          {locations.map((location) => (
            <LocationCard
              key={location.id}
              location={location}
              onEdit={setEditingLocation}
              onDelete={setDeleteConfirm}
            />
          ))}
        </div>
      ) : (
        <Card>
          <EmptyState
            icon={MapPin}
            title="No locations yet"
            message="Add your first gym or crag to start logging routes."
            action={
              <Button onClick={() => setShowModal(true)}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add location
              </Button>
            }
          />
        </Card>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Add Location"
        size="lg"
      >
        <LocationForm onSubmit={handleCreate} onCancel={() => setShowModal(false)} />
      </Modal>

      <Modal
        isOpen={!!editingLocation}
        onClose={() => setEditingLocation(null)}
        title="Edit Location"
        size="lg"
      >
        <LocationForm
          location={editingLocation}
          onSubmit={handleUpdate}
          onCancel={() => setEditingLocation(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDelete}
        title="Delete location?"
        message={
          <>
            <strong>{deleteConfirm?.name}</strong>, all of its routes, and every climb logged there will be permanently deleted.
          </>
        }
      />
    </div>
  )
}
