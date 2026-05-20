import { formatIdr, formatNumber, formatPercent } from './format'
import type { IndexItem, IndexStatus } from './types'

const USER_AGENT = 'Mozilla/5.0 (compatible; Saintifiks/1.0; +https://saintifiks.id)'

const REVALIDATE_FOREX = 300
const REVALIDATE_DAILY = 3600
const REVALIDATE_MONTHLY = 86_400
const REVALIDATE_ANNUAL = 2_592_000 // 30 hari

function item(
  partial: Omit<IndexItem, 'status'> & { status?: IndexStatus }
): IndexItem {
  return { status: 'ok', ...partial }
}

function unavailable(
  partial: Omit<IndexItem, 'value' | 'status'>
): IndexItem {
  return { ...partial, value: null, status: 'unavailable' }
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

/** Ambil baris terakhir Indonesia dari CSV Our World in Data */
async function fetchOwidLatest(
  grapher: string,
  revalidate: number
): Promise<{ year: number; value: number } | null> {
  const url = `https://ourworldindata.org/grapher/${grapher}.csv?v=1&csvType=full&useColumnShortNames=true`
  const text = await fetchText(url, revalidate)
  if (!text || text.startsWith('{')) return null

  const rows = text.split('\n').filter((line) => line.startsWith('Indonesia,'))
  const last = rows[rows.length - 1]
  if (!last) return null

  const parts = last.split(',')
  const year = Number(parts[2])
  const value = Number(parts[3])
  if (!Number.isFinite(year) || !Number.isFinite(value)) return null
  return { year, value }
}

type YahooChartResponse = {
  chart?: {
    result?: Array<{
      meta?: {
        regularMarketPrice?: number
        currency?: string
      }
    }>
  }
}

async function fetchYahooPrice(symbol: string): Promise<number | null> {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=1d`
  const data = await fetchJson<YahooChartResponse>(url, REVALIDATE_DAILY)
  const price = data?.chart?.result?.[0]?.meta?.regularMarketPrice
  return typeof price === 'number' && Number.isFinite(price) ? price : null
}

// ——— Update harian / mendekati real-time ———

export async function fetchUsdIdr(): Promise<IndexItem> {
  const data = await fetchJson<{
    date?: string
    rates?: { IDR?: number }
  }>('https://api.frankfurter.app/latest?from=USD&to=IDR', REVALIDATE_FOREX)

  const rate = data?.rates?.IDR
  if (!rate) {
    return unavailable({
      id: 'usd-idr',
      label: 'USD/IDR',
      source: 'Frankfurter (ECB)',
      sourceUrl: 'https://www.frankfurter.app/',
    })
  }

  return item({
    id: 'usd-idr',
    label: 'USD/IDR',
    value: formatIdr(rate),
    detail: data.date ? `per ${data.date}` : undefined,
    source: 'Frankfurter (ECB)',
    sourceUrl: 'https://www.frankfurter.app/',
  })
}

export async function fetchIhsg(): Promise<IndexItem> {
  const price = await fetchYahooPrice('^JKSE')
  if (price == null) {
    return unavailable({
      id: 'ihsg',
      label: 'IHSG',
      source: 'Yahoo Finance',
    })
  }

  return item({
    id: 'ihsg',
    label: 'IHSG',
    value: formatNumber(price, 2),
    source: 'Yahoo Finance',
    sourceUrl: 'https://finance.yahoo.com/quote/%5EJKSE',
  })
}

export async function fetchGoldIdrPerGram(): Promise<IndexItem> {
  const [goldUsd, forex] = await Promise.all([
    fetchYahooPrice('GC=F'),
    fetchJson<{ rates?: { IDR?: number } }>(
      'https://api.frankfurter.app/latest?from=USD&to=IDR',
      REVALIDATE_FOREX
    ),
  ])

  const idrRate = forex?.rates?.IDR
  if (goldUsd == null || idrRate == null) {
    return unavailable({
      id: 'gold',
      label: 'Emas',
      detail: 'per gram (estimasi)',
      source: 'Yahoo Finance + Frankfurter',
    })
  }

  const gramsPerTroyOz = 31.1035
  const idrPerGram = (goldUsd * idrRate) / gramsPerTroyOz

  return item({
    id: 'gold',
    label: 'Emas',
    value: formatIdr(idrPerGram),
    detail: 'per gram (estimasi)',
    source: 'Yahoo Finance + Frankfurter',
  })
}

export async function fetchBrentOil(): Promise<IndexItem> {
  const price = await fetchYahooPrice('BZ=F')
  if (price == null) {
    return unavailable({
      id: 'brent',
      label: 'Minyak Brent',
      detail: 'USD/barrel',
      source: 'Yahoo Finance',
    })
  }

  return item({
    id: 'brent',
    label: 'Minyak Brent',
    value: `$${formatNumber(price, 2)}`,
    detail: 'USD/barrel',
    source: 'Yahoo Finance',
    sourceUrl: 'https://finance.yahoo.com/quote/BZ%3DF',
  })
}

// ——— Update bulanan / kuartalan ———

async function fetchInflationBps(): Promise<IndexItem | null> {
  const key = process.env.BPS_API_KEY
  if (!key) return null

  // Inflasi umum YoY — domain 5200 (harga), subjek inflasi
  const url = `https://webapi.bps.go.id/v1/api/list/model/data/lang/ind/domain/5200/subcat/5/key/${key}`
  const data = await fetchJson<{
    data?: Array<{ val: string; title: string; th: string }>
  }>(url, REVALIDATE_MONTHLY)

  const latest = data?.data?.[0]
  if (!latest?.val) return null

  const value = Number(latest.val.replace(',', '.'))
  if (!Number.isFinite(value)) return null

  return item({
    id: 'inflation',
    label: 'Inflasi',
    value: formatPercent(value),
    detail: latest.th ? `YoY ${latest.th}` : 'YoY',
    source: 'BPS',
    sourceUrl: 'https://www.bps.go.id/',
  })
}

export async function fetchInflation(): Promise<IndexItem> {
  const bps = await fetchInflationBps()
  if (bps) return bps

  type WbRow = { date?: string; value?: number }
  const data = await fetchJson<[unknown, WbRow[]]>(
    'https://api.worldbank.org/v2/country/IDN/indicator/FP.CPI.TOTL.ZG?format=json&mrv=1',
    REVALIDATE_MONTHLY
  )

  const latest = data?.[1]?.[0]
  if (latest?.value == null || !latest.date) {
    return unavailable({
      id: 'inflation',
      label: 'Inflasi',
      source: 'World Bank',
      sourceUrl: 'https://data.worldbank.org/',
    })
  }

  return item({
    id: 'inflation',
    label: 'Inflasi',
    value: formatPercent(latest.value),
    detail: `YoY tahunan ${latest.date}`,
    source: 'World Bank',
    sourceUrl: 'https://data.worldbank.org/indicator/FP.CPI.TOTL.ZG?locations=ID',
  })
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
        return item({
          id: 'bi7drr',
          label: 'BI7DRR',
          value: formatPercent(rate),
          source: 'Bank Indonesia',
          sourceUrl: 'https://www.bi.go.id/id/statistik/indikator/bi-rate/Default.aspx',
        })
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

// ——— Update tahunan (Our World in Data → sumber asli) ———

export async function fetchPressFreedom(): Promise<IndexItem> {
  const latest = await fetchOwidLatest('press-freedom-index-rsf', REVALIDATE_ANNUAL)
  if (!latest) {
    return unavailable({
      id: 'rsf',
      label: 'Kebebasan Pers',
      source: 'RSF via Our World in Data',
      sourceUrl: 'https://rsf.org/',
    })
  }

  return item({
    id: 'rsf',
    label: 'Kebebasan Pers',
    value: formatNumber(latest.value, 2),
    detail: `skor ${latest.year}`,
    source: 'RSF via Our World in Data',
    sourceUrl: 'https://rsf.org/en/index',
  })
}

export async function fetchCorruptionPerception(): Promise<IndexItem> {
  const latest = await fetchOwidLatest('ti-corruption-perception-index', REVALIDATE_ANNUAL)
  if (!latest) {
    return unavailable({
      id: 'cpi',
      label: 'Persepsi Korupsi',
      source: 'Transparency International via OWID',
      sourceUrl: 'https://www.transparency.org/',
    })
  }

  return item({
    id: 'cpi',
    label: 'Persepsi Korupsi',
    value: String(Math.round(latest.value)),
    detail: `skor ${latest.year}`,
    source: 'Transparency International via OWID',
    sourceUrl: 'https://www.transparency.org/en/cpi',
  })
}

export async function fetchDemocracyIndex(): Promise<IndexItem> {
  const latest = await fetchOwidLatest('democracy-index-eiu', REVALIDATE_ANNUAL)
  if (!latest) {
    return unavailable({
      id: 'democracy',
      label: 'Indeks Demokrasi',
      source: 'EIU via Our World in Data',
      sourceUrl: 'https://www.eiu.com/',
    })
  }

  return item({
    id: 'democracy',
    label: 'Indeks Demokrasi',
    value: formatNumber(latest.value, 2),
    detail: `skala 0–10, ${latest.year}`,
    source: 'EIU via Our World in Data',
    sourceUrl: 'https://www.eiu.com/n/campaigns/democracy-index-2024/',
  })
}

export async function fetchHdi(): Promise<IndexItem> {
  const latest = await fetchOwidLatest('human-development-index', REVALIDATE_ANNUAL)
  if (!latest) {
    return unavailable({
      id: 'hdi',
      label: 'IPM',
      source: 'UNDP via Our World in Data',
      sourceUrl: 'https://hdr.undp.org/',
    })
  }

  return item({
    id: 'hdi',
    label: 'IPM',
    value: formatNumber(latest.value, 3),
    detail: String(latest.year),
    source: 'UNDP via Our World in Data',
    sourceUrl: 'https://hdr.undp.org/data-center/country-insights/indonesia',
  })
}
