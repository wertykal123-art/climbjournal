import { useState } from 'react'
import { useLocations } from '@/hooks/useLocations'
import LocationCard from '@/components/locations/LocationCard'
import LocationForm from '@/components/locations/LocationForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { Location } from '@/types/models'
import { Plus, MapPin } from 'lucide-react'

export default function LocationsPage() {
  const { locations, isLoading, createLocation, updateLocation, deleteLocation } = useLocations()
  const [showModal, setShowModal] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Location | null>(null)

  const handleCreate = async (data: Parameters<typeof createLocation>[0]) => {
    try {
      await createLocation(data)
      showToast('success', 'Location created successfully!')
      setShowModal(false)
    } catch {
      showToast('error', 'Failed to create location')
    }
  }

  const handleUpdate = async (data: Parameters<typeof createLocation>[0]) => {
    if (!editingLocation) return
    try {
      await updateLocation(editingLocation.id, data)
      showToast('success', 'Location updated successfully!')
      setEditingLocation(null)
    } catch {
      showToast('error', 'Failed to update location')
    }
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    try {
      await deleteLocation(deleteConfirm.id)
      showToast('success', 'Location deleted successfully!')
      setDeleteConfirm(null)
    } catch {
      showToast('error', 'Failed to delete location')
    }
  }

  if (isLoading) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rock-900">Locations</h1>
          <p className="text-rock-600">Manage your gyms and outdoor crags</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Location
        </Button>
      </div>

      {locations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
        <div className="text-center py-12">
          <MapPin className="w-12 h-12 text-rock-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-rock-900 mb-2">No locations yet</h3>
          <p className="text-rock-500 mb-4">Add your first gym or crag to start logging routes.</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Location
          </Button>
        </div>
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

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Location"
      >
        <p className="text-rock-600 mb-4">
          Are you sure you want to delete "{deleteConfirm?.name}"? This will also delete all routes and climbs at this location.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
