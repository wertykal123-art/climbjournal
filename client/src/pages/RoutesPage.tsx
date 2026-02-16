import { useState, useMemo } from 'react'
import { useRoutes } from '@/hooks/useRoutes'
import { useLocations } from '@/hooks/useLocations'
import RouteCard from '@/components/routes/RouteCard'
import RouteForm from '@/components/routes/RouteForm'
import ClimbForm from '@/components/climbs/ClimbForm'
import Modal from '@/components/ui/Modal'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { Route } from '@/types/models'
import { Plus, Route as RouteIcon, Search } from 'lucide-react'
import { climbsApi } from '@/api/climbs.api'
import { routesApi } from '@/api/routes.api'
import { CreateClimbRequest } from '@/types/api'

export default function RoutesPage() {
  const [filters, setFilters] = useState({ locationId: '', search: '' })
  const { routes, isLoading, createRoute, updateRoute, deleteRoute, refetch } = useRoutes(
    filters.locationId || filters.search ? { ...filters, includeReset: true } : { includeReset: true }
  )
  const { locations } = useLocations()

  const [showRouteModal, setShowRouteModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Route | null>(null)
  const [loggingClimb, setLoggingClimb] = useState<Route | null>(null)

  const locationOptions = useMemo(() => [
    { value: '', label: 'All Locations' },
    ...locations.map((l) => ({ value: l.id, label: l.name })),
  ], [locations])

  const handleCreateRoute = async (data: Parameters<typeof createRoute>[0]) => {
    try {
      await createRoute(data)
      showToast('success', 'Route created successfully!')
      setShowRouteModal(false)
    } catch {
      showToast('error', 'Failed to create route')
    }
  }

  const handleUpdateRoute = async (data: Parameters<typeof createRoute>[0]) => {
    if (!editingRoute) return
    try {
      await updateRoute(editingRoute.id, data)
      showToast('success', 'Route updated successfully!')
      setEditingRoute(null)
    } catch {
      showToast('error', 'Failed to update route')
    }
  }

  const handleDeleteRoute = async () => {
    if (!deleteConfirm) return
    try {
      await deleteRoute(deleteConfirm.id)
      showToast('success', 'Route deleted successfully!')
      setDeleteConfirm(null)
    } catch {
      showToast('error', 'Failed to delete route')
    }
  }

  const handleResetRoute = async (route: Route) => {
    try {
      await routesApi.update(route.id, { isActive: false })
      showToast('success', 'Route marked as reset')
      refetch()
    } catch {
      showToast('error', 'Failed to mark route as reset')
    }
  }

  const handleLogClimb = async (data: CreateClimbRequest) => {
    try {
      await climbsApi.create(data)
      showToast('success', 'Climb logged successfully!')
      setLoggingClimb(null)
      refetch()
    } catch {
      showToast('error', 'Failed to log climb')
    }
  }

  if (isLoading) {
    return <PageSpinner />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-rock-900">Routes</h1>
          <p className="text-rock-600">Browse and manage your climbing routes</p>
        </div>
        <Button onClick={() => setShowRouteModal(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Route
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rock-400" />
          <Input
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            placeholder="Search routes..."
            className="pl-10"
          />
        </div>
        <Select
          value={filters.locationId}
          onChange={(e) => setFilters({ ...filters, locationId: e.target.value })}
          options={locationOptions}
          className="sm:w-48"
        />
      </div>

      {routes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {routes.map((route) => (
            <RouteCard
              key={route.id}
              route={route}
              onEdit={setEditingRoute}
              onDelete={setDeleteConfirm}
              onLogClimb={setLoggingClimb}
              onReset={handleResetRoute}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <RouteIcon className="w-12 h-12 text-rock-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-rock-900 mb-2">No routes found</h3>
          <p className="text-rock-500 mb-4">
            {filters.search || filters.locationId
              ? 'Try adjusting your filters'
              : 'Add your first route to start logging climbs'}
          </p>
          {!filters.search && !filters.locationId && (
            <Button onClick={() => setShowRouteModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Route
            </Button>
          )}
        </div>
      )}

      <Modal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        title="Add Route"
        size="lg"
      >
        <RouteForm
          locations={locations}
          onSubmit={handleCreateRoute}
          onCancel={() => setShowRouteModal(false)}
        />
      </Modal>

      <Modal
        isOpen={!!editingRoute}
        onClose={() => setEditingRoute(null)}
        title="Edit Route"
        size="lg"
      >
        <RouteForm
          route={editingRoute}
          locations={locations}
          onSubmit={handleUpdateRoute}
          onCancel={() => setEditingRoute(null)}
        />
      </Modal>

      <Modal
        isOpen={!!loggingClimb}
        onClose={() => setLoggingClimb(null)}
        title="Log Climb"
        size="lg"
      >
        <ClimbForm
          routes={loggingClimb ? [loggingClimb] : []}
          defaultRouteId={loggingClimb?.id}
          onSubmit={handleLogClimb}
          onCancel={() => setLoggingClimb(null)}
        />
      </Modal>

      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Delete Route"
      >
        <p className="text-rock-600 mb-4">
          Are you sure you want to delete "{deleteConfirm?.name}"? This will also delete all climbs on this route.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDeleteRoute}>
            Delete
          </Button>
        </div>
      </Modal>
    </div>
  )
}
