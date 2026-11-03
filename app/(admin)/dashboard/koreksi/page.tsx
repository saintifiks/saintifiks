// Antrean koreksi — usulan koreksi pembaca (artikel dan Argumen) yang menunggu keputusan.
// Koreksi adalah pembeda kepercayaan Saintifiks: usulan yang disetujui tampil terbuka di artikel.

import type { Metadata } from 'next'
import { requireAdmin } from '@/lib/admin-check'
import { createAdminClient } from '@/lib/supabase/admin'
import PageHeader from '@/components/admin/PageHeader'
import KoreksiQueue, { type KoreksiItem } from '@/components/admin/KoreksiQueue'
import { formatTanggalPendek } from '@/lib/format-date'

export const metadata: Metadata = { title: 'Koreksi — Admin Saintifiks', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type ArticleRef = { title: string; slug: string } | null
type OpinionRef = {
  title: string
  slug: string
  user_profiles: { username: string } | { username: string }[] | null
} | null

const one = <T,>(v: T | T[] | null): T | null => (Array.isArray(v) ? (v[0] ?? null) : v)

export default async function KoreksiPage() {
  await requireAdmin()
  const admin = createAdminClient()

  const [articleRes, opinionRes, reviewedArticle, reviewedOpinion] = await Promise.all([
    admin
      .from('article_corrections')
      .select('id, original_text, corrected_text, explanation, created_at, articles(title, slug)')
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    admin
      .from('opinion_corrections')
      .select(
        'id, original_text, corrected_text, explanation, created_at, opinion_articles(title, slug, user_profiles!opinion_articles_author_id_fkey(username))'
      )
      .eq('status', 'pending')
      .order('created_at', { ascending: true }),
    admin
      .from('article_corrections')
      .select('id, status, created_at, original_text, articles(title)')
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
    admin
      .from('opinion_corrections')
      .select('id, status, created_at, original_text, opinion_articles(title)')
      .neq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(10),
  ])

  const items: KoreksiItem[] = [
    ...(articleRes.data ?? []).map((c) => {
      const a = one(c.articles as unknown as ArticleRef | ArticleRef[])
      return {
        key: `article-${c.id}`,
        kind: 'article' as const,
        id: c.id,
        title: a?.title ?? 'Artikel dihapus',
        href: a ? `/artikel/${a.slug}` : null,
        original: c.original_text,
        corrected: c.corrected_text,
        explanation: c.explanation,
        createdAt: c.created_at,
      }
    }),
    ...(opinionRes.data ?? []).map((c) => {
      const o = one(c.opinion_articles as unknown as OpinionRef | OpinionRef[])
      const username = o ? one(o.user_profiles)?.username : null
      return {
        key: `opinion-${c.id}`,
        kind: 'opinion' as const,
        id: c.id,
        title: o?.title ?? 'Tulisan dihapus',
        href: o && username ? `/argumen/${username}/${o.slug}` : null,
        original: c.original_text,
        corrected: c.corrected_text,
        explanation: c.explanation,
        createdAt: c.created_at,
      }
    }),
  ].sort((a, b) => a.createdAt.localeCompare(b.createdAt))

  const reviewed = [
    ...(reviewedArticle.data ?? []).map((c) => ({
      id: `a-${c.id}`,
      status: c.status as string,
      createdAt: c.created_at as string,
      title: one(c.articles as unknown as { title: string } | { title: string }[] | null)?.title ?? 'Artikel dihapus',
      text: c.original_text as string,
    })),
    ...(reviewedOpinion.data ?? []).map((c) => ({
      id: `o-${c.id}`,
      status: c.status as string,
      createdAt: c.created_at as string,
      title:
        one(c.opinion_articles as unknown as { title: string } | { title: string }[] | null)?.title ??
        'Tulisan dihapus',
      text: c.original_text as string,
    })),
  ]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 10)

  const failed = articleRes.error || opinionRes.error

  return (
    <main aria-labelledby="koreksi-title">
      <PageHeader
        titleId="koreksi-title"
        eyebrow="Konten"
        title="Koreksi"
        description="Usulan koreksi dari pembaca. Yang disetujui tampil terbuka di artikel, bersama teks asli yang dikoreksi."
      />

      {failed && (
        <p role="alert" className="mb-8 border-l border-signal-danger pl-4 font-interface text-sm text-signal-danger">
          Sebagian data belum dapat dimuat. Muat ulang halaman.
        </p>
      )}

      <section aria-labelledby="menunggu-heading">
        <h2
          id="menunggu-heading"
          className="mb-4 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary"
        >
          Menunggu · {items.length}
        </h2>
        <KoreksiQueue items={items} />
      </section>

      {reviewed.length > 0 && (
        <section aria-labelledby="ditinjau-heading" className="mt-14">
          <h2
            id="ditinjau-heading"
            className="mb-4 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary"
          >
            Baru ditinjau
          </h2>
          <ul className="divide-y divide-border-default/15 border-y border-border-default/15">
            {reviewed.map((r) => (
              <li key={r.id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-base text-text-primary">{r.title}</p>
                  <p className="truncate font-display text-body-sm italic text-text-tertiary">{r.text}</p>
                </div>
                <p className="font-mono text-caption text-text-tertiary">
                  {r.status === 'approved' ? 'Disetujui' : 'Ditolak'} · usulan {formatTanggalPendek(r.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
