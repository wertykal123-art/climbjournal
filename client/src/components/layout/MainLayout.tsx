import { useCallback, useState } from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import { ToastContainer } from '@/components/ui/Toast'

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const closeSidebar = useCallback(() => setSidebarOpen(false), [])

  return (
    <div className="min-h-screen bg-rock-50">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:px-4 focus:py-2 focus:bg-white focus:rounded-lg focus:shadow"
      >
        Skip to content
      </a>
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
        {/* pb-28 keeps the last row clear of the floating "log climb" button */}
        <main id="main-content" tabIndex={-1} className="flex-1 min-w-0 px-4 pt-4 pb-28 sm:px-6 sm:pt-6 focus:outline-none">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <ToastContainer />
    </div>
  )
}
