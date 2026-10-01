import { useState, useCallback, useEffect } from 'react'
import { Location } from '@/types/models'
import { CreateLocationRequest, UpdateLocationRequest } from '@/types/api'
import { locationsApi } from '@/api/locations.api'

export function useLocations() {
  const [locations, setLocations] = useState<Location[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [hasLoaded, setHasLoaded] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  const fetchLocations = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const data = await locationsApi.getAll()
      setLocations(data)
      setHasLoaded(true)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchLocations()
  }, [fetchLocations])

  const createLocation = async (data: CreateLocationRequest) => {
    const newLocation = await locationsApi.create(data)
    // Refetch so the new card gets server-computed fields (routeCount) and order.
    await fetchLocations()
    return newLocation
  }

  const updateLocation = async (id: string, data: UpdateLocationRequest) => {
    const updatedLocation = await locationsApi.update(id, data)
    // Merge so server-computed fields (routeCount, user) aren't lost.
    setLocations((prev) =>
      prev.map((loc) => (loc.id === id ? { ...loc, ...updatedLocation } : loc))
    )
    return updatedLocation
  }

  const deleteLocation = async (id: string) => {
    await locationsApi.delete(id)
    setLocations((prev) => prev.filter((loc) => loc.id !== id))
  }

  return {
    locations,
    isLoading,
    isInitialLoading: isLoading && !hasLoaded,
    error,
    refetch: fetchLocations,
    createLocation,
    updateLocation,
    deleteLocation,
  }
}

export function useLocation(id: string | undefined) {
  const [location, setLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchLocation = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await locationsApi.getById(id)
      setLocation(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchLocation()
  }, [fetchLocation])

  return {
    location,
    isLoading,
    error,
    refetch: fetchLocation,
  }
}
