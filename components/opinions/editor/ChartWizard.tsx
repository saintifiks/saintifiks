'use client'

// ChartWizard — panel pembuat grafik untuk tulisan Argumen. Hasilnya konfigurasi Chart.js yang disimpan bersama
// tulisan dan ditandai {{chart:id}} di isi. Warna grafik monokrom (tinta dengan tingkat keterangan berbeda)
// sesuai bahasa visual Saintifiks; pada grafik lingkaran setiap irisan mendapat tingkatnya sendiri.

import { useState } from 'react'
import { Button, Field, Input, Select, Sheet } from '@/components/ui'

type ChartWizardProps = {
  articleId: string
  onInsert: (chartId: string, config: object) => void
  onClose: () => void
}

type DatasetRow = { label: string; value: string }

const CHART_TYPES = [
  { value: 'bar', label: 'Batang' },
  { value: 'line', label: 'Garis' },
  { value: 'pie', label: 'Lingkaran' },
  { value: 'doughnut', label: 'Cincin' },
]

// Tinta pada tingkat keterangan menurun: cukup terbedakan di atas kartu putih dan tetap monokrom.
const TONES = [0.9, 0.62, 0.4, 0.24, 0.12, 0.76, 0.5, 0.32]
const tone = (i: number, a = TONES[i % TONES.length]) => `rgba(26, 25, 23, ${a})`

const sectionTitle = 'font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary'

