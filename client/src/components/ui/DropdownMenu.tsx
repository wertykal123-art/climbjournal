import { ReactNode, useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useLocation } from 'react-router-dom'
import { MoreVertical, LucideIcon } from 'lucide-react'

export interface DropdownMenuItem {
  label: string
  icon?: LucideIcon
  onSelect: () => void
  danger?: boolean
  disabled?: boolean
  hidden?: boolean
}

interface DropdownMenuProps {
  items: DropdownMenuItem[]
  /** Accessible name for the trigger, e.g. "Climb actions". */
  label: string
  /** Custom trigger content; defaults to a vertical-dots icon. */
  trigger?: ReactNode
  triggerClassName?: string
  align?: 'left' | 'right'
}

const MENU_WIDTH = 176

/**
 * Action menu rendered in a portal so cards with rounded/clipped containers
 * can't cut it off. Closes on outside press, Escape, selection, scroll/resize
 * and route change. Renders nothing when every item is hidden.
 */
export default function DropdownMenu({
  items,
  label,
  trigger,
  triggerClassName,
  align = 'right',
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)
  const location = useLocation()

  const visibleItems = items.filter((item) => !item.hidden)

  const close = useCallback((restoreFocus = false) => {
    setOpen(false)
    if (restoreFocus) triggerRef.current?.focus()
  }, [])

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return
    const rect = triggerRef.current.getBoundingClientRect()
    const menuHeight = menuRef.current?.offsetHeight ?? visibleItems.length * 40 + 8
    const spaceBelow = window.innerHeight - rect.bottom
    const top = spaceBelow < menuHeight + 8 && rect.top > menuHeight + 8
      ? rect.top - menuHeight - 4
      : rect.bottom + 4
    let left = align === 'right' ? rect.right - MENU_WIDTH : rect.left
    left = Math.max(8, Math.min(left, window.innerWidth - MENU_WIDTH - 8))
    setPosition({ top, left })
  }, [open, align, visibleItems.length])

  useEffect(() => {
    if (!open) return
    menuRef.current?.querySelector<HTMLElement>('[role="menuitem"]:not([disabled])')?.focus()

    const handlePointer = (e: Event) => {
      const target = e.target as Node
      if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return
      close()
    }
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        close(true)
        return
      }
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault()
        const options = Array.from(
          menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]:not([disabled])') ?? []
        )
        const idx = options.indexOf(document.activeElement as HTMLElement)
        const next = e.key === 'ArrowDown' ? (idx + 1) % options.length : (idx - 1 + options.length) % options.length
        options[next]?.focus()
      }
      if (e.key === 'Tab') close()
    }
    const handleViewportChange = () => close()

    document.addEventListener('mousedown', handlePointer)
    document.addEventListener('touchstart', handlePointer)
    document.addEventListener('keydown', handleKey, true)
    window.addEventListener('resize', handleViewportChange)
    window.addEventListener('scroll', handleViewportChange, true)
    return () => {
      document.removeEventListener('mousedown', handlePointer)
      document.removeEventListener('touchstart', handlePointer)
      document.removeEventListener('keydown', handleKey, true)
      window.removeEventListener('resize', handleViewportChange)
      window.removeEventListener('scroll', handleViewportChange, true)
    }
  }, [open, close])

  // Close when navigating away (e.g. browser back).
  useEffect(() => {
    setOpen(false)
  }, [location.pathname])

  if (visibleItems.length === 0) return null

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={(e) => {
          // Cards are often links/clickable; don't let the trigger activate them.
          e.preventDefault()
          e.stopPropagation()
          setOpen((v) => !v)
        }}
        className={
          triggerClassName ??
          'p-2 -m-1 rounded-lg text-rock-500 hover:text-rock-700 hover:bg-rock-100 transition-colors'
        }
      >
        {trigger ?? <MoreVertical className="w-5 h-5" aria-hidden="true" />}
      </button>
      {open &&
        createPortal(
          <div
            ref={menuRef}
            role="menu"
            aria-label={label}
            style={{
              position: 'fixed',
              top: position?.top ?? -9999,
              left: position?.left ?? -9999,
              width: MENU_WIDTH,
            }}
            className="z-[55] py-1 bg-white rounded-lg shadow-lg border border-rock-200 animate-fade-in"
          >
            {visibleItems.map((item) => {
              const Icon = item.icon
              return (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  onClick={(e) => {
                    e.preventDefault()
                    e.stopPropagation()
                    close()
                    item.onSelect()
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2.5 text-sm text-left transition-colors disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none ${
                    item.danger
                      ? 'text-fall hover:bg-fall-light focus:bg-fall-light'
                      : 'text-rock-700 hover:bg-rock-50 focus:bg-rock-50'
                  }`}
                >
                  {Icon && <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />}
                  {item.label}
                </button>
              )
            })}
          </div>,
          document.body
        )}
    </>
  )
}
