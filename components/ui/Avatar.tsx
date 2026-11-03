import Image from 'next/image'

const sizes = { sm: 28, md: 40, lg: 56 } as const

export type AvatarProps = {
  name: string
  src?: string | null
  size?: keyof typeof sizes
  className?: string
}

// Avatar bulat: foto bila ada, kalau tidak huruf pertama nama di atas warna tinta.
export default function Avatar({ name, src, size = 'md', className = '' }: AvatarProps) {
  const px = sizes[size]
  const initial = name.trim().charAt(0).toUpperCase() || '?'

  if (src) {
    return (
      <Image
        src={src}
        alt={name}
        width={px}
        height={px}
        className={['shrink-0 rounded-full object-cover', className].filter(Boolean).join(' ')}
      />
    )
  }

  return (
    <span
      role="img"
      aria-label={name}
      style={{ width: px, height: px, fontSize: Math.round(px * 0.42) }}
      className={[
        'inline-flex shrink-0 items-center justify-center rounded-full bg-ink font-display text-paper',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {initial}
    </span>
  )
}
