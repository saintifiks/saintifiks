// Aktivitas — jejak pembaca: komentar, suka, dan usulan koreksinya beserta statusnya. Semua dibaca lewat RLS
// (pembaca hanya melihat barisnya sendiri), dan tidak ada yang ditampilkan ke orang lain.

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { getKoreksiSaya } from '@/lib/akun/koreksi'
import UiLink from '@/components/ui/Link'
import { formatTanggalPendek } from '@/lib/format-date'

export const metadata: Metadata = { title: 'Aktivitas — Saintifiks', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const LIMIT = 20

type ArticleRef = { title: string; slug: string } | null
type OpinionRef = { title: string; slug: string; status: string; user_profiles: { username: string } | { username: string }[] | null } | null

const one = <T,>(v: T | T[] | null | undefined): T | null => (Array.isArray(v) ? (v[0] ?? null) : (v ?? null))

type Item = {
  key: string
  title: string
  href: string | null
  at: string
  body?: string
  note?: string
}

function opinionHref(o: OpinionRef): string | null {
  if (!o || o.status !== 'published') return null
  const username = one(o.user_profiles)?.username
  return username ? `/argumen/${username}/${o.slug}` : null
}

const correctionStatus: Record<string, string> = { pending: 'Menunggu tinjauan', approved: 'Disetujui', rejected: 'Ditolak' }

function Section({ title, empty, items }: { title: string; empty: string; items: Item[] }) {
  return (
    <section className="border-t border-border-default/20 py-10 first:border-t-0 first:pt-0">
      <h2 className="mb-6 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
        {title} <span className="font-mono text-caption normal-case tracking-normal text-text-tertiary">{items.length}</span>
      </h2>
      {items.length === 0 ? (
        <p className="font-display text-body-base italic text-text-secondary">{empty}</p>
      ) : (
        <ul className="divide-y divide-border-default/15 border-y border-border-default/15">
          {items.map((item) => (
            <li key={item.key} className="py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
                {item.href ? (
                  <UiLink href={item.href} variant="muted" className="font-display text-lg">
                    {item.title}
                  </UiLink>
                ) : (
                  <p className="font-display text-lg text-text-tertiary">{item.title}</p>
                )}
                <p className="font-mono text-caption text-text-tertiary">
                  {item.note ? `${item.note} · ` : ''}
                  {formatTanggalPendek(item.at)}
                </p>
              </div>
              {item.body && (
                <p className="mt-2 max-w-2xl border-l border-border-default pl-4 font-display text-body-sm italic leading-relaxed text-text-secondary">
                  {item.body}
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

export default async function AktivitasPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/masuk?next=/akun/aktivitas')

  const op = 'title, slug, status, user_profiles!opinion_articles_author_profile_fkey(username)'
  const [aComments, oComments, aLikes, oLikes, [aCorr, oCorr]] = await Promise.all([
    supabase.from('comments').select('id, content, created_at, articles(title, slug)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(LIMIT),
    supabase.from('opinion_comments').select(`id, content, created_at, opinion_articles(${op})`).eq('user_id', user.id).order('created_at', { ascending: false }).limit(LIMIT),
    supabase.from('likes').select('id, created_at, articles(title, slug)').eq('user_id', user.id).order('created_at', { ascending: false }).limit(LIMIT),
    supabase.from('opinion_likes').select(`id, created_at, opinion_articles(${op})`).eq('user_id', user.id).order('created_at', { ascending: false }).limit(LIMIT),
    getKoreksiSaya(user.id, LIMIT),
  ])

  const articleLink = (a: ArticleRef) => (a ? `/artikel/${a.slug}` : null)
  const newest = (items: Item[]) => items.sort((x, y) => y.at.localeCompare(x.at)).slice(0, LIMIT)

  const comments = newest([
    ...(aComments.data ?? []).map((c) => {
      const a = one(c.articles as unknown as ArticleRef | ArticleRef[])
      return { key: `a-${c.id}`, title: a?.title ?? 'Artikel tidak lagi tersedia', href: articleLink(a), at: c.created_at, body: c.content }
    }),
    ...(oComments.data ?? []).map((c) => {
      const o = one(c.opinion_articles as unknown as OpinionRef | OpinionRef[])
      return { key: `o-${c.id}`, title: o?.title ?? 'Tulisan tidak lagi tersedia', href: opinionHref(o), at: c.created_at, body: c.content, note: 'Argumen' }
    }),
  ])

  const likes = newest([
    ...(aLikes.data ?? []).map((l) => {
      const a = one(l.articles as unknown as ArticleRef | ArticleRef[])
      return { key: `a-${l.id}`, title: a?.title ?? 'Artikel tidak lagi tersedia', href: articleLink(a), at: l.created_at }
    }),
    ...(oLikes.data ?? []).map((l) => {
      const o = one(l.opinion_articles as unknown as OpinionRef | OpinionRef[])
      return { key: `o-${l.id}`, title: o?.title ?? 'Tulisan tidak lagi tersedia', href: opinionHref(o), at: l.created_at, note: 'Argumen' }
    }),
  ])

  const corrections = newest([
    ...(aCorr.data ?? []).map((c) => {
      const a = one(c.articles as unknown as ArticleRef | ArticleRef[])
      return { key: `a-${c.id}`, title: a?.title ?? 'Artikel tidak lagi tersedia', href: articleLink(a), at: c.created_at, body: c.original_text, note: correctionStatus[c.status] ?? c.status }
    }),
    ...(oCorr.data ?? []).map((c) => {
      const o = one(c.opinion_articles as unknown as OpinionRef | OpinionRef[])
      return { key: `o-${c.id}`, title: o?.title ?? 'Tulisan tidak lagi tersedia', href: opinionHref(o), at: c.created_at, body: c.original_text, note: `Argumen · ${correctionStatus[c.status] ?? c.status}` }
    }),
  ])

  return (
    <div>
      <p className="mb-10 max-w-xl font-display text-body-sm italic leading-relaxed text-text-secondary">
        Hanya Anda yang melihat halaman ini. Komentar dan suka tampil di artikelnya tanpa nama Anda.
      </p>
      <Section title="Usulan koreksi" empty="Belum ada usulan koreksi. Anda bisa mengusulkannya dari bawah artikel." items={corrections} />
      <Section title="Komentar" empty="Belum ada komentar." items={comments} />
      <Section title="Disukai" empty="Belum ada artikel yang Anda sukai." items={likes} />
    </div>
  )
}
