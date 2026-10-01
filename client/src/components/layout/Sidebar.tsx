import { useEffect } from 'react'
import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  MapPin,
  Route,
  BookOpen,
  BarChart3,
  Trophy,
  Users,
  User,
  X,
  Mountain,
  Timer,
} from 'lucide-react'
import { useSession } from '@/context/SessionContext'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/journal', label: 'Journal', icon: BookOpen },
  { to: '/session', label: 'Session', icon: Timer },
  { to: '/locations', label: 'Locations', icon: MapPin },
  { to: '/routes', label: 'Routes', icon: Route },
  { to: '/stats', label: 'Statistics', icon: BarChart3 },
  { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  { to: '/friends', label: 'Friends', icon: Users },
  { to: '/profile', label: 'Profile', icon: User },
]

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { session } = useSession()
  // Mobile drawer: Escape closes it and the page behind doesn't scroll.
  useEffect(() => {
    if (!isOpen) return
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    document.addEventListener('keydown', handleKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', handleKey)
    }
  }, [isOpen, onClose])

  // If the viewport grows to desktop while the drawer is open, reset it.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 1024px)')
    const handler = () => mq.matches && onClose()
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [onClose])

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-rock-900/50 z-40 lg:hidden animate-fade-in"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        aria-label="Main navigation"
        className={`fixed top-0 left-0 z-50 h-full w-72 max-w-[85vw] bg-white border-r border-rock-200 transform transition-transform duration-200 ease-in-out
          lg:sticky lg:top-16 lg:h-[calc(100vh-4rem)] lg:w-60 lg:max-w-none lg:translate-x-0 lg:z-auto lg:shrink-0 overflow-y-auto ${
          isOpen ? 'translate-x-0 shadow-xl' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-rock-200 lg:hidden">
          <span className="flex items-center gap-2 text-lg font-bold text-rock-900">
            <Mountain className="w-6 h-6 text-carabiner" aria-hidden="true" />
            Climb Journal
          </span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="p-2 -mr-2 rounded-lg text-rock-600 hover:bg-rock-100"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        <nav className="p-3 space-y-1" aria-label="Primary">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-carabiner-light text-carabiner-dark font-semibold'
                    : 'text-rock-700 hover:bg-rock-100 font-medium'
                }`
              }
            >
              <item.icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              <span>{item.label}</span>
              {item.to === '/session' && session && (
                <span className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-send">
                  <span className="w-2 h-2 rounded-full bg-send animate-pulse" aria-hidden="true" />
                  Live
                </span>
              )}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  )
}
