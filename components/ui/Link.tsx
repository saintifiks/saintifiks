import NextLink from 'next/link'
import { type ComponentProps, type ReactNode } from 'react'

type LinkVariant = 'default' | 'nav' | 'muted'

export type LinkProps = ComponentProps<typeof NextLink> & {
  variant?: LinkVariant
  children: ReactNode
  external?: boolean
}

// Tautan: garis bawah tipis yang melemah saat diam dan menjadi penuh saat hover — tanpa gerak lain.
// 'nav' (menu) tanpa garis diam; garis muncul saat hover.
const line = 'underline decoration-1 underline-offset-4 transition-[text-decoration-color] duration-fast'
const variantClasses: Record<LinkVariant, string> = {
  default: `${line} text-text-primary decoration-text-primary/40 hover:decoration-text-primary`,
  nav: `${line} font-interface text-sm font-medium text-text-primary decoration-transparent hover:decoration-text-primary`,
  muted: `${line} text-text-secondary decoration-text-secondary/40 hover:decoration-text-primary hover:text-text-primary`,
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
