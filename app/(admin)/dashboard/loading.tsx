export default function DashboardLoading() {
  return (
    <div role="status" aria-label="Memuat halaman admin" className="animate-pulse">
      <div className="border-b border-border-default/20 pb-8">
        <div className="h-3 w-24 bg-border-default/15" />
        <div className="mt-4 h-9 w-56 bg-border-default/15" />
        <div className="mt-3 h-4 max-w-xl bg-border-default/10" />
      </div>
      <div className="mt-8 divide-y divide-border-default/15 border-y border-border-default/20">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="flex items-center justify-between gap-6 py-6">
            <div className="space-y-2">
              <div className="h-5 w-48 bg-border-default/15" />
              <div className="h-3 w-72 bg-border-default/10" />
            </div>
            <div className="h-6 w-8 bg-border-default/15" />
          </div>
        ))}
      </div>
      <span className="sr-only">Memuat data dashboard…</span>
    </div>
  )
}
