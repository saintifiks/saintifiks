// ArgumenRow — satu tulisan Argumen di daftar (Beranda Argumen dan profil penulis). Baris bergaris seperti
// kartu "Side" di Beranda: judul sebagai penanda utama, ringkasan miring, metadata mono, gambar kecil di kanan
// bila ada. Satu-satunya umpan balik hover adalah garis bawah pada judul.

import NextLink from 'next/link'
import { formatTanggalPendek } from '@/lib/format-date'

type ArgumenRowProps = {
  title: string
  slug: string
  username: string
  displayName: string
  excerpt?: string | null
  coverImageUrl?: string | null
  publishedAt: string | null
  // Sembunyikan nama penulis bila daftar sudah milik satu penulis (halaman profil)
  hideAuthor?: boolean
}

export default function ArgumenRow({
  title,
  slug,
  username,
  displayName,
  excerpt,
  coverImageUrl,
  publishedAt,
  hideAuthor = false,
}: ArgumenRowProps) {
  const tanggal = formatTanggalPendek(publishedAt)

  return (
    <article className="group border-b border-border-default/15 py-7 first:pt-0 last:border-b-0">
      <div className="flex items-start gap-5 sm:gap-8">
        <div className="min-w-0 flex-1">
          {!hideAuthor && (
            <NextLink
              href={`/penulis/${username}`}
              className="mb-2 inline-block font-interface text-sm font-semibold text-text-primary underline decoration-transparent decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast hover:decoration-text-primary"
            >
              {displayName}
            </NextLink>
          )}
          <NextLink href={`/argumen/${username}/${slug}`} className="block">
            <h2 className="font-display text-xl leading-snug text-text-primary underline decoration-transparent decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast group-hover:decoration-text-primary sm:text-2xl">
              {title}
            </h2>
            {excerpt && (
              <p className="mt-3 line-clamp-3 font-display text-body-sm italic leading-relaxed text-text-secondary">
                {excerpt}
              </p>
            )}
            {tanggal && (
              <time dateTime={publishedAt ?? undefined} className="mt-4 block font-mono text-caption text-text-tertiary">
                {tanggal}
              </time>
            )}
          </NextLink>
        </div>

        {coverImageUrl && (
          <NextLink href={`/argumen/${username}/${slug}`} tabIndex={-1} aria-hidden="true" className="shrink-0">
            <div className="h-20 w-24 overflow-hidden bg-surface-sunken sm:h-28 sm:w-40">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
            </div>
          </NextLink>
        )}
      </div>
    </article>
  )
}
