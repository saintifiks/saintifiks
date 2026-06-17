import NextLink from 'next/link'
import { type ComponentProps, type ReactNode } from 'react'

type LinkVariant = 'default' | 'nav' | 'muted'

export type LinkProps = ComponentProps<typeof NextLink> & {
  variant?: LinkVariant
  children: ReactNode
  external?: boolean
}

const variantClasses: Record<LinkVariant, string> = {
  default:
    'text-text-link hover:text-interactive-primary-hover underline-offset-2 hover:underline',
  nav: 'text-text-primary hover:text-text-link font-interface text-sm font-medium no-underline',
  muted: 'text-text-secondary hover:text-text-primary no-underline',
}

export default function Link({
  variant = 'default',
  className = '',
  children,
  external,
  href,
  ...props
}: LinkProps) {
  const classes = [
    'transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary',
    variantClasses[variant],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  if (external || (typeof href === 'string' && href.startsWith('http'))) {
    return (
      <a
        href={href as string}
        className={classes}
        target="_blank"
        rel="noopener noreferrer"
        {...(props as ComponentProps<'a'>)}
      >
        {children}
      </a>
    )
  }

  return (
    <NextLink href={href} className={classes} {...props}>
      {children}
    </NextLink>
  )
}
