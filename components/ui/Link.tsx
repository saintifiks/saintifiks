import NextLink from 'next/link'
import { type ComponentProps, type ReactNode } from 'react'

type LinkVariant = 'default' | 'nav' | 'muted'

export type LinkProps = ComponentProps<typeof NextLink> & {
  variant?: LinkVariant
  children: ReactNode
  external?: boolean
}

// Semua tautan memakai gerak "tinta naik" (lihat globals.css): garis tipis di dasar, saat hover tinta
// naik memenuhi kata dan huruf berbalik warna. 'nav' tanpa garis diam; 'muted' untuk tautan sekunder.
const variantClasses: Record<LinkVariant, string> = {
  default: 'rise text-text-primary',
  nav: 'rise text-text-primary font-interface text-sm font-medium [background-size:100%_0,100%_0]',
  muted: 'rise text-text-secondary',
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
