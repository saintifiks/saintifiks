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

export async function getIndicesSnapshot(): Promise<IndicesSnapshot> {
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
    fetchUsdIdr(),
    fetchIhsg(),
    fetchGoldIdrPerGram(),
    fetchBrentOil(),
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
  }
}
