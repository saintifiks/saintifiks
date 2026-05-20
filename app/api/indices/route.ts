import { flattenIndices, getIndicesSnapshot } from '@/lib/indices/get-indices'
import { INDICES_MIN_POLL_MS } from '@/lib/indices/types'
import { NextResponse } from 'next/server'

const SERVER_CACHE_MS = 30_000

let cache: {
  at: number
  body: {
    items: ReturnType<typeof flattenIndices>
    fetchedAt: string
    pollIntervalMs: number
  }
} | null = null

export async function GET() {
  const now = Date.now()

  if (cache && now - cache.at < SERVER_CACHE_MS) {
    return NextResponse.json(cache.body, {
      headers: {
        'Cache-Control': `private, max-age=${Math.floor(SERVER_CACHE_MS / 1000)}`,
      },
    })
  }

  const snapshot = await getIndicesSnapshot()
  const body = {
    items: flattenIndices(snapshot),
    fetchedAt: snapshot.fetchedAt,
    pollIntervalMs: Math.max(INDICES_MIN_POLL_MS, snapshot.pollIntervalMs),
  }

  cache = { at: now, body }

  return NextResponse.json(body, {
    headers: {
      'Cache-Control': `private, max-age=${Math.floor(SERVER_CACHE_MS / 1000)}`,
    },
  })
}
