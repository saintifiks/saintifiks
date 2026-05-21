'use client'

import { Chart as ChartJS, registerables } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import JSON5 from 'json5'

ChartJS.register(...registerables)

type ChartBlockProps = {
  identifier: string
  configString: string | null
}

export default function ChartBlock({ identifier, configString }: ChartBlockProps) {
  if (!configString) {
    return (
      <div className="my-8 p-6 border border-accent-red/20 bg-accent-red/5 rounded flex items-center justify-center">
        <p className="font-helvetica text-sm text-accent-red">
          [Chart config tidak ditemukan untuk penanda: {identifier}]
        </p>
      </div>
    )
  }

  try {
    let cleanConfig = configString.trim()
    cleanConfig = cleanConfig.replace(/^```(json)?\s*/i, '')
    cleanConfig = cleanConfig.replace(/\s*```$/i, '')

    const config = JSON5.parse(cleanConfig)
    const chartType = config.type || 'line'

    return (
      <div className="my-10">
        <div className="w-full h-auto bg-white p-4 border border-primary-dark/10 shadow-sm">
          <Chart type={chartType} data={config.data} options={config.options} />
        </div>
      </div>
    )
  } catch {
    return (
      <div className="my-8 p-6 border border-accent-red/20 bg-accent-red/5 rounded flex items-center justify-center flex-col text-center">
        <p className="font-helvetica text-sm text-accent-red font-bold mb-2">
          [Gagal memuat chart: {identifier}]
        </p>
        <p className="font-helvetica text-xs text-accent-red/80">
          Format kode dari model salah. Pastikan struktur murni JSON5 tanpa injeksi fungsi logika (callback/function).
        </p>
      </div>
    )
  }
}