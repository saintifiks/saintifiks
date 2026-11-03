import NextLink from 'next/link'
import DiamondMark from './DiamondMark'

// Wordmark — berlian logo + "Saintifiks" dalam Libre Baskerville. Dipakai di header dan menu.
export default function Wordmark({
  onClick,
  className = '',
  href = '/',
  label = 'Saintifiks — ke beranda',
}: {
  onClick?: () => void
  className?: string
  href?: string
  label?: string
}) {
  return (
    <NextLink
      href={href}
      onClick={onClick}
      aria-label={label}
      className={['inline-flex items-center gap-2.5 text-text-primary', className].filter(Boolean).join(' ')}
    >
      <DiamondMark size={22} />
      <span className="font-display text-2xl font-bold leading-none">Saintifiks</span>
    </NextLink>
  )
}
