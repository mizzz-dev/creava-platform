import type { ButtonHTMLAttributes, AnchorHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '@/lib/design-system/classNames'

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent'
type ButtonSize = 'sm' | 'md' | 'lg'

interface SharedProps {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  children: ReactNode
}

type NativeButtonProps = SharedProps & ButtonHTMLAttributes<HTMLButtonElement> & {
  to?: never
  href?: never
}

type LinkButtonProps = SharedProps & {
  to: string
  href?: never
} & Omit<AnchorHTMLAttributes<HTMLAnchorElement>, 'href'>

type ExternalLinkButtonProps = SharedProps & AnchorHTMLAttributes<HTMLAnchorElement> & {
  href: string
  to?: never
}

type Props = NativeButtonProps | LinkButtonProps | ExternalLinkButtonProps

const variantClassMap: Record<ButtonVariant, string> = {
  primary: 'border border-transparent bg-gray-900 text-white hover:bg-gray-700 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300',
  secondary: 'border border-gray-300 bg-white text-gray-700 hover:border-gray-500 hover:text-gray-900 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-200 dark:hover:border-gray-500 dark:hover:text-gray-100',
  ghost: 'border border-transparent bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100',
  accent: 'border border-violet-300 bg-violet-50 text-violet-700 hover:bg-violet-100 dark:border-violet-800 dark:bg-violet-950/40 dark:text-violet-300 dark:hover:bg-violet-900/60',
}

const sizeClassMap: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs',
  md: 'h-10 px-4 text-sm',
  lg: 'h-11 px-5 text-sm',
}

export default function Button({
  variant = 'secondary',
  size = 'md',
  className,
  fullWidth,
  children,
  ...props
}: Props) {
  const classes = cn(
    'focus-ring inline-flex items-center justify-center rounded-full font-medium transition duration-200 hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60',
    variantClassMap[variant],
    sizeClassMap[size],
    fullWidth && 'w-full',
    className,
  )

  if ('to' in props && props.to) {
    const { to, ...rest } = props
    return <Link to={to} className={classes} {...rest}>{children}</Link>
  }

  if ('href' in props && props.href) {
    const { href, ...rest } = props
    return <a href={href} className={classes} {...rest}>{children}</a>
  }

  const buttonProps = props as NativeButtonProps
  return <button type={buttonProps.type ?? 'button'} className={classes} {...buttonProps}>{children}</button>
}
