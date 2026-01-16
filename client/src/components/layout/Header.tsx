import { Link } from 'react-router-dom'
import { Menu, Mountain, LogOut, User, Settings } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Avatar from '@/components/ui/Avatar'
import { useState, useRef, useEffect } from 'react'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const [showDropdown, setShowDropdown] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    await logout()
    setShowDropdown(false)
  }

  return (
    <header className="bg-white border-b border-rock-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-16 px-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-lg text-rock-600 hover:bg-rock-100 lg:hidden"
          >
            <Menu className="w-6 h-6" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2">
            <Mountain className="w-8 h-8 text-carabiner" />
            <span className="text-xl font-bold text-rock-900 hidden sm:block">
              Climb Journal
            </span>
          </Link>
        </div>

        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 p-1 rounded-lg hover:bg-rock-100 transition-colors"
          >
            <Avatar
              src={user?.profilePicture}
              name={user?.displayName}
              size="sm"
            />
            <span className="text-sm font-medium text-rock-700 hidden sm:block">
              {user?.displayName}
            </span>
          </button>

          {showDropdown && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-rock-200 py-1">
              <Link
                to="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-rock-700 hover:bg-rock-50"
              >
                <User className="w-4 h-4" />
                Profile
              </Link>
              <Link
                to="/profile"
                onClick={() => setShowDropdown(false)}
                className="flex items-center gap-2 px-4 py-2 text-sm text-rock-700 hover:bg-rock-50"
              >
                <Settings className="w-4 h-4" />
                Settings
              </Link>
              <hr className="my-1 border-rock-200" />
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 text-sm text-fall hover:bg-rock-50 w-full"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
