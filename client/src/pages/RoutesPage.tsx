import { useState, useMemo, useEffect } from 'react'
import { useRoutes } from '@/hooks/useRoutes'
import { useLocations } from '@/hooks/useLocations'
import RouteCard from '@/components/routes/RouteCard'
import RouteForm from '@/components/routes/RouteForm'
import ClimbForm from '@/components/climbs/ClimbForm'
import Modal from '@/components/ui/Modal'
import ConfirmDialog from '@/components/ui/ConfirmDialog'
import Button, { LinkButton } from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Select from '@/components/ui/Select'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState, { ErrorState } from '@/components/ui/EmptyState'
import { Card } from '@/components/ui/Card'
import Spinner, { PageSpinner } from '@/components/ui/Spinner'
import { showToast } from '@/components/ui/Toast'
import { getErrorMessage } from '@/api/client'
import { Route } from '@/types/models'
import { Plus, Route as RouteIcon, Search, SearchX, MapPin, X } from 'lucide-react'
import { climbsApi } from '@/api/climbs.api'
import { routesApi } from '@/api/routes.api'
import { CreateClimbRequest } from '@/types/api'

export default function RoutesPage() {
  const [searchInput, setSearchInput] = useState('')
  const [filters, setFilters] = useState({ locationId: '', search: '' })
  const { routes, isLoading, isInitialLoading, error, createRoute, updateRoute, deleteRoute, refetch } = useRoutes(
    filters.locationId || filters.search ? { ...filters, includeReset: true } : { includeReset: true }
  )
  const { locations, isInitialLoading: locationsLoading } = useLocations()

  const [showRouteModal, setShowRouteModal] = useState(false)
  const [editingRoute, setEditingRoute] = useState<Route | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<Route | null>(null)
  const [loggingClimb, setLoggingClimb] = useState<Route | null>(null)

  // Debounce typing so each keystroke doesn't trigger a fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((f) => (f.search === searchInput ? f : { ...f, search: searchInput }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchInput])

  const locationOptions = useMemo(() => [
    { value: '', label: 'All locations' },
    ...locations.map((l) => ({ value: l.id, label: l.name })),
  ], [locations])

  // Active routes first, reset routes last (matches the location page).
  const sortedRoutes = useMemo(
    () => [...routes].sort((a, b) => Number(a.isActive === false) - Number(b.isActive === false)),
    [routes]
  )

  const loggingRoutes = useMemo(() => (loggingClimb ? [loggingClimb] : []), [loggingClimb])

  const handleCreateRoute = async (data: Parameters<typeof createRoute>[0]) => {
    try {
      await createRoute(data)
      showToast('success', 'Route created')
      setShowRouteModal(false)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to create route'))
    }
  }

  const handleUpdateRoute = async (data: Parameters<typeof createRoute>[0]) => {
    if (!editingRoute) return
    try {
      await updateRoute(editingRoute.id, data)
      showToast('success', 'Route updated')
      setEditingRoute(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to update route'))
    }
  }

  const handleDeleteRoute = async () => {
    if (!deleteConfirm) return
    try {
      await deleteRoute(deleteConfirm.id)
      showToast('success', 'Route deleted')
      setDeleteConfirm(null)
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to delete route'))
    }
  }

  const handleResetRoute = async (route: Route) => {
    try {
      await routesApi.update(route.id, { isActive: false })
      showToast('success', `"${route.name}" marked as reset`)
      refetch()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to mark route as reset'))
    }
  }

  const handleLogClimb = async (data: CreateClimbRequest) => {
    try {
      await climbsApi.create(data)
      showToast('success', 'Climb logged!')
      setLoggingClimb(null)
      refetch()
    } catch (err) {
      showToast('error', getErrorMessage(err, 'Failed to log climb'))
    }
  }

  // Only blank the page on first load — replacing the whole page during a
  // search refetch unmounts the input and drops keyboard focus.
  if (isInitialLoading) {
    return <PageSpinner />
  }

  const isFiltered = !!(filters.search || filters.locationId)
  const hasNoLocations = !locationsLoading && locations.length === 0

  const clearFilters = () => {
    setSearchInput('')
    setFilters({ locationId: '', search: '' })
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <PageHeader
        title="Routes"
        subtitle="Browse and manage your climbing routes"
        actions={
          !hasNoLocations && (
            <Button onClick={() => setShowRouteModal(true)}>
              <Plus className="w-4 h-4" aria-hidden="true" />
              Add route
            </Button>
          )
        }
      />

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-rock-400 pointer-events-none" aria-hidden="true" />
          <Input
            type="search"
            aria-label="Search routes"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search routes…"
            className="pl-10 pr-10"
          />
          {isLoading && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2">
              <Spinner size="sm" />
            </span>
          )}
        </div>
        <div className="sm:w-56">
          <Select
            aria-label="Filter by location"
            value={filters.locationId}
            onChange={(e) => setFilters({ ...filters, locationId: e.target.value })}
            options={locationOptions}
          />
        </div>
      </div>

      {error ? (
        <Card><ErrorState onRetry={refetch} /></Card>
      ) : sortedRoutes.length > 0 ? (
        <div className={`grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
          {sortedRoutes.map((route) => (
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
      ) : isFiltered ? (
        <Card>
          <EmptyState
            icon={SearchX}
            title="No routes match"
            message="Try a different search or location."
            action={
              <Button variant="secondary" onClick={clearFilters}>
                <X className="w-4 h-4" aria-hidden="true" />
                Clear filters
              </Button>
            }
          />
        </Card>
      ) : hasNoLocations ? (
        <Card>
          <EmptyState
            icon={MapPin}
            title="Add a location first"
            message="Routes belong to a gym or crag. Create a location, then add its routes."
            action={
              <LinkButton to="/locations">
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add a location
              </LinkButton>
            }
          />
        </Card>
      ) : (
        <Card>
          <EmptyState
            icon={RouteIcon}
            title="No routes yet"
            message="Add your first route to start logging climbs."
            action={
              <Button onClick={() => setShowRouteModal(true)}>
                <Plus className="w-4 h-4" aria-hidden="true" />
                Add route
              </Button>
            }
          />
        </Card>
      )}

      <Modal
        isOpen={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        title="Add Route"
        size="lg"
      >
        <RouteForm
          locations={locations}
          defaultLocationId={filters.locationId || undefined}
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
          routes={loggingRoutes}
          defaultRouteId={loggingClimb?.id}
          onSubmit={handleLogClimb}
          onCancel={() => setLoggingClimb(null)}
        />
      </Modal>

      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        onConfirm={handleDeleteRoute}
        title="Delete route?"
        message={
          <>
            <strong>{deleteConfirm?.name}</strong> and every climb logged on it will be permanently deleted.
          </>
        }
      />
    </div>
  )
}
