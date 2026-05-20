import { externalFetchInit, type FetchMode } from './http'
import { baselineFromYahooSeries, computeTrend } from './trend'
import type { TrendDirection, TrendWindow } from './trend'

export type YahooQuote = {
  price: number
  trend: TrendDirection
  trendWindow: TrendWindow | null
}

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: { regularMarketPrice?: number }
      timestamp?: number[]
      indicators?: { quote?: Array<{ close?: Array<number | null> }> }
    }>
  }
}

export async function fetchYahooQuote(
  symbol: string,
  mode: FetchMode = {}
): Promise<YahooQuote | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=5m&range=5d`

  try {
    const res = await fetch(url, externalFetchInit({ ...mode, revalidate: mode.revalidate ?? 30 }))
    if (!res.ok) return null

    const data = (await res.json()) as YahooChartResponse
    const result = data.chart?.result?.[0]
    if (!result) return null

    const timestamps = result.timestamp ?? []
    const closes = result.indicators?.quote?.[0]?.close ?? []
    const lastClose = [...closes].reverse().find((c) => c != null && Number.isFinite(c))
    const price = result.meta?.regularMarketPrice ?? lastClose

    if (price == null || !Number.isFinite(price)) return null

    const { previous, window } = baselineFromYahooSeries(timestamps, closes, price)

    return {
      price,
      trend: computeTrend(price, previous),
      trendWindow: window,
    }
  } catch (error) {
    console.error('[Indices] Yahoo gagal:', symbol, error)
    return null
  }
}