export default function ChartWizard({ onInsert, onClose }: ChartWizardProps) {
  const [chartType, setChartType] = useState('bar')
  const [chartTitle, setChartTitle] = useState('')
  const [labels, setLabels] = useState<string[]>(['Label 1', 'Label 2', 'Label 3'])
  const [datasets, setDatasets] = useState<DatasetRow[]>([{ label: 'Dataset 1', value: '10, 20, 30' }])
  const [error, setError] = useState('')

  const circular = chartType === 'pie' || chartType === 'doughnut'

  function updateLabel(idx: number, val: string) {
    setLabels(labels.map((l, i) => (i === idx ? val : l)))
  }

  function updateDataset(idx: number, field: 'label' | 'value', val: string) {
    setDatasets(datasets.map((d, i) => (i === idx ? { ...d, [field]: val } : d)))
  }

  function handleGenerate(e?: React.FormEvent) {
    e?.preventDefault()
    setError('')

    if (!chartTitle.trim()) {
      setError('Judul grafik wajib diisi.')
      return
    }

    const parsed: { label: string; data: number[] }[] = []
    for (const ds of datasets) {
      const values = ds.value.split(',').map((v) => parseFloat(v.trim()))
      if (values.some(isNaN)) {
        setError(`Dataset “${ds.label}” memuat nilai yang bukan angka.`)
        return
      }
      if (values.length !== labels.length) {
        setError(`Dataset “${ds.label}” punya ${values.length} nilai, sedangkan label ada ${labels.length}.`)
        return
      }
      parsed.push({ label: ds.label, data: values })
    }

    const chartId = `chart-${Date.now()}`
    const config = {
      type: chartType,
      data: {
        labels,
        datasets: parsed.map((d, i) => ({
          ...d,
          backgroundColor: circular ? labels.map((_, j) => tone(j)) : tone(i),
          borderColor: circular ? 'rgba(255, 255, 255, 1)' : tone(i, 1),
          borderWidth: circular ? 2 : 1,
        })),
      },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'top' },
          title: { display: true, text: chartTitle.trim() },
        },
      },
    }

    // Beri tahu TipTap agar grafik disisipkan sebagai simpul khusus
    window.dispatchEvent(new CustomEvent('tiptap:insert-chart', { detail: chartId }))
    onInsert(chartId, config)
    onClose()
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title="Sisipkan grafik"
      footer={
        <div className="flex items-center gap-6">
          <Button onClick={() => handleGenerate()}>Sisipkan</Button>
          <Button variant="text" onClick={onClose}>
            Batal
          </Button>
        </div>
      }
    >
      <form onSubmit={handleGenerate} className="grid gap-9">
        <Field label="Jenis grafik">
          <Select value={chartType} onChange={(e) => setChartType(e.target.value)}>
            {CHART_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Judul grafik" required>
          <Input
            value={chartTitle}
            onChange={(e) => {
              setChartTitle(e.target.value)
              setError('')
            }}
            placeholder="Mis. Pertumbuhan PDB 2020–2024"
            maxLength={150}
          />
        </Field>

        <section aria-label="Label">
          <div className="mb-3 flex items-center justify-between">
            <h3 className={sectionTitle}>{circular ? 'Label irisan' : 'Label sumbu X'}</h3>
            <Button
              variant="text"
              size="sm"
              onClick={() => setLabels([...labels, `Label ${labels.length + 1}`])}
              disabled={labels.length >= 20}
            >
              Tambah
            </Button>
          </div>
          <ul className="divide-y divide-border-default/15 border-y border-border-default/15">
            {labels.map((lbl, idx) => (
              <li key={idx} className="flex items-center gap-4">
                <label className="sr-only" htmlFor={`label-${idx}`}>
                  Label {idx + 1}
                </label>
                <Input id={`label-${idx}`} value={lbl} onChange={(e) => updateLabel(idx, e.target.value)} className="min-h-[44px] flex-1 border-b-0" />
                <Button
                  variant="text"
                  size="sm"
                  onClick={() => setLabels(labels.filter((_, i) => i !== idx))}
                  disabled={labels.length <= 2}
                  aria-label={`Hapus label ${idx + 1}`}
                >
                  Hapus
                </Button>
              </li>
            ))}
          </ul>
        </section>

        <section aria-label="Dataset">
          <div className="mb-3 flex items-center justify-between">
            <h3 className={sectionTitle}>Dataset</h3>
            <Button
              variant="text"
              size="sm"
              onClick={() => setDatasets([...datasets, { label: `Dataset ${datasets.length + 1}`, value: '' }])}
              disabled={datasets.length >= 5 || circular}
            >
              Tambah
            </Button>
          </div>
          <ul className="space-y-7">
            {datasets.map((ds, idx) => (
              <li key={idx} className="border-l border-border-default/30 pl-4">
                <div className="flex items-center gap-4">
                  <label className="sr-only" htmlFor={`ds-label-${idx}`}>
                    Nama dataset {idx + 1}
                  </label>
                  <Input
                    id={`ds-label-${idx}`}
                    value={ds.label}
                    onChange={(e) => updateDataset(idx, 'label', e.target.value)}
                    placeholder="Nama dataset"
                    className="flex-1"
                  />
                  <Button
                    variant="text"
                    size="sm"
                    onClick={() => setDatasets(datasets.filter((_, i) => i !== idx))}
                    disabled={datasets.length <= 1}
                    aria-label={`Hapus dataset ${idx + 1}`}
                  >
                    Hapus
                  </Button>
                </div>
                <label className="sr-only" htmlFor={`ds-value-${idx}`}>
                  Nilai dataset {idx + 1}
                </label>
                <Input
                  id={`ds-value-${idx}`}
                  value={ds.value}
                  onChange={(e) => updateDataset(idx, 'value', e.target.value)}
                  placeholder={`${labels.length} nilai, pisahkan dengan koma`}
                  inputMode="decimal"
                />
              </li>
            ))}
          </ul>
          {circular && (
            <p className="mt-3 font-mono text-caption text-text-tertiary">Grafik lingkaran dan cincin memakai satu dataset.</p>
          )}
        </section>

        {error && (
          <p role="alert" className="border-l border-signal-danger pl-4 font-interface text-sm text-signal-danger">
            {error}
          </p>
        )}
      </form>
    </Sheet>
  )
}
