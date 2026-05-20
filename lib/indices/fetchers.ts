import { formatIdr, formatNumber, formatPercent } from './format'
import {
  computeTrend,
  frankfurterRateOnOrBefore,
  type TrendDirection,
  type TrendWindow,
} from './trend'
import type { IndexItem, IndexStatus } from './types'
import { fetchYahooQuote } from './yahoo'

const USER_AGENT = 'Mozilla/5.0 (compatible; Saintifiks/1.0; +https://saintifiks.id)'

const REVALIDATE_FAST = 30 // detik — pasar (Yahoo), mendekati batas 3s polling client
const REVALIDATE_FOREX = 300
const REVALIDATE_MONTHLY = 86_400
const REVALIDATE_ANNUAL = 2_592_000

function item(
  partial: Omit<IndexItem, 'status'> & { status?: IndexStatus }
): IndexItem {
  return { status: 'ok', ...partial }
}

function unavailable(
  partial: Omit<IndexItem, 'value' | 'status'>
): IndexItem {
  return { ...partial, value: null, status: 'unavailable', trend: 'unknown' }
}

function withTrend(
  base: IndexItem,
  trend: TrendDirection,
  trendWindow?: TrendWindow
): IndexItem {
  return { ...base, trend, trendWindow }
}

async function fetchJson<T>(
  url: string,
  revalidate: number,
  init?: RequestInit
): Promise<T | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'User-Agent': USER_AGENT, ...init?.headers },
      next: { revalidate },
    })
    if (!res.ok) return null
    return (await res.json()) as T
  } catch (error) {
    console.error('[Indices] Fetch gagal:', url, error)
    return null
  }
}

async function fetchText(
  url: string,
  revalidate: number,
  init?: RequestInit
): Promise<string | null> {
  try {
    const res = await fetch(url, {
      ...init,
      headers: { 'User-Agent': USER_AGENT, ...init?.headers },
      next: { revalidate },
    })
    if (!res.ok) return null
    return await res.text()
  } catch (error) {
    console.error('[Indices] Fetch gagal:', url, error)
    return null
  }
}

async function frankfurterIdrOnDate(date: string): Promise<number | null> {
  const data = await fetchJson<{ rates?: { IDR?: number } }>(
    `https://api.frankfurter.app/${date}?from=USD&to=IDR`,
    REVALIDATE_FOREX
  )
  const rate = data?.rates?.IDR
  return typeof rate === 'number' && Number.isFinite(rate) ? rate : null
}

/** Dua observasi terakhir Indonesia dari CSV Our World in Data */
async function fetchOwidLastTwo(
  grapher: string,
  revalidate: number
): Promise<
  { current: { year: number; value: number }; previous: { year: number; value: number } } | null
> {
  const url = `https://ourworldindata.org/grapher/${grapher}.csv?v=1&csvType=full&useColumnShortNames=true`
  const text = await fetchText(url, revalidate)
  if (!text || text.startsWith('{')) return null

  const rows = text
    .split('\n')
    .filter((line) => line.startsWith('Indonesia,'))
    .map((line) => {
      const parts = line.split(',')
      return { year: Number(parts[2]), value: Number(parts[3]) }
    })
    .filter((r) => Number.isFinite(r.year) && Number.isFinite(r.value))

  if (rows.length < 2) return null

  const previous = rows[rows.length - 2]
  const current = rows[rows.length - 1]
  return { current, previous }
}

// ——— Pasar (Yahoo intraday + Frankfurter) ———

export async function fetchUsdIdr(): Promise<IndexItem> {
  const data = await fetchJson<{ date?: string; rates?: { IDR?: number } }>(
    'https://api.frankfurter.app/latest?from=USD&to=IDR',
    REVALIDATE_FOREX
  )

  const rate = data?.rates?.IDR
  const date = data?.date
  if (!rate || !date) {
    return unavailable({
      id: 'usd-idr',
      label: 'USD/IDR',
      source: 'Frankfurter (ECB)',
      sourceUrl: 'https://www.frankfurter.app/',
    })
  }

  const prior = await frankfurterRateOnOrBefore(date, frankfurterIdrOnDate)
  const trend = computeTrend(rate, prior?.rate ?? null)

  return withTrend(
    item({
      id: 'usd-idr',
      label: 'USD/IDR',
      value: formatIdr(rate),
      detail: prior ? `vs ${prior.date}` : undefined,
      source: 'Frankfurter (ECB)',
      sourceUrl: 'https://www.frankfurter.app/',
    }),
    trend,
    prior ? '1d' : undefined
  )
}

