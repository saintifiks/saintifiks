const USER_AGENT = 'Mozilla/5.0 (compatible; Saintifiks/1.0; +https://saintifiks.id)'

export type FetchMode = { live?: boolean; revalidate?: number }

export function externalFetchInit(mode: FetchMode): RequestInit {
  if (mode.live) {
    return {
      headers: { 'User-Agent': USER_AGENT },
      cache: 'no-store',
    }
  }
  return {
    headers: { 'User-Agent': USER_AGENT },
    next: { revalidate: mode.revalidate ?? 60 },
  }
}
