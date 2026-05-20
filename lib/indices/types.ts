export type IndexStatus = 'ok' | 'unavailable'

export type IndexItem = {
  id: string
  label: string
  value: string | null
  detail?: string
  source: string
  sourceUrl?: string
  status: IndexStatus
}

export type IndicesSnapshot = {
  daily: IndexItem[]
  periodic: IndexItem[]
  annual: IndexItem[]
  fetchedAt: string
}
