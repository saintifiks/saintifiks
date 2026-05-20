export type TrendDirection = 'up' | 'down' | 'flat' | 'unknown'

export type TrendWindow = '5m' | '1j' | '1d' | '1bln' | '1th'

const WINDOW_PRIORITY: { label: TrendWindow; seconds: number }[] = [
  { label: '5m', seconds: 5 * 60 },
  { label: '1j', seconds: 60 * 60 },
  { label: '1d', seconds: 24 * 60 * 60 },
]

export function computeTrend(
  current: number,
  previous: number | null,
  epsilon = 0.0001
): TrendDirection {
  if (previous == null || !Number.isFinite(previous)) return 'unknown'
  const delta = current - previous
  if (Math.abs(delta) <= epsilon) return 'flat'
  return delta > 0 ? 'up' : 'down'
}

/** Cari harga baseline terdekat dari deret intraday Yahoo (5m). */
export function baselineFromYahooSeries(
  timestamps: number[],
  closes: Array<number | null>,
  current: number
): { previous: number | null; window: TrendWindow | null } {
  if (timestamps.length === 0 || closes.length === 0) {
    return { previous: null, window: null }
  }

  const nowSec = Math.floor(Date.now() / 1000)

  for (const { label, seconds } of WINDOW_PRIORITY) {
    const target = nowSec - seconds
    let bestIdx = -1
    let bestDiff = Infinity

    for (let i = 0; i < timestamps.length; i++) {
      const close = closes[i]
      if (close == null || !Number.isFinite(close)) continue
      if (timestamps[i] > target) continue
      const diff = target - timestamps[i]
      if (diff < bestDiff) {
        bestDiff = diff
        bestIdx = i
      }
    }

    if (bestIdx >= 0) {
      const previous = closes[bestIdx]
      if (previous != null && previous !== current) {
        return { previous, window: label }
      }
    }
  }

  const firstValid = closes.find((c) => c != null && Number.isFinite(c))
  if (firstValid != null && firstValid !== current) {
    return { previous: firstValid, window: '1d' }
  }

  return { previous: null, window: null }
}

export function trendWindowLabel(window: TrendWindow | null | undefined): string {
  if (!window) return ''
  const labels: Record<TrendWindow, string> = {
    '5m': '5 menit',
    '1j': '1 jam',
    '1d': '1 hari',
    '1bln': '1 bulan',
    '1th': '1 tahun',
  }
  return labels[window]
}

/** Mundur dari tanggal ISO hingga Frankfurter mengembalikan kurs (lewati akhir pekan). */
export async function frankfurterRateOnOrBefore(
  startDate: string,
  fetchRate: (date: string) => Promise<number | null>,
  maxDays = 7
): Promise<{ date: string; rate: number } | null> {
  const d = new Date(`${startDate}T12:00:00Z`)

  for (let i = 1; i <= maxDays; i++) {
    d.setUTCDate(d.getUTCDate() - 1)
    const iso = d.toISOString().slice(0, 10)
    const rate = await fetchRate(iso)
    if (rate != null) return { date: iso, rate }
  }

  return null
}
