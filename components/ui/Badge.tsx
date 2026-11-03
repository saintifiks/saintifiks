import { type ReactNode } from 'react'

// Penanda — kategori dan status dibedakan oleh BENTUK, bukan warna.
// Berlian logo menjadi bahasa status: terisi (aktif/terbit), kosong (draf), separuh (ditinjau),
// kosong + teks dicoret (disembunyikan). Tanpa latar, tanpa kapsul, tanpa warna sinyal.

type BadgeVariant = 'default' | 'kicker' | 'category' | 'danger' | 'success' | 'warning'

export type BadgeProps = {
  children: ReactNode
  variant?: BadgeVariant
  className?: string
}

const config: Record<BadgeVariant, { fill: 'full' | 'half' | 'none' | null; text: string }> = {
  kicker: { fill: null, text: 'text-text-primary' },
  category: { fill: 'full', text: 'text-text-primary' },
  success: { fill: 'full', text: 'text-text-primary' },
  warning: { fill: 'half', text: 'text-text-primary' },
  default: { fill: 'none', text: 'text-text-secondary' },
  danger: { fill: 'none', text: 'text-text-secondary line-through decoration-1' },
}

export default function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const { fill, text } = config[variant]
  return (
    <span
      className={[
        'inline-flex items-center gap-2 font-interface text-kicker-lg font-semibold uppercase leading-none tracking-widest',
        text,
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {fill && <span className="marker-diamond" data-fill={fill} aria-hidden="true" />}
      {children}
    </span>
  )
}
