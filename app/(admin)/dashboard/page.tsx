import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { getPendingCounts } from '@/lib/admin-pending'
import PageHeader from '@/components/admin/PageHeader'
import { formatTanggalPendek } from '@/lib/format-date'

export const dynamic = 'force-dynamic'

type Article = {
  id: string
  title: string
  is_published: boolean
  published_at: string | null
  created_at: string
}

const sectionTitle = 'font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary'
const rowLink =
  'underline decoration-border-default/40 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast group-hover:decoration-text-primary'

export default async function DashboardPage() {
  const supabase = await createClient()
  const [{ data: articles, error }, pending] = await Promise.all([
    supabase
      .from('articles')
      .select('id, title, is_published, published_at, created_at')
      .order('created_at', { ascending: false }),
    getPendingCounts(),
  ])

  const daftarArtikel: Article[] = articles ?? []
  const drafts = daftarArtikel.filter((article) => !article.is_published)
  const published = daftarArtikel.filter((article) => article.is_published)

  // Antrean "perlu dikerjakan": hal yang menunggu keputusan manusia, urut dari yang paling mendesak.
  const queue = [
    {
      href: '/dashboard/koreksi',
      label: 'Usulan koreksi',
      note: 'Dari pembaca. Yang disetujui tampil terbuka di artikel.',
      count: pending['/dashboard/koreksi'] ?? 0,
    },
    {
      href: '/dashboard/opinions',
      label: 'Laporan Argumen',
      note: 'Tulisan pembaca yang dilaporkan melanggar pedoman.',
      count: pending['/dashboard/opinions'] ?? 0,
    },
    {
      href: '/dashboard/artikel',
      label: 'Draf artikel',
      note: 'Belum diterbitkan.',
      count: drafts.length,
    },
  ]

  return (
    <main aria-labelledby="dashboard-title">
      <PageHeader
        titleId="dashboard-title"
        eyebrow="Ruang kerja"
        title="Beranda"
        description="Yang menunggu keputusan Anda hari ini, lalu pekerjaan editorial yang bisa dilanjutkan."
      />

      {error && (
        <p role="alert" className="mb-8 border-l border-signal-danger pl-4 font-interface text-sm text-signal-danger">
          Data artikel belum dapat dimuat. Coba muat ulang halaman.
        </p>
      )}

      <section aria-labelledby="queue-heading">
        <h2 id="queue-heading" className={`mb-4 ${sectionTitle}`}>
          Perlu dikerjakan
        </h2>
        <ul className="divide-y divide-border-default/20 border-y border-border-default/20">
          {queue.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="group flex items-center justify-between gap-6 py-5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-interactive-primary">
                <div className="min-w-0">
                  <p className={`font-display text-lg text-text-primary ${rowLink}`}>{item.label}</p>
                  <p className="mt-1 font-display text-body-sm italic text-text-secondary">{item.note}</p>
                </div>
                <p
                  className={[
                    'shrink-0 font-mono text-display-sm tabular-nums',
                    item.count > 0 ? 'text-text-primary' : 'text-text-tertiary',
                  ].join(' ')}
                  aria-label={`${item.count} menunggu`}
                >
                  {item.count}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-14 grid gap-12 lg:grid-cols-2">
        <section aria-labelledby="draft-heading">
          <h2 id="draft-heading" className={`mb-4 ${sectionTitle}`}>
            Lanjutkan draf
          </h2>
          {drafts.length === 0 ? (
            <p className="py-4 font-display text-body-base italic text-text-secondary">
              Tidak ada draf tertunda. Semua artikel sudah diterbitkan.
            </p>
          ) : (
            <ul className="divide-y divide-border-default/15 border-y border-border-default/15">
              {drafts.slice(0, 5).map((article) => (
                <li key={article.id}>
                  <Link
                    href={`/dashboard/artikel/${article.id}/edit`}
                    className="group block py-4 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-interactive-primary"
                  >
                    <p className={`truncate font-display text-base text-text-primary ${rowLink}`}>{article.title}</p>
                    <p className="mt-1 font-mono text-caption text-text-tertiary">
                      Dibuat {formatTanggalPendek(article.created_at)}
                    </p>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {drafts.length > 5 && (
            <Link href="/dashboard/artikel" className="mt-4 inline-block font-interface text-sm text-text-secondary underline decoration-border-default/40 decoration-1 underline-offset-[6px] hover:text-text-primary hover:decoration-text-primary">
              Semua draf ({drafts.length})
            </Link>
          )}
        </section>

        <section aria-labelledby="recent-heading">
          <h2 id="recent-heading" className={`mb-4 ${sectionTitle}`}>
            Baru terbit
          </h2>
          {published.length === 0 ? (
            <p className="py-4 font-display text-body-base italic text-text-secondary">Belum ada artikel terbit.</p>
          ) : (
            <ul className="divide-y divide-border-default/15 border-y border-border-default/15">
              {published.slice(0, 5).map((article) => (
                <li key={article.id} className="py-4">
                  <p className="truncate font-display text-base text-text-primary">{article.title}</p>
                  <p className="mt-1 font-mono text-caption text-text-tertiary">
                    Terbit {formatTanggalPendek(article.published_at ?? article.created_at)}
                  </p>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-4 font-mono text-caption text-text-tertiary">
            {daftarArtikel.length} artikel · {published.length} terbit · {drafts.length} draf
          </p>
        </section>
      </div>
    </main>
  )
}
