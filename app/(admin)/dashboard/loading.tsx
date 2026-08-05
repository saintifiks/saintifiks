export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Memuat halaman admin" className="animate-pulse">
      <div className="border-b border-border-default/15 pb-8">
        <div className="h-3 w-24 rounded bg-surface-sunken" />
        <div className="mt-4 h-9 w-56 rounded bg-surface-sunken" />
        <div className="mt-3 h-4 max-w-xl rounded bg-surface-sunken" />
      </div>
      <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-3">
        {[0, 1, 2].map((item) => (
          <div key={item} className="h-32 rounded-lg border border-border-default/10 bg-surface-elevated" />
        ))}
      </div>
      <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(300px,0.75fr)]">
        <div className="h-80 rounded-lg border border-border-default/10 bg-surface-elevated" />
        <div className="h-80 rounded-lg border border-border-default/10 bg-surface-elevated" />
      </div>
      <span className="sr-only">Memuat data dashboard…</span>
    </div>
  )
}
