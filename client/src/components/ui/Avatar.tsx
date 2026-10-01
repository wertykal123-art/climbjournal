import { useEffect, useState } from 'react'

interface AvatarProps {
  src?: string | null
  alt?: string
  name?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
}

export function getInitials(name?: string) {
  const parts = name?.trim().split(/\s+/).filter(Boolean) ?? []
  if (parts.length === 0) return '?'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
}

export default function Avatar({ src, alt, name, size = 'md', className = '' }: AvatarProps) {
  const [failed, setFailed] = useState(false)

  useEffect(() => {
    setFailed(false)
  }, [src])

  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  }

  if (src && !failed) {
    return (
      <img
        src={src}
        alt={alt || name || 'Avatar'}
        onError={() => setFailed(true)}
        className={`${sizes[size]} shrink-0 rounded-full object-cover ${className}`}
      />
    )
  }

  return (
    <div
      aria-hidden="true"
      className={`${sizes[size]} shrink-0 rounded-full bg-carabiner text-white flex items-center justify-center font-medium ${className}`}
    >
      {getInitials(name)}
    </div>
  )
}
