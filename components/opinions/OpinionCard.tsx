// Kartu artikel opinions — horizontal card layout (Design System V3)

import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui'

type OpinionCardProps = {
  title: string
  slug: string
  username: string
  displayName: string
  avatarUrl?: string | null
  excerpt?: string | null
  coverImageUrl?: string | null
  publishedAt: string
  likeCount?: number
}

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function OpinionCard({
  title,
  slug,
  username,
  displayName,
  avatarUrl,
  excerpt,
  coverImageUrl,
  publishedAt,
}: OpinionCardProps) {
  const articleUrl = `/opinions/${username}/${slug}`

  return (
    <article className="border-b border-border-default/20 py-6 last:border-b-0">
      <div className="flex flex-row gap-4 items-start">
        {coverImageUrl && (
          <Link href={articleUrl} className="shrink-0">
            <div className="w-24 h-[4.5rem] md:w-40 md:h-[6.625rem] overflow-hidden rounded-md border border-border-default/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt={title}
                className="w-full h-full object-cover aspect-[3/2]"
              />
            </div>
          </Link>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Badge variant="kicker">Argumen</Badge>
            <Link
              href={`/penulis/${username}`}
              className="flex items-center gap-1.5 group min-h-[44px]"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={20}
                  height={20}
                  className="rounded-full border border-border-default/20 object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-ink flex items-center justify-center shrink-0">
                  <span className="font-display text-xs font-bold text-paper leading-none">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-interface text-xs text-text-secondary group-hover:text-text-primary transition-colors duration-fast">
                {displayName}
              </span>
            </Link>
          </div>

          <Link href={articleUrl}>
            <h2 className="font-display text-lg md:text-xl font-medium text-text-primary leading-snug hover:text-text-link transition-colors duration-fast mb-2 line-clamp-2">
              {title}
            </h2>
          </Link>

          {excerpt && (
            <p className="font-interface text-sm text-text-secondary leading-relaxed mb-2 line-clamp-2">
              {excerpt}
            </p>
          )}

          <time
            dateTime={publishedAt}
            className="font-interface text-xs text-text-tertiary"
          >
            {formatTanggal(publishedAt)}
          </time>
        </div>
      </div>
    </article>
  )
}
