// Ringkasan Akun — angka singkat milik pembaca, lanjutan menulis, dan bacaan tersimpan terakhir. Bagian lain
// (Tulisan, Aktivitas, Profil, Pengaturan) punya halamannya sendiri.

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui'
import NextLink from 'next/link'
import UiLink from '@/components/ui/Link'
import { formatTanggalPendek } from '@/lib/format-date'

export const metadata: Metadata = { title: 'Akun — Saintifiks', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

function Section({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="border-t border-border-default/20 py-10 first:border-t-0 first:pt-0">
      <div className="mb-6 flex items-baseline justify-between gap-4">
        <h2 className="font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">{title}</h2>
        {action}
      </div>
      {children}
    </section>
  )
}

function Stat({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <NextLink href={href} className="group block border-l border-border-default/20 pl-4 transition-colors duration-fast hover:border-text-primary">
      <p className="font-mono text-display-sm tabular-nums text-text-primary">{value.toLocaleString('id-ID')}</p>
      <p className="mt-1 font-interface text-caption text-text-secondary group-hover:text-text-primary">{label}</p>
    </NextLink>
  )
}

export default async function AkunPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/masuk?next=/akun')

  const count = { count: 'exact', head: true } as const
  const [profileRes, published, drafts, saved, articleComments, opinionComments, lastDraft, lastSaved] = await Promise.all([
    supabase.from('user_profiles').select('username').eq('user_id', user.id).maybeSingle(),
    supabase.from('opinion_articles').select('id', count).eq('author_id', user.id).eq('status', 'published'),
    supabase.from('opinion_articles').select('id', count).eq('author_id', user.id).eq('status', 'draft'),
    supabase.from('bookmarks').select('article_id', count).eq('user_id', user.id),
    supabase.from('comments').select('id', count).eq('user_id', user.id),
    supabase.from('opinion_comments').select('id', count).eq('user_id', user.id),
    supabase
      .from('opinion_articles')
      .select('id, title, updated_at')
      .eq('author_id', user.id)
      .eq('status', 'draft')
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
    supabase
      .from('bookmarks')
      .select('article_id, created_at, articles(title, slug)')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(3),
  ])

  const profile = profileRes.data
  const savedRows = ((lastSaved.data ?? []) as unknown as {
    article_id: string
    created_at: string
    articles: { title: string; slug: string } | null
  }[]).filter((r) => r.articles)

  return (
    <div>
      <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
        <Stat label="Tulisan terbit" value={published.count ?? 0} href="/akun/tulisan?status=published" />
        <Stat label="Draf" value={drafts.count ?? 0} href="/akun/tulisan?status=draft" />
        <Stat label="Tersimpan" value={saved.count ?? 0} href="/akun/bacaan" />
        <Stat label="Komentar" value={(articleComments.count ?? 0) + (opinionComments.count ?? 0)} href="/akun/aktivitas" />
      </div>

      <div className="mt-14">
        <Section
          title="Menulis"
          action={
            profile ? (
              <UiLink href="/akun/tulisan" variant="muted">
                Semua tulisan
              </UiLink>
            ) : undefined
          }
        >
          {!profile ? (
            <div className="max-w-xl">
              <p className="font-display text-body-base leading-relaxed text-text-secondary">
                Argumen adalah ruang pembaca untuk menulis analisis dan pendapat. Untuk mulai, Anda perlu nama pengguna yang
                tampil di tulisan.
              </p>
              <NextLink href="/akun/tulis" className="mt-6 inline-block">
                <Button>Mulai menulis</Button>
              </NextLink>
            </div>
          ) : lastDraft.data ? (
            <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
              <div className="min-w-0">
                <p className="font-mono text-caption text-text-tertiary">Draf terakhir · diubah {formatTanggalPendek(lastDraft.data.updated_at)}</p>
                <p className="mt-1 truncate font-display text-lg text-text-primary">{lastDraft.data.title}</p>
              </div>
              <div className="flex items-center gap-6">
                <NextLink href={`/akun/artikel/${lastDraft.data.id}/edit`}>
                  <Button size="sm">Lanjutkan menulis</Button>
                </NextLink>
                <UiLink href="/akun/tulis" variant="muted">
                  Tulisan baru
                </UiLink>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-display text-body-base text-text-secondary">Tidak ada draf. Mulai tulisan baru kapan saja.</p>
              <NextLink href="/akun/tulis">
                <Button size="sm">Tulis artikel baru</Button>
              </NextLink>
            </div>
          )}
        </Section>

        <Section
          title="Disimpan terakhir"
          action={
            savedRows.length > 0 ? (
              <UiLink href="/akun/bacaan" variant="muted">
                Buka Daftar Bacaan
              </UiLink>
            ) : undefined
          }
        >
          {savedRows.length === 0 ? (
            <p className="font-display text-body-base italic text-text-secondary">
              Belum ada artikel tersimpan. Pilih tanda simpan di bilah aksi artikel untuk menyimpannya di sini.
            </p>
          ) : (
            <ul className="divide-y divide-border-default/15 border-y border-border-default/15">
              {savedRows.map((r) => (
                <li key={r.article_id} className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1 py-4">
                  <NextLink
                    href={`/artikel/${r.articles!.slug}`}
                    className="min-w-0 font-display text-lg text-text-primary underline decoration-transparent decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast hover:decoration-text-primary"
                  >
                    {r.articles!.title}
                  </NextLink>
                  <span className="font-mono text-caption text-text-tertiary">Disimpan {formatTanggalPendek(r.created_at)}</span>
                </li>
              ))}
            </ul>
          )}
        </Section>
      </div>
    </div>
  )
}
