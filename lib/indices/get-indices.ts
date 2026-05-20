import {
  fetchBi7drr,
  fetchBrentOil,
  fetchCorruptionPerception,
  fetchDemocracyIndex,
  fetchGoldIdrPerGram,
  fetchHdi,
  fetchIhsg,
  fetchInflation,
  fetchPressFreedom,
  fetchUsdIdr,
} from './fetchers'
import type { IndicesSnapshot } from './types'
import { INDICES_DEFAULT_POLL_MS } from './types'

export async function getIndicesSnapshot(
  live = false
): Promise<IndicesSnapshot> {
  const market = { live } as const

  const [
    usdIdr,
    ihsg,
    gold,
    brent,
    inflation,
    bi7drr,
    rsf,
    cpi,
    democracy,
    hdi,
  ] = await Promise.all([
    fetchUsdIdr(market),
    fetchIhsg(market),
    fetchGoldIdrPerGram(market),
    fetchBrentOil(market),
    fetchInflation(),
    fetchBi7drr(),
    fetchPressFreedom(),
    fetchCorruptionPerception(),
    fetchDemocracyIndex(),
    fetchHdi(),
  ])

  return {
    daily: [usdIdr, ihsg, gold, brent],
    periodic: [inflation, bi7drr],
    annual: [rsf, cpi, democracy, hdi],
    fetchedAt: new Date().toISOString(),
    pollIntervalMs: INDICES_DEFAULT_POLL_MS,
  }
}

export function flattenIndices(snapshot: IndicesSnapshot) {
  return [...snapshot.daily, ...snapshot.periodic, ...snapshot.annual]
}
