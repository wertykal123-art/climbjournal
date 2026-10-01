import { ButtonHTMLAttributes, forwardRef } from 'react'
import { Link, LinkProps } from 'react-router-dom'
import { Loader2 } from 'lucide-react'

type Variant = 'primary' | 'secondary' | 'danger' | 'success' | 'ghost'
type Size = 'sm' | 'md' | 'lg' | 'icon'

const baseStyles =
  'inline-flex items-center justify-center gap-2 font-medium rounded-lg transition-colors select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none'

const variants: Record<Variant, string> = {
  primary: 'bg-carabiner text-white hover:bg-carabiner-dark active:bg-carabiner-dark focus-visible:ring-carabiner',
  secondary: 'bg-rock-100 text-rock-800 border border-rock-200 hover:bg-rock-200 active:bg-rock-300 focus-visible:ring-rock-400',
  danger: 'bg-fall text-white hover:bg-fall-dark active:bg-fall-dark focus-visible:ring-fall',
  success: 'bg-send text-white hover:bg-send-dark active:bg-send-dark focus-visible:ring-send',
  ghost: 'bg-transparent text-rock-700 hover:bg-rock-100 active:bg-rock-200 focus-visible:ring-rock-400',
}

const sizes: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm sm:text-base',
  lg: 'px-6 py-3 text-base sm:text-lg',
  icon: 'p-2',
}

export function buttonClasses(variant: Variant = 'primary', size: Size = 'md', className = '') {
  return `${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  isLoading?: boolean
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'primary', size = 'md', isLoading, children, disabled, type = 'button', ...props }, ref) => {
    return (
      <button
        ref={ref}
        type={type}
        className={buttonClasses(variant, size, className)}
        disabled={disabled || isLoading}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading && <Loader2 className="w-4 h-4 animate-spin" aria-hidden="true" />}
        {children}
      </button>
    )
  }
)

Button.displayName = 'Button'

interface LinkButtonProps extends LinkProps {
  variant?: Variant
  size?: Size
}

/** A router Link styled as a Button — avoids nesting <button> inside <a>. */
export function LinkButton({ variant = 'primary', size = 'md', className = '', ...props }: LinkButtonProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />
}

export default Button
