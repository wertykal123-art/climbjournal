import { Outlet } from 'react-router-dom'
import { Mountain } from 'lucide-react'
import { ToastContainer } from '@/components/ui/Toast'

export default function AuthLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-rock-100 to-rock-200 flex flex-col items-center justify-center px-4 py-8">
      <ToastContainer />
      <div className="flex items-center gap-2 mb-6 sm:mb-8">
        <Mountain className="w-10 h-10 sm:w-12 sm:h-12 text-carabiner" aria-hidden="true" />
        <span className="text-2xl sm:text-3xl font-bold text-rock-900">Climb Journal</span>
      </div>
      <main className="w-full max-w-md">
        <Outlet />
      </main>
      <p className="mt-6 sm:mt-8 text-sm text-rock-500">
        Track your climbs. Crush your goals.
      </p>
    </div>
  )
}
