'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

// Register elemen Chart.js yang diperlukan untuk rendering client-side
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

type ChartBlockProps = {
  identifier: string
  configString: string | null
}

export default function ChartBlock({ identifier, configString }: ChartBlockProps) {
  // Fallback 1: Jika config tidak ditemukan di database
  if (!configString) {
    return (
      <div className="my-8 p-6 border border-accent-red/20 bg-accent-red/5 rounded flex items-center justify-center">
        <p className="font-helvetica text-sm text-accent-red">
          [Chart config tidak ditemukan untuk penanda: {identifier}]
        </p>
      </div>
    )
  }

  // Fallback 2: Jika JSON dari database rusak/invalid
  try {
    const config = JSON.parse(configString)
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
      <div className="my-8 p-6 border border-accent-red/20 bg-accent-red/5 rounded flex items-center justify-center">
        <p className="font-helvetica text-sm text-accent-red">
          [Format JSON tidak valid untuk chart: {identifier}]
        </p>
      </div>
    )
  }
}