import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

interface Toast {
  id: string
  type: ToastType
  message: string
}

let toastId = 0
const listeners: Set<(toast: Toast) => void> = new Set()

export function showToast(type: ToastType, message: string) {
  const toast: Toast = {
    id: String(++toastId),
    type,
    message,
  }
  listeners.forEach((listener) => listener(toast))
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
  warning: AlertTriangle,
}

const styles = {
  success: 'bg-white border-send/40 text-rock-800',
  error: 'bg-white border-fall/40 text-rock-800',
  info: 'bg-white border-carabiner/40 text-rock-800',
  warning: 'bg-white border-pump/40 text-rock-800',
}

const iconStyles = {
  success: 'text-send',
  error: 'text-fall',
  info: 'text-carabiner',
  warning: 'text-pump',
}

export function ToastContainer() {
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const listener = (toast: Toast) => {
      // Keep at most 3 on screen so a burst doesn't cover the page.
      setToasts((prev) => [...prev.slice(-2), toast])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toast.id))
      }, toast.type === 'error' ? 7000 : 4000)
    }

    listeners.add(listener)
    return () => {
      listeners.delete(listener)
    }
  }, [])

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }

  return createPortal(
    <div
      aria-live="polite"
      role="status"
      className="fixed top-3 inset-x-3 sm:inset-x-auto sm:right-4 sm:top-4 z-[60] flex flex-col items-stretch sm:items-end gap-2 pointer-events-none"
    >
      {toasts.map((toast) => {
        const Icon = icons[toast.type]
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 w-full sm:w-auto sm:max-w-sm px-4 py-3 rounded-lg border shadow-lg animate-slide-in ${styles[toast.type]}`}
          >
            <Icon className={`w-5 h-5 shrink-0 mt-0.5 ${iconStyles[toast.type]}`} aria-hidden="true" />
            <p className="flex-1 min-w-0 text-sm font-medium break-words">{toast.message}</p>
            <button
              type="button"
              onClick={() => removeToast(toast.id)}
              aria-label="Dismiss notification"
              className="-m-1 p-1 rounded text-rock-400 hover:text-rock-600 hover:bg-rock-100"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )
      })}
    </div>,
    document.body
  )
}
