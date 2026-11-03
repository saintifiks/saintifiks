import type { TrendDirection } from '@/lib/indices/trend'
import { trendWindowLabel } from '@/lib/indices/trend'

type TrendIconProps = {
  trend?: TrendDirection
  trendWindow?: string
}

// Arah perubahan sebagai bentuk, bukan warna: segitiga terisi naik/turun, garis datar untuk stabil,
// garis tipis untuk tidak diketahui. Mewarisi warna teks sekitarnya (hijau/merah tidak dipakai: naik tidak
// selalu baik, turun tidak selalu buruk — mis. inflasi).
export default function TrendIcon({ trend, trendWindow }: TrendIconProps) {
  if (!trend || trend === 'unknown') {
    return (
      <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center opacity-40" aria-hidden>
        <span className="block h-px w-2 bg-current" />
      </span>
    )
  }

  const period = trendWindowLabel(trendWindow as Parameters<typeof trendWindowLabel>[0])
  const label =
    trend === 'flat'
      ? `Stabil${period ? ` (${period})` : ''}`
      : trend === 'up'
        ? `Naik${period ? ` vs ${period} lalu` : ''}`
        : `Turun${period ? ` vs ${period} lalu` : ''}`

  if (trend === 'flat') {
    return (
      <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center" role="img" aria-label={label} title={label}>
        <span className="block h-px w-2.5 bg-current" />
      </span>
    )
  }

  return (
    <span className="inline-flex h-3 w-3 shrink-0 items-center justify-center" role="img" aria-label={label} title={label}>
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="currentColor"
        className={trend === 'up' ? '' : 'rotate-180'}
        aria-hidden
      >
        <path d="M4 1.5 1 5.5h6L4 1.5z" />
      </svg>
    </span>
  )
}
