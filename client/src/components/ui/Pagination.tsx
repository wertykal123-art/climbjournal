import { ChevronLeft, ChevronRight } from 'lucide-react'
import Button from './Button'

interface PaginationProps {
  page: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null

  const goTo = (p: number) => {
    onPageChange(p)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <nav className="flex items-center justify-center gap-3 pt-2" aria-label="Pagination">
      <Button
        variant="secondary"
        size="sm"
        onClick={() => goTo(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
      >
        <ChevronLeft className="w-4 h-4" aria-hidden="true" />
        <span className="hidden sm:inline">Previous</span>
      </Button>
      <span className="text-sm text-rock-600 tabular-nums" aria-current="page">
        Page {page} of {totalPages}
      </span>
      <Button
        variant="secondary"
        size="sm"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
      >
        <span className="hidden sm:inline">Next</span>
        <ChevronRight className="w-4 h-4" aria-hidden="true" />
      </Button>
    </nav>
  )
}
