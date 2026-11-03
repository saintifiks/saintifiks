import { formatTanggalPendek } from '@/lib/format-date'

type BylineBlockProps = {
  publishedAt?: string | null
  readingMinutes?: number
  className?: string
}

// Metadata artikel: tanggal terbit dan waktu baca, dalam huruf mono seperti di kartu Beranda.
export default function BylineBlock({ publishedAt, readingMinutes, className = '' }: BylineBlockProps) {
  if (!publishedAt && readingMinutes == null) return null

  return (
    <p className={['font-mono text-caption text-text-tertiary', className].filter(Boolean).join(' ')}>
      {publishedAt && <time dateTime={publishedAt}>{formatTanggalPendek(publishedAt)}</time>}
      {publishedAt && readingMinutes != null && <span aria-hidden="true"> · </span>}
      {readingMinutes != null && <span>{readingMinutes} menit baca</span>}
    </p>
  )
}
