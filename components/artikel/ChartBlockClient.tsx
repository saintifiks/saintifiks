'use client'

import dynamic from 'next/dynamic'

type ChartBlockClientProps = {
  identifier: string
  configString: string | object | null
}

const DynamicChartBlock = dynamic(
  () => import('./ChartBlock'),
  {
    ssr: false,
    loading: () => (
      <div
        className="my-8 flex min-h-44 items-center justify-center rounded border border-signal-warning/25 bg-signal-warning-surface p-6 text-center"
        role="status"
      >
        <p className="text-sm leading-relaxed text-ink">
          Grafik visual belum tersedia. Gunakan penjelasan dalam artikel sebagai konteks utama.
        </p>
      </div>
    ),
  }
)

export default function ChartBlockClient({
  identifier,
  configString,
}: ChartBlockClientProps) {
  return (
    <DynamicChartBlock
      identifier={identifier}
      configString={configString}
    />
  )
}