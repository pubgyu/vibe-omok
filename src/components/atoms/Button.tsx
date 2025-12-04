import type { ButtonHTMLAttributes } from 'react'

type ButtonProps = {
  variant?: 'primary' | 'ghost'
  className?: string
} & ButtonHTMLAttributes<HTMLButtonElement>

export const Button = ({
  variant = 'primary',
  className = '',
  children,
  ...props
}: ButtonProps) => (
  <button className={`${variant} ${className}`.trim()} {...props}>
    {children}
  </button>
)
