'use client'

// TableWizard — panel pembuat tabel Markdown. Penulis memilih jumlah kolom dan baris; hasilnya kerangka tabel GFM
// yang disisipkan ke tulisan.

import { useState } from 'react'
import { Button, Field, Input, Sheet } from '@/components/ui'
import { generateMarkdownTable } from '@/lib/editor-helpers'

type TableWizardProps = {
  onInsert: (markdown: string) => void
  onClose: () => void
}

const MAX_COLS = 10
const MAX_ROWS = 20

export default function TableWizard({ onInsert, onClose }: TableWizardProps) {
  const [cols, setCols] = useState(3)
  const [rows, setRows] = useState(3)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    onInsert(generateMarkdownTable(Math.min(MAX_COLS, Math.max(1, cols)), Math.min(MAX_ROWS, Math.max(1, rows))))
    onClose()
  }

  return (
    <Sheet
      open
      onClose={onClose}
      title="Sisipkan tabel"
      footer={
        <div className="flex items-center gap-6">
          <Button type="submit" form="table-wizard-form">
            Sisipkan
          </Button>
          <Button variant="text" onClick={onClose}>
            Batal
          </Button>
        </div>
      }
    >
      <p className="font-display text-body-sm italic leading-relaxed text-text-secondary">
        Tabel kosong dengan baris judul. Isi selnya langsung di tulisan.
      </p>
      <form id="table-wizard-form" onSubmit={handleSubmit} className="mt-8 grid grid-cols-2 gap-8">
        <Field label="Kolom" hint={`Maksimal ${MAX_COLS}`}>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_COLS}
            value={cols}
            onChange={(e) => setCols(parseInt(e.target.value) || 1)}
          />
        </Field>
        <Field label="Baris" hint={`Maksimal ${MAX_ROWS}`}>
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            max={MAX_ROWS}
            value={rows}
            onChange={(e) => setRows(parseInt(e.target.value) || 1)}
          />
        </Field>
      </form>
    </Sheet>
  )
}
