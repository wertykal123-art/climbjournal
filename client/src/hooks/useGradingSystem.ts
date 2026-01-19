import { useAuth } from '@/context/AuthContext'
import { Location, GradingSystem, UserGradingPreference } from '@/types/models'

export function useGradingSystem() {
  const { user } = useAuth()

  const userPreference: UserGradingPreference = user?.preferredGradingSystem || 'LOCATION_DEFAULT'

  const getEffectiveSystem = (location?: Location | null): GradingSystem => {
    if (userPreference !== 'LOCATION_DEFAULT') {
      return userPreference
    }
    return location?.defaultGradingSystem || 'FRENCH'
  }

  const getGradeBadgeSystem = (location?: Location | null): 'french' | 'uiaa' => {
    return getEffectiveSystem(location).toLowerCase() as 'french' | 'uiaa'
  }

  return { userPreference, getEffectiveSystem, getGradeBadgeSystem }
}
