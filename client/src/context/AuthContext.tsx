import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { User, AuthResponse } from '@/types/models'
import { LoginRequest, RegisterRequest } from '@/types/api'
import { authApi } from '@/api/auth.api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (data: LoginRequest) => Promise<void>
  register: (data: RegisterRequest) => Promise<void>
  logout: () => Promise<void>
  updateUser: (user: User) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('accessToken')
    if (!token) {
      setIsLoading(false)
      return
    }

    try {
      const userData = await authApi.getMe()
      setUser(userData)
    } catch {
      localStorage.removeItem('accessToken')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    checkAuth()
  }, [checkAuth])

  const handleAuthResponse = (response: AuthResponse) => {
    localStorage.setItem('accessToken', response.accessToken)
    setUser(response.user)
  }

  const login = async (data: LoginRequest) => {
    const response = await authApi.login(data)
    handleAuthResponse(response)
  }

  const register = async (data: RegisterRequest) => {
    const response = await authApi.register(data)
    handleAuthResponse(response)
  }

  const logout = async () => {
    try {
      await authApi.logout()
    } catch {
      // Ignore logout errors
    } finally {
      localStorage.removeItem('accessToken')
      setUser(null)
    }
  }

  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
