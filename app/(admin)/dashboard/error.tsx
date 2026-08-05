'use client'

import { AlertTriangle, RotateCcw } from 'lucide-react'

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center justify-center" aria-labelledby="dashboard-error-title">
      <div className="w-full max-w-lg rounded-lg border border-signal-danger/25 bg-surface-elevated p-6 text-center sm:p-8">
        <span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-signal-danger-surface text-signal-danger">
          <AlertTriangle aria-hidden="true" size={21} />
        </span>
        <h1 id="dashboard-error-title" className="mt-4 font-display text-xl font-bold text-text-primary">
          Halaman belum dapat dimuat
        </h1>
        <p className="mt-2 text-sm leading-6 text-text-secondary">
          Data Anda tetap aman. Coba muat kembali bagian dashboard ini.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 inline-flex min-h-[44px] items-center justify-center gap-2 rounded-lg bg-interactive-primary px-4 py-2.5 text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary"
        >
          <RotateCcw aria-hidden="true" size={16} />
          Coba lagi
        </button>
      </div>
    </main>
  )
}
