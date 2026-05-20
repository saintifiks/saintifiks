'use client'

// [PERBAIKAN SESI #18 — fix/chart-ssr]
// Masalah: "bar" is not a registered controller
// Penyebab: Chart.js v4 memisahkan Controller dan Element. Kode sebelumnya
//           mendaftarkan BarElement tapi bukan BarController.
// Solusi: Gunakan `registerables` yang mendaftarkan semua komponen sekaligus.
//         Lebih robust untuk website jurnalisme yang akan pakai berbagai jenis chart.

import { Chart as ChartJS, registerables } from 'chart.js'
import { Chart } from 'react-chartjs-2'

// Daftarkan semua komponen Chart.js: semua controller (bar, line, pie, dll.),
// semua elemen, semua scale, dan semua plugin (tooltip, legend, dll.)
ChartJS.register(...registerables)

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
