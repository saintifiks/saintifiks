// Byline nama penulis + avatar + link ke profil publik
// Digunakan di halaman artikel opinions individual

import Link from 'next/link'
import Image from 'next/image'

type AuthorBylineProps = {
  username: string
  displayName: string
  avatarUrl?: string | null
  publishedAt?: string | null
}

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function AuthorByline({ username, displayName, avatarUrl, publishedAt }: AuthorBylineProps) {
  return (
    <div className="flex items-center gap-3 my-6">
      {/* Avatar */}
      <Link href={`/penulis/${username}`} className="flex-shrink-0">
        {avatarUrl ? (
          <Image
            src={avatarUrl}
            alt={displayName}
            width={40}
            height={40}
            className="rounded-full border border-ink/10 object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-ink flex items-center justify-center flex-shrink-0">
            <span className="font-display text-base font-bold text-paper">
              {displayName.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
      </Link>

      {/* Info penulis */}
      <div>
        <Link
          href={`/penulis/${username}`}
          className="font-interface text-sm font-bold text-ink hover:text-text-link transition-colors duration-150"
        >
          {displayName}
        </Link>
        <p className="font-interface text-xs text-warm-gray mt-0.5">
          di Opinions Saintifiks
          {publishedAt && (
            <span> · {formatTanggal(publishedAt)}</span>
          )}
        </p>
      </div>
    </div>
  )
}
