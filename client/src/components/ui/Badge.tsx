import { HTMLAttributes } from 'react'

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info'
}

export default function Badge({
  className = '',
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variants = {
    default: 'bg-rock-100 text-rock-700',
    success: 'bg-send-light text-send-dark',
    warning: 'bg-pump-light text-pump-dark',
    danger: 'bg-fall-light text-fall-dark',
    info: 'bg-carabiner-light text-carabiner-dark',
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </span>
  )
}
