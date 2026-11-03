// Story — tiga bentuk kartu berita untuk Beranda. Semuanya dirancang agar tetap enak dilihat TANPA gambar
// dan TANPA kategori/kicker (kenyataan data saat ini): hierarki dibangun dari ukuran judul, ringkasan, dan garis.
//
//  • Lead   — berita utama: gambar lebar (bila ada), judul besar, ringkasan, metadata.
//  • Side   — daftar di sisi berita utama: judul sedang, ringkasan 2 baris, gambar kecil di kanan (bila ada).
//  • Column — kolom ringkas di bagian bawah: garis atas, judul, ringkasan 3 baris, metadata.

import NextLink from 'next/link'
import { Badge } from '@/components/ui'
import { formatTanggalPendek } from '@/lib/format-date'

export type StoryData = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  category: string | null
  kicker: string | null
  readingMinutes: number
  publishedAt: string | null
}

// Garis bawah judul hanya muncul saat hover — satu-satunya umpan balik, tanpa gerak lain.
const headlineHover =
  'underline decoration-1 underline-offset-[6px] decoration-transparent transition-[text-decoration-color] duration-fast group-hover:decoration-text-primary'

function Meta({ story, className = '' }: { story: StoryData; className?: string }) {
  const tanggal = formatTanggalPendek(story.publishedAt)
  return (
    <p className={['font-mono text-caption text-text-tertiary', className].filter(Boolean).join(' ')}>
      {story.readingMinutes} menit baca{tanggal ? ` · ${tanggal}` : ''}
    </p>
  )
}

function Label({ story }: { story: StoryData }) {
  if (!story.category && !story.kicker) return null
  return (
    <div className="mb-3 flex flex-wrap items-center gap-x-4 gap-y-1">
      {story.category && <Badge variant="category">{story.category}</Badge>}
      {story.kicker && <span className="font-interface text-sm font-semibold text-text-primary">{story.kicker}</span>}
    </div>
  )
}

export function StoryLead({ story }: { story: StoryData }) {
  const hasCover = !!story.coverImageUrl
  return (
    <article className="group">
      <NextLink href={`/artikel/${story.slug}`} className="block">
        {hasCover && (
          <div className="aspect-[16/9] overflow-hidden bg-surface-sunken">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={story.coverImageUrl!}
              alt=""
              className="h-full w-full object-cover"
              fetchPriority="high"
              decoding="async"
            />
          </div>
        )}
        <div className={hasCover ? 'mt-6' : ''}>
          <Label story={story} />
          <h2
            className={[
              'font-display leading-[1.15] text-text-primary',
              hasCover ? 'text-display-sm sm:text-display-base' : 'text-display-base sm:text-display-lg',
              headlineHover,
            ].join(' ')}
          >
            {story.title}
          </h2>
          {story.excerpt && (
            <p className="mt-4 max-w-2xl font-display text-body-sm italic leading-relaxed text-text-secondary sm:text-body-base">
              {story.excerpt}
            </p>
          )}
          <Meta story={story} className="mt-5" />
        </div>
      </NextLink>
    </article>
  )
}

export function StorySide({ story }: { story: StoryData }) {
  return (
    <article className="group">
      <NextLink
        href={`/artikel/${story.slug}`}
        className={[
          'grid gap-x-5 py-6',
          story.coverImageUrl ? 'grid-cols-[1fr_6rem] sm:grid-cols-[1fr_7rem]' : '',
        ].join(' ')}
      >
        <div className="min-w-0">
          <Label story={story} />
          <h3 className={['font-display text-xl leading-snug text-text-primary', headlineHover].join(' ')}>
            {story.title}
          </h3>
          {story.excerpt && (
            <p className="mt-2 line-clamp-2 font-display text-sm leading-relaxed text-text-secondary">{story.excerpt}</p>
          )}
          <Meta story={story} className="mt-3" />
        </div>
        {story.coverImageUrl && (
          <div className="aspect-square self-start overflow-hidden bg-surface-sunken">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={story.coverImageUrl} alt="" className="h-full w-full object-cover" loading="lazy" decoding="async" />
          </div>
        )}
      </NextLink>
    </article>
  )
}

export function StoryColumn({ story }: { story: StoryData }) {
  return (
    <article className="group border-t border-border-default/20 pt-5">
      <NextLink href={`/artikel/${story.slug}`} className="block">
        <Label story={story} />
        <h3 className={['font-display text-xl leading-snug text-text-primary', headlineHover].join(' ')}>
          {story.title}
        </h3>
        {story.excerpt && (
          <p className="mt-3 line-clamp-3 font-display text-sm leading-relaxed text-text-secondary">{story.excerpt}</p>
        )}
        <Meta story={story} className="mt-4" />
      </NextLink>
    </article>
  )
}
