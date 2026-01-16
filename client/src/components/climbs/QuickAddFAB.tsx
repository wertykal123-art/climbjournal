import { Plus } from 'lucide-react'

interface QuickAddFABProps {
  onClick: () => void
}

export default function QuickAddFAB({ onClick }: QuickAddFABProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 right-6 w-14 h-14 bg-send text-white rounded-full shadow-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-send transition-colors flex items-center justify-center z-30"
      aria-label="Log new climb"
    >
      <Plus className="w-7 h-7" />
    </button>
  )
}
