import { Link } from 'react-router-dom'
import { Mountain, Home } from 'lucide-react'
import Button from '@/components/ui/Button'

export default function NotFoundPage() {
  return (
    <div className="min-h-screen bg-rock-50 flex flex-col items-center justify-center p-4">
      <Mountain className="w-16 h-16 text-rock-300 mb-4" />
      <h1 className="text-4xl font-bold text-rock-900 mb-2">404</h1>
      <p className="text-xl text-rock-600 mb-6">Page not found</p>
      <p className="text-rock-500 mb-8 text-center max-w-md">
        Looks like you've climbed off the route. The page you're looking for doesn't exist.
      </p>
      <Link to="/dashboard">
        <Button>
          <Home className="w-4 h-4 mr-2" />
          Back to Dashboard
        </Button>
      </Link>
    </div>
  )
}
