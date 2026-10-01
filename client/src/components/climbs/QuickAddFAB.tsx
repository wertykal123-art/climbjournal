import { Plus } from 'lucide-react'
import { useSession } from '@/context/SessionContext'

interface QuickAddFABProps {
  onClick: () => void
}

export default function QuickAddFAB({ onClick }: QuickAddFABProps) {
  const { session } = useSession()
  // Sit above the session bar while a session is running.
  const bottom = session
    ? 'bottom-[calc(5rem+env(safe-area-inset-bottom))]'
    : 'bottom-[max(1.25rem,env(safe-area-inset-bottom))] sm:bottom-6'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`fixed right-4 sm:right-6 ${bottom} w-14 h-14 bg-send text-white rounded-full shadow-lg hover:bg-send-dark active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-send transition flex items-center justify-center z-30`}
      aria-label="Log a climb"
      title="Log a climb"
    >
      <Plus className="w-7 h-7" aria-hidden="true" />
    </button>
  )
}
