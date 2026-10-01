import { Mountain, Home } from 'lucide-react'
import { LinkButton } from '@/components/ui/Button'
import { useAuth } from '@/context/AuthContext'

export default function NotFoundPage() {
  const { isAuthenticated } = useAuth()

  return (
    <div className="min-h-screen bg-rock-50 flex flex-col items-center justify-center p-4 text-center">
      <Mountain className="w-16 h-16 text-rock-300 mb-4" aria-hidden="true" />
      <h1 className="text-4xl font-bold text-rock-900 mb-2">404</h1>
      <p className="text-xl text-rock-600 mb-4">Page not found</p>
      <p className="text-rock-500 mb-8 max-w-md">
        Looks like you've climbed off the route. The page you're looking for doesn't exist.
      </p>
      <LinkButton to={isAuthenticated ? '/dashboard' : '/login'}>
        <Home className="w-4 h-4" aria-hidden="true" />
        {isAuthenticated ? 'Back to Dashboard' : 'Go to Login'}
      </LinkButton>
    </div>
  )
}
