'use client'

import { Button } from '@/components/ui'

export default function DashboardError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="flex min-h-[60vh] items-center" aria-labelledby="dashboard-error-title">
      <div className="max-w-lg border-l border-signal-danger pl-6">
        <h1 id="dashboard-error-title" className="font-display text-display-sm leading-tight text-text-primary">
          Halaman belum dapat dimuat
        </h1>
        <p className="mt-3 font-display text-body-sm italic leading-relaxed text-text-secondary">
          Data Anda tetap aman. Coba muat kembali bagian dashboard ini.
        </p>
        <Button onClick={reset} className="mt-8">
          Coba lagi
        </Button>
      </div>
    </main>
  )
}
