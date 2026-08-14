'use client'

import { useId } from 'react'
import {
  Chart as ChartJS,
  registerables,
  type ChartData,
  type ChartOptions,
  type ChartType,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'
import JSON5 from 'json5'

ChartJS.register(...registerables)

type ChartBlockProps = {
  identifier: string
  configString: string | object | null
}

type AccessibleDataset = {
  label: string
  values: unknown[]
}

const SUPPORTED_CHART_TYPES = new Set<ChartType>([
  'bar',
  'line',
  'scatter',
  'bubble',
  'pie',
  'doughnut',
  'polarArea',
  'radar',
])

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function formatChartValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—'
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : '—'
  if (typeof value === 'string' || typeof value === 'boolean') return String(value)
  if (Array.isArray(value)) return value.map(formatChartValue).join(', ')
  if (isRecord(value)) {
    return Object.entries(value)
      .map(([key, entry]) => `${key}: ${formatChartValue(entry)}`)
      .join(', ')
  }
  return String(value)
}

function readChartTitle(config: Record<string, unknown>, identifier: string): string {
  const options = isRecord(config.options) ? config.options : null
  const plugins = options && isRecord(options.plugins) ? options.plugins : null
  const title = plugins && isRecord(plugins.title) ? plugins.title : null
  const titleText = title?.text

  if (typeof titleText === 'string' && titleText.trim()) return titleText.trim()
  if (Array.isArray(titleText)) {
    const joinedTitle = titleText
      .filter((line): line is string => typeof line === 'string')
      .map((line) => line.trim())
      .filter(Boolean)
      .join(' ')
    if (joinedTitle) return joinedTitle
  }

  return `Grafik data (${identifier})`
}

function readAccessibleData(config: Record<string, unknown>) {
  const data = isRecord(config.data) ? config.data : null
  if (!data) throw new Error('Chart data is missing')

  const labels = Array.isArray(data.labels)
    ? data.labels.map(formatChartValue)
    : []
  const datasets: AccessibleDataset[] = Array.isArray(data.datasets)
    ? data.datasets
      .filter(isRecord)
      .map((dataset, index) => ({
        label: typeof dataset.label === 'string' && dataset.label.trim()
          ? dataset.label.trim()
          : `Seri ${index + 1}`,
        values: Array.isArray(dataset.data) ? dataset.data : [],
      }))
    : []
  const rowCount = Math.max(labels.length, ...datasets.map((dataset) => dataset.values.length), 0)
  const rows = Array.from({ length: rowCount }, (_, index) => {
    const pointWithX = datasets
      .map((dataset) => dataset.values[index])
      .find((value) => isRecord(value) && value.x !== undefined)
    const fallbackLabel = isRecord(pointWithX)
      ? formatChartValue(pointWithX.x)
      : `Data ${index + 1}`

    return {
      label: labels[index] ?? fallbackLabel,
      values: datasets.map((dataset) => formatChartValue(dataset.values[index])),
    }
  })

  return { data, datasets, rows }
}

export default function ChartBlock({ identifier, configString }: ChartBlockProps) {
  const titleId = useId()
  const descriptionId = useId()

  if (!configString) {
    return (
      <div
        className="my-8 flex items-center justify-center rounded border border-signal-warning/25 bg-signal-warning-surface p-6"
        role="status"
      >
        <p className="font-helvetica text-sm text-ink">
          Data grafik untuk bagian ini belum tersedia.
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
    if (!isRecord(config)) throw new Error('Invalid chart config')

    const requestedType = typeof config.type === 'string' ? config.type : 'line'
    if (!SUPPORTED_CHART_TYPES.has(requestedType as ChartType)) {
      throw new Error('Unsupported chart type')
    }

    const chartType = requestedType as ChartType
    const chartTitle = readChartTitle(config, identifier)
    const { data, datasets, rows } = readAccessibleData(config)
    const chartData = data as unknown as ChartData
    const chartOptions = isRecord(config.options)
      ? config.options as unknown as ChartOptions
      : undefined
    const structuralSummary = rows.length > 0 && datasets.length > 0
      ? `Grafik ini memuat ${rows.length} baris data dalam ${datasets.length} seri. Nilai lengkap tersedia pada tabel data.`
      : 'Konfigurasi grafik ini tidak menyertakan data tabular yang dapat ditampilkan.'

    return (
      <figure
        className="my-10 space-y-4"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
      >
        <figcaption id={titleId} className="font-helvetica text-sm font-semibold text-ink">
          {chartTitle}
        </figcaption>

        <p id={descriptionId} className="font-helvetica text-sm leading-relaxed text-ink/65">
          {structuralSummary}
        </p>

        <div
          className="h-auto w-full border border-ink/10 bg-white p-4 shadow-sm"
          aria-hidden="true"
        >
          <Chart type={chartType} data={chartData} options={chartOptions} />
        </div>

        <details className="border border-ink/10 bg-paper">
          <summary className="flex min-h-[44px] cursor-pointer items-center px-4 font-helvetica text-sm font-medium text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary">
            Data grafik
          </summary>

          {rows.length > 0 && datasets.length > 0 ? (
            <div className="overflow-x-auto border-t border-ink/10">
              <table className="min-w-full border-collapse font-helvetica text-sm text-ink">
                <caption className="sr-only">Data untuk {chartTitle}</caption>
                <thead>
                  <tr className="bg-ink/5">
                    <th scope="col" className="border-b border-ink/10 px-3 py-2 text-left font-semibold">
                      Kategori
                    </th>
                    {datasets.map((dataset, index) => (
                      <th
                        key={`${dataset.label}-${index}`}
                        scope="col"
                        className="border-b border-ink/10 px-3 py-2 text-left font-semibold"
                      >
                        {dataset.label}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIndex) => (
                    <tr key={`${row.label}-${rowIndex}`} className="border-b border-ink/10 last:border-b-0">
                      <th scope="row" className="whitespace-nowrap px-3 py-2 text-left font-medium">
                        {row.label}
                      </th>
                      {row.values.map((value, valueIndex) => (
                        <td key={`${rowIndex}-${valueIndex}`} className="px-3 py-2 tabular-nums">
                          {value}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="border-t border-ink/10 px-4 py-3 font-helvetica text-sm text-ink/65">
              Data tabular belum tersedia pada konfigurasi grafik ini.
            </p>
          )}
        </details>
      </figure>
    )
  } catch {
    return (
      <div
        className="my-8 flex flex-col items-center justify-center rounded border border-signal-danger/25 bg-signal-danger-surface p-6 text-center"
        role="status"
      >
        <p className="mb-2 font-helvetica text-sm font-bold text-signal-danger">
          Grafik tidak dapat ditampilkan.
        </p>
        <p className="font-helvetica text-xs text-ink/70">
          Data visual untuk bagian ini sedang tidak tersedia. Gunakan penjelasan dalam artikel sebagai konteks utama.
        </p>
      </div>
    )
  }
}
