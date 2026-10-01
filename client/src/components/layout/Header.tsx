import { Link, useNavigate } from 'react-router-dom'
import { Menu, Mountain, LogOut, User, ChevronDown } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'
import Avatar from '@/components/ui/Avatar'
import DropdownMenu from '@/components/ui/DropdownMenu'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="bg-white/95 backdrop-blur border-b border-rock-200 sticky top-0 z-40">
      <div className="flex items-center justify-between h-14 sm:h-16 px-2 sm:px-4">
        <div className="flex items-center gap-1 sm:gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            aria-label="Open navigation menu"
            className="p-2.5 rounded-lg text-rock-600 hover:bg-rock-100 lg:hidden"
          >
            <Menu className="w-6 h-6" aria-hidden="true" />
          </button>
          <Link to="/dashboard" className="flex items-center gap-2 rounded-lg px-1 py-1">
            <Mountain className="w-7 h-7 sm:w-8 sm:h-8 text-carabiner" aria-hidden="true" />
            <span className="text-lg sm:text-xl font-bold text-rock-900">Climb Journal</span>
          </Link>
        </div>

        <DropdownMenu
          label={`Account menu for ${user?.displayName ?? 'user'}`}
          triggerClassName="flex items-center gap-2 p-1.5 rounded-lg hover:bg-rock-100 transition-colors"
          trigger={
            <>
              <Avatar src={user?.profilePicture} name={user?.displayName} size="sm" />
              <span className="text-sm font-medium text-rock-700 hidden sm:block max-w-[12rem] truncate">
                {user?.displayName}
              </span>
              <ChevronDown className="w-4 h-4 text-rock-400 hidden sm:block" aria-hidden="true" />
            </>
          }
          items={[
            { label: 'Profile & settings', icon: User, onSelect: () => navigate('/profile') },
            { label: 'Log out', icon: LogOut, danger: true, onSelect: () => void logout() },
          ]}
        />
      </div>
    </header>
  )
}
