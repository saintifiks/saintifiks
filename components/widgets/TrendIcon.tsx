import type { TrendDirection } from '@/lib/indices/trend'
import { trendWindowLabel } from '@/lib/indices/trend'

type TrendIconProps = {
  trend?: TrendDirection
  trendWindow?: string
}

export default function TrendIcon({ trend, trendWindow }: TrendIconProps) {
  if (!trend || trend === 'unknown') {
    return (
      <span
        className="inline-flex h-3 w-3 shrink-0 items-center justify-center text-primary-light/25"
        aria-hidden
      >
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
      <span
        className="inline-flex h-3 w-3 shrink-0 items-center justify-center text-primary-light/40"
        aria-label={label}
        title={label}
      >
        <span className="block h-px w-2.5 bg-current" />
      </span>
    )
  }

  const up = trend === 'up'

  return (
    <span
      className={`inline-flex h-3 w-3 shrink-0 items-center justify-center ${
        up ? 'text-primary-light/85' : 'text-accent-red'
      }`}
      aria-label={label}
      title={label}
    >
      <svg
        width="8"
        height="8"
        viewBox="0 0 8 8"
        fill="currentColor"
        className={up ? '' : 'rotate-180'}
        aria-hidden
      >
        <path d="M4 1.5 1 5.5h6L4 1.5z" />
      </svg>
    </span>
  )
}
