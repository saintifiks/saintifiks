// ArgumenByline — penulis tulisan Argumen: foto/inisial, nama (tautan ke profil), dan tanggal terbit.

import NextLink from 'next/link'
import { Avatar } from '@/components/ui'
import { formatTanggalPendek } from '@/lib/format-date'

type ArgumenBylineProps = {
  username: string
  displayName: string
  avatarUrl?: string | null
  publishedAt?: string | null
  className?: string
}

export default function ArgumenByline({ username, displayName, avatarUrl, publishedAt, className = '' }: ArgumenBylineProps) {
  return (
    <div className={['flex items-center gap-3', className].filter(Boolean).join(' ')}>
      <NextLink href={`/penulis/${username}`} aria-label={`Profil ${displayName}`} className="shrink-0">
        <Avatar name={displayName} src={avatarUrl} size="md" />
      </NextLink>
      <div className="min-w-0">
        <NextLink
          href={`/penulis/${username}`}
          className="font-interface text-sm font-semibold text-text-primary underline decoration-transparent decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast hover:decoration-text-primary"
        >
          {displayName}
        </NextLink>
        {publishedAt && (
          <p className="mt-0.5 font-mono text-caption text-text-tertiary">
            <time dateTime={publishedAt}>{formatTanggalPendek(publishedAt)}</time>
          </p>
        )}
      </div>
    </div>
  )
}
