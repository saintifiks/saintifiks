import type { TrendDirection, TrendWindow } from './trend'

export type IndexStatus = 'ok' | 'unavailable'

export type IndexItem = {
  id: string
  label: string
  value: string | null
  detail?: string
  source: string
  sourceUrl?: string
  status: IndexStatus
  trend?: TrendDirection
  trendWindow?: TrendWindow
}

export type IndicesSnapshot = {
  daily: IndexItem[]
  periodic: IndexItem[]
  annual: IndexItem[]
  fetchedAt: string
  /** Interval polling client (ms); minimum 3 detik */
  pollIntervalMs: number
}

export const INDICES_MIN_POLL_MS = 3_000
export const INDICES_DEFAULT_POLL_MS = 30_000
