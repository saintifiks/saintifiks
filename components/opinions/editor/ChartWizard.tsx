'use client'

// Wizard pembuatan chart untuk editor opinions
// Generate JSON5 config dan placeholder {{chart:id}} di konten Markdown

import { useState } from 'react'
import { X, Plus, Trash2 } from 'lucide-react'

type ChartWizardProps = {
  articleId: string
  onInsert: (chartId: string, config: object) => void
  onClose: () => void
}

type DatasetRow = { label: string; value: string }

const CHART_TYPES = [
  { value: 'bar', label: 'Bar Chart' },
  { value: 'line', label: 'Line Chart' },
  { value: 'pie', label: 'Pie Chart' },
  { value: 'doughnut', label: 'Doughnut Chart' },
]

export default function ChartWizard({ onInsert, onClose }: ChartWizardProps) {
  const [chartType, setChartType] = useState('bar')
  const [chartTitle, setChartTitle] = useState('')
  const [labels, setLabels] = useState<string[]>(['Label 1', 'Label 2', 'Label 3'])
  const [datasets, setDatasets] = useState<DatasetRow[]>([
    { label: 'Dataset 1', value: '10, 20, 30' },
  ])
  const [error, setError] = useState('')

  function addLabel() {
    setLabels([...labels, `Label ${labels.length + 1}`])
  }

  function removeLabel(idx: number) {
    if (labels.length <= 2) return
    setLabels(labels.filter((_, i) => i !== idx))
  }

  function updateLabel(idx: number, val: string) {
    const next = [...labels]
    next[idx] = val
    setLabels(next)
  }

  function addDataset() {
    setDatasets([...datasets, { label: `Dataset ${datasets.length + 1}`, value: '' }])
  }

  function removeDataset(idx: number) {
    if (datasets.length <= 1) return
    setDatasets(datasets.filter((_, i) => i !== idx))
  }

  function updateDataset(idx: number, field: 'label' | 'value', val: string) {
    const next = [...datasets]
    next[idx] = { ...next[idx], [field]: val }
    setDatasets(next)
  }

  // Warna default per dataset
  const COLORS = [
    'rgba(59, 91, 179, 0.8)',
    'rgba(179, 59, 59, 0.8)',
    'rgba(92, 143, 110, 0.8)',
    'rgba(179, 140, 59, 0.8)',
    'rgba(120, 59, 179, 0.8)',
  ]

  function handleGenerate() {
    setError('')

    if (!chartTitle.trim()) {
      setError('Judul chart wajib diisi')
      return
    }

    const parsedDatasets = datasets.map((ds, i) => {
      const values = ds.value.split(',').map((v) => parseFloat(v.trim()))
      if (values.some(isNaN)) {
        setError(`Dataset "${ds.label}" mengandung nilai yang bukan angka`)
        return null
      }
      return {
        label: ds.label,
        data: values,
        backgroundColor: COLORS[i % COLORS.length],
        borderColor: COLORS[i % COLORS.length].replace('0.8', '1'),
        borderWidth: 1,
      }
    })

    if (parsedDatasets.some((d) => d === null)) return

    const chartId = `chart-${Date.now()}`

    const config = {
      type: chartType,
      data: {
        labels,
        datasets: parsedDatasets,
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: {
            display: true,
            text: chartTitle.trim(),
          },
        },
      },
    }

    // Dispatch event ke TipTapEditor agar chart diinsert sebagai custom node
    window.dispatchEvent(new CustomEvent('tiptap:insert-chart', { detail: chartId }))
    onInsert(chartId, config)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/40 overflow-y-auto">
      <div className="bg-primary-light border border-primary-dark/10 w-full max-w-lg p-6 my-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-helvetica text-sm font-bold text-primary-dark uppercase tracking-widest">
            Buat Chart
          </h3>
          <button onClick={onClose} className="text-primary-dark/40 hover:text-primary-dark transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        <div className="space-y-5">

          {/* Tipe chart */}
          <div>
            <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-2">
              Tipe Chart
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              className="w-full border border-primary-dark/15 bg-white px-3 py-2 font-helvetica text-sm text-primary-dark focus:outline-none focus:border-primary-dark/40"
            >
              {CHART_TYPES.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {/* Judul chart */}
          <div>
            <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-2">
              Judul Chart
            </label>
            <input
              type="text"
              value={chartTitle}
              onChange={(e) => { setChartTitle(e.target.value); setError('') }}
              placeholder="Contoh: Pertumbuhan PDB 2020–2024"
              className="w-full border border-primary-dark/15 bg-white px-3 py-2 font-helvetica text-sm text-primary-dark placeholder:text-primary-dark/30 focus:outline-none focus:border-primary-dark/40"
            />
          </div>

          {/* Labels */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest">
                Label Sumbu X
              </label>
              <button
                type="button"
                onClick={addLabel}
                disabled={labels.length >= 20}
                className="flex items-center gap-1 font-helvetica text-xs text-accent-blue hover:opacity-70 disabled:opacity-30 transition-opacity duration-150"
              >
                <Plus size={12} />
                Tambah
              </button>
            </div>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {labels.map((lbl, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={lbl}
                    onChange={(e) => updateLabel(idx, e.target.value)}
                    className="flex-1 border border-primary-dark/15 bg-white px-3 py-1.5 font-helvetica text-sm text-primary-dark focus:outline-none focus:border-primary-dark/40"
                  />
                  <button
                    type="button"
                    onClick={() => removeLabel(idx)}
                    disabled={labels.length <= 2}
                    className="text-primary-dark/30 hover:text-accent-red disabled:opacity-20 transition-colors duration-150"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Datasets */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest">
                Dataset
              </label>
              <button
                type="button"
                onClick={addDataset}
                disabled={datasets.length >= 5}
                className="flex items-center gap-1 font-helvetica text-xs text-accent-blue hover:opacity-70 disabled:opacity-30 transition-opacity duration-150"
              >
                <Plus size={12} />
                Tambah
              </button>
            </div>
            <div className="space-y-3">
              {datasets.map((ds, idx) => (
                <div key={idx} className="border border-primary-dark/10 p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <input
                      type="text"
                      value={ds.label}
                      onChange={(e) => updateDataset(idx, 'label', e.target.value)}
                      placeholder="Nama dataset"
                      className="flex-1 border border-primary-dark/15 bg-white px-3 py-1.5 font-helvetica text-sm text-primary-dark focus:outline-none focus:border-primary-dark/40"
                    />
                    <button
                      type="button"
                      onClick={() => removeDataset(idx)}
                      disabled={datasets.length <= 1}
                      className="text-primary-dark/30 hover:text-accent-red disabled:opacity-20 transition-colors duration-150"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={ds.value}
                    onChange={(e) => updateDataset(idx, 'value', e.target.value)}
                    placeholder={`Nilai (pisahkan koma, harus ${labels.length} nilai)`}
                    className="w-full border border-primary-dark/15 bg-white px-3 py-1.5 font-helvetica text-sm text-primary-dark placeholder:text-primary-dark/30 focus:outline-none focus:border-primary-dark/40"
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {error && (
          <p className="font-helvetica text-xs text-accent-red mt-4">{error}</p>
        )}

        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={onClose}
            className="font-helvetica text-sm text-primary-dark/50 hover:text-primary-dark transition-colors duration-150"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={handleGenerate}
            className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2 hover:opacity-80 transition-opacity duration-150"
          >
            Sisipkan Chart
          </button>
        </div>

      </div>
    </div>
  )
}
