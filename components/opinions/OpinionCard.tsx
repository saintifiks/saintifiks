// Kartu artikel opinions — digunakan di /opinions dan /penulis/[username]

import Link from 'next/link'
import Image from 'next/image'

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
  likeCount,
}: OpinionCardProps) {
  const articleUrl = `/opinions/${username}/${slug}`

  return (
    <article className="border-b border-warm-gray/20 py-8 last:border-b-0">
      <div className="flex gap-6 items-start">

        {/* Konten utama */}
        <div className="flex-1 min-w-0">

          {/* Badge OPINI + byline penulis */}
          <div className="flex items-center gap-2 mb-3">
            <span className="font-helvetica text-xs font-bold uppercase tracking-widest text-accent-blue border border-accent-blue/30 px-2 py-0.5 rounded">
              Opini
            </span>
            <Link
              href={`/penulis/${username}`}
              className="flex items-center gap-1.5 group"
            >
              {avatarUrl ? (
                <Image
                  src={avatarUrl}
                  alt={displayName}
                  width={20}
                  height={20}
                  className="rounded-full border border-primary-dark/10 object-cover"
                />
              ) : (
                <div className="w-5 h-5 rounded-full bg-primary-dark flex items-center justify-center flex-shrink-0">
                  <span className="font-libre text-xs font-bold text-primary-light leading-none">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="font-helvetica text-xs text-warm-gray group-hover:text-primary-dark transition-colors duration-150">
                {displayName}
              </span>
            </Link>
          </div>

          {/* Judul */}
          <Link href={articleUrl}>
            <h2 className="font-libre text-xl font-bold text-ink leading-snug hover:text-accent-blue transition-colors duration-[120ms] mb-2">
              {title}
            </h2>
          </Link>

          {/* Excerpt */}
          {excerpt && (
            <p className="font-helvetica text-sm text-warm-gray leading-relaxed mb-3 line-clamp-2">
              {excerpt}
            </p>
          )}

          {/* Metadata bawah */}
          <div className="flex items-center gap-4">
            <span className="font-helvetica text-xs text-warm-gray/70">
              {formatTanggal(publishedAt)}
            </span>
            {likeCount !== undefined && likeCount > 0 && (
              <span className="font-helvetica text-xs text-warm-gray/70">
                {likeCount} suka
              </span>
            )}
          </div>
        </div>

        {/* Cover image */}
        {coverImageUrl && (
          <Link href={articleUrl} className="flex-shrink-0">
            <div className="w-24 h-20 md:w-32 md:h-24 overflow-hidden border border-warm-gray/20 rounded">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={coverImageUrl}
                alt={title}
                className="w-full h-full object-cover"
              />
            </div>
          </Link>
        )}

      </div>
    </article>
  )
}
