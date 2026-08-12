'use client'

import { Chart as ChartJS, registerables } from 'chart.js'
import { Chart } from 'react-chartjs-2'
import JSON5 from 'json5'

ChartJS.register(...registerables)

type ChartBlockProps = {
  identifier: string
  configString: string | object | null
}

export default function ChartBlock({ identifier, configString }: ChartBlockProps) {
  if (!configString) {
    return (
      <div className="my-8 p-6 border border-trend-down/20 bg-trend-down/5 rounded flex items-center justify-center">
        <p className="font-helvetica text-sm text-trend-down">
          [Chart config tidak ditemukan untuk penanda: {identifier}]
        </p>
      </div>
    )
  }

  try {
    // Handle Supabase JSONB yang di-auto-deserialize menjadi object
    // atau string dari admin preview (textarea state)
    let cleanConfig: string
    
    if (typeof configString === 'string') {
      cleanConfig = configString
    } else if (typeof configString === 'object' && configString !== null) {
      // Supabase JSONB: already parsed object, convert back to string for processing
      cleanConfig = JSON.stringify(configString)
    } else {
      throw new Error('Invalid config format')
    }

    cleanConfig = cleanConfig.trim()
    cleanConfig = cleanConfig.replace(/^```(json)?\s*/i, '')
    cleanConfig = cleanConfig.replace(/\s*```$/i, '')

    const config = JSON5.parse(cleanConfig)
    const chartType = config.type || 'line'

    return (
      <div className="my-10">
        <div className="w-full h-auto bg-paper p-4 border border-ink/10 shadow-sm">
          <Chart type={chartType} data={config.data} options={config.options} />
        </div>
      </div>
    )
  } catch {
    return (
      <div className="my-8 p-6 border border-trend-down/20 bg-trend-down/5 rounded flex items-center justify-center flex-col text-center">
        <p className="font-helvetica text-sm text-trend-down font-bold mb-2">
          [Gagal memuat chart: {identifier}]
        </p>
        <p className="font-helvetica text-xs text-trend-down/80">
          Format kode dari model salah. Pastikan struktur murni JSON5 tanpa injeksi fungsi logika (callback/function).
        </p>
      </div>
    )
  }
}