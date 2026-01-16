import { Outlet, Link } from 'react-router-dom'
import { Mountain } from 'lucide-react'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rock-100 to-rock-200 flex flex-col items-center justify-center p-4">
      <Link to="/" className="flex items-center gap-2 mb-8">
        <Mountain className="w-12 h-12 text-carabiner" />
        <span className="text-3xl font-bold text-rock-900">Climb Journal</span>
      </Link>
      <div className="w-full max-w-md">
        <Outlet />
      </div>
      <p className="mt-8 text-sm text-rock-500">
        Track your climbs. Crush your goals.
      </p>
    </div>
  )
}
