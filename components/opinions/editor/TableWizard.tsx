'use client'

// Modal wizard pembuatan tabel Markdown
// User mengisi jumlah kolom dan baris → generate template tabel GFM

import { useState } from 'react'
import { X } from 'lucide-react'
import { generateMarkdownTable } from '@/lib/editor-helpers'

type TableWizardProps = {
  onInsert: (markdown: string) => void
  onClose: () => void
}

export default function TableWizard({ onInsert, onClose }: TableWizardProps) {
  const [cols, setCols] = useState(3)
  const [rows, setRows] = useState(3)

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const markdown = generateMarkdownTable(
      Math.min(10, Math.max(1, cols)),
      Math.min(20, Math.max(1, rows))
    )
    onInsert(markdown)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-primary-dark/40">
      <div className="bg-primary-light border border-primary-dark/10 w-full max-w-sm p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-helvetica text-sm font-bold text-primary-dark uppercase tracking-widest">
            Buat Tabel
          </h3>
          <button onClick={onClose} className="text-primary-dark/40 hover:text-primary-dark transition-colors duration-150">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="flex gap-4 mb-6">
            <div className="flex-1">
              <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-2">
                Jumlah kolom
              </label>
              <input
                type="number"
                min={1}
                max={10}
                value={cols}
                onChange={(e) => setCols(parseInt(e.target.value) || 1)}
                className="w-full border border-primary-dark/15 bg-white px-3 py-2 font-helvetica text-sm text-primary-dark focus:outline-none focus:border-primary-dark/40"
              />
              <p className="font-helvetica text-xs text-primary-dark/30 mt-1">Maks. 10</p>
            </div>
            <div className="flex-1">
              <label className="block font-helvetica text-xs text-primary-dark/50 uppercase tracking-widest mb-2">
                Jumlah baris
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={rows}
                onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                className="w-full border border-primary-dark/15 bg-white px-3 py-2 font-helvetica text-sm text-primary-dark focus:outline-none focus:border-primary-dark/40"
              />
              <p className="font-helvetica text-xs text-primary-dark/30 mt-1">Maks. 20</p>
            </div>
          </div>

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="font-helvetica text-sm text-primary-dark/50 hover:text-primary-dark transition-colors duration-150"
            >
              Batal
            </button>
            <button
              type="submit"
              className="font-helvetica text-sm bg-primary-dark text-primary-light px-5 py-2 hover:opacity-80 transition-opacity duration-150"
            >
              Buat Tabel
            </button>
          </div>
        </form>

      </div>
    </div>
  )
}
