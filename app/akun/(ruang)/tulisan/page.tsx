// Tulisan saya — semua tulisan Argumen milik pembaca, disaring menurut status, beserta analitik untuk yang terbit.

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import NextLink from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Badge, Button } from '@/components/ui'
import UiLink from '@/components/ui/Link'
import OpinionAnalyticsDashboard from '@/components/opinions/OpinionAnalyticsDashboard'
import DeleteDraftButton from '@/components/akun/DeleteDraftButton'
import { formatTanggalPendek } from '@/lib/format-date'

export const metadata: Metadata = { title: 'Tulisan Saya — Saintifiks', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

const statusVariant = { published: 'success', hidden: 'danger', draft: 'default' } as const
const statusLabel = { published: 'Diterbitkan', hidden: 'Disembunyikan', draft: 'Draf' } as const
const statusHint = {
  published: 'tampil di Argumen',
  hidden: 'disembunyikan moderator',
  draft: 'hanya Anda yang melihat',
} as const

type Status = keyof typeof statusVariant
type Filter = 'all' | Status

const filters: { value: Filter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'draft', label: 'Draf' },
  { value: 'published', label: 'Terbit' },
  { value: 'hidden', label: 'Disembunyikan' },
]

type Row = { id: string; title: string; slug: string; status: string; updated_at: string }

export default async function TulisanPage(props: { searchParams: Promise<{ status?: string }> }) {
  const sp = await props.searchParams
  const filter: Filter = filters.some((f) => f.value === sp.status) ? (sp.status as Filter) : 'all'

  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/masuk?next=/akun/tulisan')

  const { data: profile } = await supabase.from('user_profiles').select('username').eq('user_id', user.id).maybeSingle()

  if (!profile) {
    return (
      <div className="max-w-xl">
        <p className="font-display text-body-base leading-relaxed text-text-secondary">
          Argumen adalah ruang pembaca untuk menulis analisis dan pendapat. Untuk mulai, Anda perlu nama pengguna yang tampil
          di tulisan.
        </p>
        <NextLink href="/akun/tulis" className="mt-6 inline-block">
          <Button>Mulai menulis</Button>
        </NextLink>
      </div>
    )
  }

  const { data } = await supabase
    .from('opinion_articles')
    .select('id, title, slug, status, updated_at')
    .eq('author_id', user.id)
    .order('updated_at', { ascending: false })
  const all = (data ?? []) as Row[]
  const list = filter === 'all' ? all : all.filter((a) => a.status === filter)
  const counts = (s: Filter) => (s === 'all' ? all.length : all.filter((a) => a.status === s).length)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-4">
        <ul className="flex flex-wrap gap-x-6 gap-y-2" aria-label="Saring menurut status">
          {filters.map((f) => (
            <li key={f.value}>
              <NextLink
                href={f.value === 'all' ? '/akun/tulisan' : `/akun/tulisan?status=${f.value}`}
                aria-current={filter === f.value ? 'page' : undefined}
                className={[
                  'font-interface text-sm underline decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast',
                  filter === f.value
                    ? 'font-semibold text-text-primary decoration-text-primary'
                    : 'text-text-secondary decoration-transparent hover:text-text-primary hover:decoration-text-primary',
                ].join(' ')}
              >
                {f.label} <span className="font-mono text-caption text-text-tertiary">{counts(f.value)}</span>
              </NextLink>
            </li>
          ))}
        </ul>
        <NextLink href="/akun/tulis">
          <Button size="sm">Tulis artikel baru</Button>
        </NextLink>
      </div>

      {list.length === 0 ? (
        <p className="mt-10 font-display text-body-base italic text-text-secondary">
          {all.length === 0 ? 'Belum ada tulisan. Tulis yang pertama.' : 'Tidak ada tulisan dengan status ini.'}
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-border-default/15 border-y border-border-default/15">
          {list.map((a) => {
            const status = (a.status in statusVariant ? a.status : 'draft') as Status
            return (
              <li key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                <div className="min-w-0 flex-1">
                  <p className="truncate font-display text-lg text-text-primary">{a.title}</p>
                  <p className="mt-1 font-mono text-caption text-text-tertiary">
                    Diubah {formatTanggalPendek(a.updated_at)} · {statusHint[status]}
                  </p>
                </div>
                <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
                <div className="flex items-center gap-5">
                  <UiLink href={`/akun/artikel/${a.id}/edit`} variant="muted">
                    Ubah
                  </UiLink>
                  {status === 'published' && (
                    <UiLink href={`/argumen/${profile.username}/${a.slug}`} variant="muted">
                      Lihat
                    </UiLink>
                  )}
                  {status === 'draft' && <DeleteDraftButton articleId={a.id} title={a.title} />}
                </div>
              </li>
            )
          })}
        </ul>
      )}

      {all.some((a) => a.status === 'published') && (
        <div className="mt-14">
          <h2 className="mb-5 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
            Analitik
          </h2>
          <OpinionAnalyticsDashboard />
        </div>
      )}
    </div>
  )
}
