// Daftar Bacaan — artikel yang disimpan pembaca untuk dibaca nanti. Hanya milik pemiliknya (RLS di tabel bookmarks).

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import NextLink from 'next/link'
import { createClient } from '@/lib/supabase/server'
import UiLink from '@/components/ui/Link'
import RemoveBookmarkButton from '@/components/artikel/RemoveBookmarkButton'
import { formatTanggalPendek } from '@/lib/format-date'

export const metadata: Metadata = { title: 'Daftar Bacaan — Saintifiks', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

type Row = {
  article_id: string
  created_at: string
  articles: { title: string; slug: string; excerpt: string | null; published_at: string | null } | null
}

export default async function BacaanPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/masuk?next=/akun/bacaan')

  const { data } = await supabase
    .from('bookmarks')
    .select('article_id, created_at, articles(title, slug, excerpt, published_at)')
    .order('created_at', { ascending: false })
    .limit(200)

  // Artikel yang ditarik dari terbitan tidak lagi terbaca oleh RLS; barisnya dilewati.
  const rows = ((data ?? []) as unknown as Row[]).filter((r) => r.articles)

  return (
    <div>
        <h2 className="font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">Daftar Bacaan</h2>
        <p className="mt-2 font-mono text-caption text-text-tertiary">{rows.length} artikel tersimpan</p>

        {rows.length === 0 ? (
          <div className="mt-12 max-w-md">
            <p className="font-display text-body-base italic leading-relaxed text-text-secondary">
              Belum ada artikel tersimpan. Pilih tanda simpan di bilah aksi artikel untuk menyimpannya di sini.
            </p>
            <UiLink href="/" variant="muted" className="mt-6 inline-block">
              Kembali ke Beranda
            </UiLink>
          </div>
        ) : (
          <ul className="mt-10 divide-y divide-border-default/15 border-y border-border-default/15">
            {rows.map((r) => {
              const a = r.articles!
              const tanggal = formatTanggalPendek(a.published_at)
              return (
                <li key={r.article_id} className="group flex items-start gap-6 py-6">
                  <NextLink href={`/artikel/${a.slug}`} className="block min-w-0 flex-1">
                    <h2 className="font-display text-xl leading-snug text-text-primary underline decoration-transparent decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast group-hover:decoration-text-primary">
                      {a.title}
                    </h2>
                    {a.excerpt && (
                      <p className="mt-2 line-clamp-2 font-display text-body-sm italic leading-relaxed text-text-secondary">
                        {a.excerpt}
                      </p>
                    )}
                    <p className="mt-3 font-mono text-caption text-text-tertiary">
                      {tanggal ? `Terbit ${tanggal} · ` : ''}Disimpan {formatTanggalPendek(r.created_at)}
                    </p>
                  </NextLink>
                  <RemoveBookmarkButton articleId={r.article_id} />
                </li>
              )
            })}
          </ul>
        )}
    </div>
  )
}
