type BylineBlockProps = {
  publishedAt?: string | null
  readingMinutes?: number
  className?: string
}

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default function BylineBlock({
  publishedAt,
  readingMinutes,
  className = '',
}: BylineBlockProps) {
  if (!publishedAt && !readingMinutes) return null

  return (
    <div
      className={[
        'flex flex-wrap items-center gap-x-3 gap-y-1 font-interface text-sm font-medium text-text-secondary',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {publishedAt && (
        <time dateTime={publishedAt}>{formatTanggal(publishedAt)}</time>
      )}
      {publishedAt && readingMinutes != null && (
        <span aria-hidden="true" className="text-text-tertiary">
          ·
        </span>
      )}
      {readingMinutes != null && (
        <span>baca {readingMinutes} menit</span>
      )}
    </div>
  )
}
