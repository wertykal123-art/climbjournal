import { useState, useCallback, useEffect } from 'react'
import { Climb } from '@/types/models'
import { CreateClimbRequest, UpdateClimbRequest, ClimbFilters, PaginatedResponse } from '@/types/api'
import { climbsApi } from '@/api/climbs.api'

export function useClimbs(filters?: ClimbFilters) {
  const [data, setData] = useState<PaginatedResponse<Climb> | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchClimbs = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      const response = await climbsApi.getAll(filters)
      setData(response)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [filters?.routeId, filters?.locationId, filters?.climbType, filters?.from, filters?.to, filters?.page, filters?.limit])

  useEffect(() => {
    fetchClimbs()
  }, [fetchClimbs])

  const createClimb = async (climbData: CreateClimbRequest) => {
    const newClimb = await climbsApi.create(climbData)
    await fetchClimbs()
    return newClimb
  }

  const updateClimb = async (id: string, climbData: UpdateClimbRequest) => {
    const updatedClimb = await climbsApi.update(id, climbData)
    await fetchClimbs()
    return updatedClimb
  }

  const deleteClimb = async (id: string) => {
    await climbsApi.delete(id)
    await fetchClimbs()
  }

  return {
    climbs: data?.data ?? [],
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    totalPages: data?.totalPages ?? 1,
    isLoading,
    error,
    refetch: fetchClimbs,
    createClimb,
    updateClimb,
    deleteClimb,
  }
}

export function useClimb(id: string | undefined) {
  const [climb, setClimb] = useState<Climb | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  const fetchClimb = useCallback(async () => {
    if (!id) {
      setIsLoading(false)
      return
    }

    try {
      setIsLoading(true)
      setError(null)
      const data = await climbsApi.getById(id)
      setClimb(data)
    } catch (err) {
      setError(err as Error)
    } finally {
      setIsLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchClimb()
  }, [fetchClimb])

  return {
    climb,
    isLoading,
    error,
    refetch: fetchClimb,
  }
}
