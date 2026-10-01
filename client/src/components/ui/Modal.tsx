import { ReactNode, useEffect, useId, useRef } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  /** Prevent closing via Escape/backdrop/close button (e.g. while a request is in flight). */
  preventClose?: boolean
}

// Shared across instances so stacked modals don't unlock scrolling early.
let openModalCount = 0
let savedBodyOverflow = ''

const FOCUSABLE =
  'a[href], button:not([disabled]), textarea:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])'

export default function Modal({ isOpen, onClose, title, children, size = 'md', preventClose }: ModalProps) {
  const panelRef = useRef<HTMLDivElement>(null)
  const titleId = useId()
  // Callers pass inline onClose; keep it in a ref so effects don't re-run
  // (and steal focus) on every parent render.
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose
  const preventCloseRef = useRef(preventClose)
  preventCloseRef.current = preventClose

  useEffect(() => {
    if (!isOpen) return

    const previouslyFocused = document.activeElement as HTMLElement | null

    if (openModalCount === 0) {
      savedBodyOverflow = document.body.style.overflow
      document.body.style.overflow = 'hidden'
    }
    openModalCount++

    // Focus the first form field if there is one, else the panel itself.
    const panel = panelRef.current
    const firstField = panel?.querySelector<HTMLElement>('input:not([disabled]):not([type="hidden"]), select:not([disabled]), textarea:not([disabled])')
    if (firstField && window.matchMedia('(pointer: fine)').matches) {
      firstField.focus()
    } else {
      panel?.focus()
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (!preventCloseRef.current) onCloseRef.current()
        return
      }
      if (e.key === 'Tab' && panel) {
        const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))
        if (focusables.length === 0) return
        const first = focusables[0]
        const last = focusables[focusables.length - 1]
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault()
          last.focus()
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault()
          first.focus()
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      openModalCount--
      if (openModalCount === 0) {
        document.body.style.overflow = savedBodyOverflow
      }
      previouslyFocused?.focus?.()
    }
  }, [isOpen])

  if (!isOpen) return null

  const sizes = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-lg',
    xl: 'sm:max-w-xl',
  }

  const requestClose = () => {
    if (!preventClose) onClose()
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4">
      <div
        className="fixed inset-0 bg-rock-900/50 animate-fade-in"
        onClick={requestClose}
        aria-hidden="true"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={title ? undefined : 'Dialog'}
        tabIndex={-1}
        className={`relative flex flex-col w-full ${sizes[size]} max-h-[92dvh] sm:max-h-[90vh] bg-white rounded-t-2xl sm:rounded-xl shadow-xl animate-sheet-up focus:outline-none`}
      >
        <div className="flex items-center justify-between gap-4 px-4 sm:px-6 py-3 sm:py-4 border-b border-rock-200 shrink-0">
          {title ? (
            <h2 id={titleId} className="text-lg font-semibold text-rock-900 truncate">{title}</h2>
          ) : (
            <span />
          )}
          <button
            type="button"
            onClick={requestClose}
            disabled={preventClose}
            aria-label="Close dialog"
            className="-mr-2 p-2 rounded-lg text-rock-500 hover:text-rock-700 hover:bg-rock-100 transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto overscroll-contain px-4 sm:px-6 py-4 sm:py-6 pb-[max(1rem,env(safe-area-inset-bottom))]">
          {children}
        </div>
      </div>
    </div>,
    document.body
  )
}
