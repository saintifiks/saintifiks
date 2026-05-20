import { flattenIndices, getIndicesSnapshot } from '@/lib/indices/get-indices'
import IndexStripClient from './IndexStripClient'

export default async function IndexStrip() {
  const snapshot = await getIndicesSnapshot()

  return (
    <IndexStripClient
      initialItems={flattenIndices(snapshot)}
      initialPollMs={snapshot.pollIntervalMs}
    />
  )
}