export async function fetchIhsg(): Promise<IndexItem> {
  const quote = await fetchYahooQuote('^JKSE', REVALIDATE_FAST)
  if (!quote) {
    return unavailable({
      id: 'ihsg',
      label: 'IHSG',
      source: 'Yahoo Finance',
    })
  }

  return withTrend(
    item({
      id: 'ihsg',
      label: 'IHSG',
      value: formatNumber(quote.price, 2),
      source: 'Yahoo Finance',
      sourceUrl: 'https://finance.yahoo.com/quote/%5EJKSE',
    }),
    quote.trend,
    quote.trendWindow ?? undefined
  )
}

export async function fetchGoldIdrPerGram(): Promise<IndexItem> {
  const [gold, forex] = await Promise.all([
    fetchYahooQuote('GC=F', REVALIDATE_FAST),
    fetchJson<{ date?: string; rates?: { IDR?: number } }>(
      'https://api.frankfurter.app/latest?from=USD&to=IDR',
      REVALIDATE_FOREX
    ),
  ])

  const idrRate = forex?.rates?.IDR
  if (!gold || idrRate == null) {
    return unavailable({
      id: 'gold',
      label: 'Emas',
      detail: 'per gram (estimasi)',
      source: 'Yahoo Finance + Frankfurter',
    })
  }

  const gramsPerTroyOz = 31.1035
  const idrPerGram = (gold.price * idrRate) / gramsPerTroyOz

  return withTrend(
    item({
      id: 'gold',
      label: 'Emas',
      value: formatIdr(idrPerGram),
      detail: 'per gram (estimasi)',
      source: 'Yahoo Finance + Frankfurter',
    }),
    gold.trend,
    gold.trendWindow ?? undefined
  )
}

export async function fetchBrentOil(): Promise<IndexItem> {
  const quote = await fetchYahooQuote('BZ=F', REVALIDATE_FAST)
  if (!quote) {
    return unavailable({
      id: 'brent',
      label: 'Minyak Brent',
      detail: 'USD/barrel',
      source: 'Yahoo Finance',
    })
  }

  return withTrend(
    item({
      id: 'brent',
      label: 'Minyak Brent',
      value: `$${formatNumber(quote.price, 2)}`,
      detail: 'USD/barrel',
      source: 'Yahoo Finance',
      sourceUrl: 'https://finance.yahoo.com/quote/BZ%3DF',
    }),
    quote.trend,
    quote.trendWindow ?? undefined
  )
}

// ——— Kebijakan moneter ———

async function fetchInflationBps(): Promise<IndexItem | null> {
  const key = process.env.BPS_API_KEY
  if (!key) return null

  const url = `https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/5200/subcat/5/key/${key}`
  const data = await fetchJson<{
    data?: Array<{ val: string; title: string; th: string }>
  }>(url, REVALIDATE_MONTHLY)

  const latest = data?.data?.[0]
  const prev = data?.data?.[1]
  if (!latest?.val) return null

  const value = Number(latest.val.replace(',', '.'))
  if (!Number.isFinite(value)) return null

  const prevVal = prev?.val ? Number(prev.val.replace(',', '.')) : null
  const trend = computeTrend(value, Number.isFinite(prevVal as number) ? prevVal : null)

  return withTrend(
    item({
      id: 'inflation',
      label: 'Inflasi',
      value: formatPercent(value),
      detail: latest.th ? `YoY ${latest.th}` : 'YoY',
      source: 'BPS',
      sourceUrl: 'https://www.bps.go.id/',
    }),
    trend,
    prevVal != null ? '1bln' : undefined
  )
}

export async function fetchInflation(): Promise<IndexItem> {
  const bps = await fetchInflationBps()
  if (bps) return bps

  type WbRow = { date?: string; value?: number }
  const data = await fetchJson<[unknown, WbRow[]]>(
    'https://api.worldbank.org/v2/country/IDN/indicator/FP.CPI.TOTL.ZG?format=json&mrv=2',
    REVALIDATE_MONTHLY
  )

  const rows = data?.[1]
  const latest = rows?.[0]
  const prev = rows?.[1]
  if (latest?.value == null || !latest.date) {
    return unavailable({
      id: 'inflation',
      label: 'Inflasi',
      source: 'World Bank',
      sourceUrl: 'https://data.worldbank.org/',
    })
  }

  const trend = computeTrend(latest.value, prev?.value ?? null)

  return withTrend(
    item({
      id: 'inflation',
      label: 'Inflasi',
      value: formatPercent(latest.value),
      detail: `YoY tahunan ${latest.date}`,
      source: 'World Bank',
      sourceUrl: 'https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=ID',
    }),
    trend,
    prev ? '1th' : undefined
  )
}

