import type { ReactNode } from 'react'
import { Link, type LinkProps } from 'react-router-dom'
import { isAbsoluteUrl } from '@/lib/siteLinks'

type Props = LinkProps & {
  className?: string
  children: ReactNode
}

export default function SmartLink({ to, children, ...props }: Props) {
  const href = typeof to === 'string' ? to : null

  if (href && isAbsoluteUrl(href)) {
    const { replace: _replace, state: _state, preventScrollReset: _preventScrollReset, relative: _relative, reloadDocument: _reloadDocument, viewTransition: _viewTransition, ...anchorProps } = props
    return (
      <a href={href} {...anchorProps}>
        {children}
      </a>
    )
  }

  return (
    <Link to={to} {...props}>
      {children}
    </Link>
  )
}
