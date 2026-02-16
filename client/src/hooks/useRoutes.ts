import { useState, useCallback, useEffect } from 'react'
import { Route } from '@/types/models'
import { CreateRouteRequest, UpdateRouteRequest, RouteFilters, PaginatedResponse } from '@/types/api'
import { routesApi } from '@/api/routes.api'

export function useRoutes(filters?: RouteFilters) {
  const [data, setData] = useState<PaginatedResponse<Route> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoutes = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await routesApi.getAll(filters)
      setData(response)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [filters?.locationId, filters?.minGrade, filters?.maxGrade, filters?.search, filters?.includeReset, filters?.page, filters?.limit])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  const createRoute = async (routeData: CreateRouteRequest) => {
    const newRoute = await routesApi.create(routeData)
    await fetchRoutes()
    return newRoute
  }

  const updateRoute = async (id: string, routeData: UpdateRouteRequest) => {
    const updatedRoute = await routesApi.update(id, routeData)
    await fetchRoutes()
    return updatedRoute
  }

  const deleteRoute = async (id: string) => {
    await routesApi.delete(id)
    await fetchRoutes()
  }

  return {
    routes: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    refetch: fetchRoutes,
    createRoute,
    updateRoute,
    deleteRoute,
  }
}

export function useRoute(id: string | undefined) {
  const [route, setRoute] = useState<Route | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoute = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await routesApi.getById(id)
      setRoute(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchRoute()
  }, [fetchRoute])

  return {
    route,
    isLoading,
    error,
    refetch: fetchRoute,
  }
}

export function useLocationRoutes(locationId: string | undefined) {
  const [routes, setRoutes] = useState<Route[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchRoutes = useCallback(async () => {
    if (!locationId) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await routesApi.getByLocation(locationId)
      setRoutes(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [locationId])

  useEffect(() => {
    fetchRoutes()
  }, [fetchRoutes])

  return {
    routes,
    isLoading,
    error,
    refetch: fetchRoutes,
  }
}