export async function fetchBi7drr(): Promise<IndexItem> {
  const html = await fetchText(
    'https://www.bi.go.id/id/statistik/indikator/bi-rate/Default.aspx',
    REVALIDATE_MONTHLY
  )

  if (html) {
    const normalized = html.replace(/\s+/g, ' ')
    const bi7Match =
      normalized.match(/BI\s*7[\s-]*DRR[^0-9]{0,40}([\d]+[,.]\d+)/i) ??
      normalized.match(/BI7DRR[^0-9]{0,20}([\d]+[,.]\d+)/i)

    if (bi7Match?.[1]) {
      const rate = Number(bi7Match[1].replace(',', '.'))
      if (Number.isFinite(rate)) {
        return withTrend(
          item({
            id: 'bi7drr',
            label: 'BI7DRR',
            value: formatPercent(rate),
            source: 'Bank Indonesia',
            sourceUrl:
              'https://www.bi.go.id/id/statistik/indikator/bi-rate/Default.aspx',
          }),
          'flat',
          undefined
        )
      }
    }
  }

  return unavailable({
    id: 'bi7drr',
    label: 'BI7DRR',
    source: 'Bank Indonesia',
    sourceUrl: 'https://www.bi.go.id/id/statistik/indikator/bi-rate/Default.aspx',
  })
}

// ——— Tata kelola (tahunan, bandingkan tahun sebelumnya) ———

function annualItem(
  id: string,
  label: string,
  pair: {
    current: { year: number; value: number }
    previous: { year: number; value: number }
  },
  formatValue: (v: number) => string,
  source: string,
  sourceUrl: string,
  detailExtra?: string
): IndexItem {
  const trend = computeTrend(pair.current.value, pair.previous.value)
  return withTrend(
    item({
      id,
      label,
      value: formatValue(pair.current.value),
      detail: detailExtra ?? String(pair.current.year),
      source,
      sourceUrl,
    }),
    trend,
    '1th'
  )
}

export async function fetchPressFreedom(): Promise<IndexItem> {
  const pair = await fetchOwidLastTwo('press-freedom-index-rsf', REVALIDATE_ANNUAL)
  if (!pair) {
    return unavailable({
      id: 'rsf',
      label: 'Kebebasan Pers',
      source: 'RSF via Our World in Data',
      sourceUrl: 'https://rsf.org/',
    })
  }

  return annualItem(
    'rsf',
    'Kebebasan Pers',
    pair,
    (v) => formatNumber(v, 2),
    'RSF via Our World in Data',
    'https://rsf.org/en/index',
    `skor ${pair.current.year}`
  )
}

export async function fetchCorruptionPerception(): Promise<IndexItem> {
  const pair = await fetchOwidLastTwo('ti-corruption-perception-index', REVALIDATE_ANNUAL)
  if (!pair) {
    return unavailable({
      id: 'cpi',
      label: 'Persepsi Korupsi',
      source: 'Transparency International via OWID',
      sourceUrl: 'https://www.transparency.org/',
    })
  }

  return annualItem(
    'cpi',
    'Persepsi Korupsi',
    pair,
    (v) => String(Math.round(v)),
    'Transparency International via OWID',
    'https://www.transparency.org/en/cpi',
    `skor ${pair.current.year}`
  )
}

export async function fetchDemocracyIndex(): Promise<IndexItem> {
  const pair = await fetchOwidLastTwo('democracy-index-eiu', REVALIDATE_ANNUAL)
  if (!pair) {
    return unavailable({
      id: 'democracy',
      label: 'Indeks Demokrasi',
      source: 'EIU via Our World in Data',
      sourceUrl: 'https://www.eiu.com/',
    })
  }

  return annualItem(
    'democracy',
    'Indeks Demokrasi',
    pair,
    (v) => formatNumber(v, 2),
    'EIU via Our World in Data',
    'https://www.eiu.com/n/campaigns/democracy-index-2024/',
    `skala 0–10, ${pair.current.year}`
  )
}

export async function fetchHdi(): Promise<IndexItem> {
  const pair = await fetchOwidLastTwo('human-development-index', REVALIDATE_ANNUAL)
  if (!pair) {
    return unavailable({
      id: 'hdi',
      label: 'IPM',
      source: 'UNDP via Our World in Data',
      sourceUrl: 'https://hdr.undp.org/',
    })
  }

  return annualItem(
    'hdi',
    'IPM',
    pair,
    (v) => formatNumber(v, 3),
    'UNDP via Our World in Data',
    'https://hdr.undp.org/data-center/country-insights/indonesia',
    String(pair.current.year)
  )
}
