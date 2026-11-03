// Akun — halaman milik pembaca. Pembaca baru melihat akunnya dan ajakan menulis; penulis melihat artikel dan
// analitiknya. Nama pengguna (profil penulis) dibuat saat pertama kali menulis, bukan di gerbang masuk.

import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { Avatar, Badge, Button } from '@/components/ui'
import UiLink from '@/components/ui/Link'
import OpinionAnalyticsDashboard from '@/components/opinions/OpinionAnalyticsDashboard'
import SignOutButton from '@/components/auth/SignOutButton'
import { formatTanggalPendek } from '@/lib/format-date'

export const metadata: Metadata = { title: 'Akun — Saintifiks', robots: { index: false, follow: false } }
export const dynamic = 'force-dynamic'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="border-t border-border-default/20 py-10">
      <h2 className="mb-6 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
        {title}
      </h2>
      {children}
    </section>
  )
}

const statusVariant = { published: 'success', hidden: 'danger', draft: 'default' } as const
const statusLabel = { published: 'Diterbitkan', hidden: 'Disembunyikan', draft: 'Draf' } as const

type ArticleRow = { id: string; title: string; slug: string; status: string; updated_at: string }

export default async function AkunPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/masuk?next=/akun')

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username, display_name, bio, avatar_url')
    .eq('user_id', user.id)
    .maybeSingle()

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>
  const googleName = typeof meta.full_name === 'string' ? meta.full_name : typeof meta.name === 'string' ? meta.name : null
  const googleAvatar =
    typeof meta.avatar_url === 'string' ? meta.avatar_url : typeof meta.picture === 'string' ? meta.picture : null
  const name = profile?.display_name ?? googleName ?? 'Akun Saintifiks'
  const avatar = profile?.avatar_url ?? googleAvatar

  let list: ArticleRow[] = []
  if (profile) {
    const { data } = await supabase
      .from('opinion_articles')
      .select('id, title, slug, status, updated_at')
      .eq('author_id', user.id)
      .order('updated_at', { ascending: false })
    list = (data ?? []) as ArticleRow[]
  }

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-4xl px-5 pb-24 pt-10 lg:px-8 lg:pt-14">
        <header className="flex items-center gap-5">
          <Avatar name={name} src={avatar} size="lg" />
          <div className="min-w-0">
            <h1 className="truncate font-display text-display-sm leading-tight text-text-primary">{name}</h1>
            <p className="mt-1 truncate font-mono text-caption text-text-tertiary">
              {user.email}
              {profile && (
                <>
                  {' · '}
                  <UiLink href={`/penulis/${profile.username}`} variant="muted">
                    @{profile.username}
                  </UiLink>
                </>
              )}
            </p>
          </div>
        </header>

        <div className="mt-10">
          <Section title="Daftar Bacaan">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-display text-body-sm text-text-secondary">
                Artikel yang Anda simpan untuk dibaca nanti.
              </p>
              <UiLink href="/akun/bacaan" variant="muted">
                Buka Daftar Bacaan
              </UiLink>
            </div>
          </Section>

          <Section title="Menulis">
            {!profile ? (
              <div className="max-w-xl">
                <p className="font-display text-body-base leading-relaxed text-text-secondary">
                  Argumen adalah ruang pembaca untuk menulis analisis dan pendapat. Untuk mulai, Anda perlu nama penulis
                  yang tampil di artikel.
                </p>
                <Link href="/akun/tulis" className="mt-6 inline-block">
                  <Button>Mulai menulis</Button>
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6 flex items-center justify-between gap-4">
                  <p className="font-mono text-caption text-text-tertiary">{list.length} artikel</p>
                  <Link href="/akun/tulis">
                    <Button size="sm">Tulis artikel baru</Button>
                  </Link>
                </div>

                {list.length === 0 ? (
                  <p className="font-display text-body-base italic text-text-secondary">
                    Belum ada artikel. Tulis yang pertama.
                  </p>
                ) : (
                  <ul className="divide-y divide-border-default/15 border-y border-border-default/15">
                    {list.map((a) => {
                      const status = (a.status in statusVariant ? a.status : 'draft') as keyof typeof statusVariant
                      return (
                        <li key={a.id} className="flex flex-wrap items-center gap-x-6 gap-y-2 py-4">
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-display text-lg text-text-primary">{a.title}</p>
                            <p className="mt-1 font-mono text-caption text-text-tertiary">
                              Diubah {formatTanggalPendek(a.updated_at)}
                            </p>
                          </div>
                          <Badge variant={statusVariant[status]}>{statusLabel[status]}</Badge>
                          <div className="flex items-center gap-5">
                            <UiLink href={`/akun/artikel/${a.id}/edit`} variant="muted">
                              Ubah
                            </UiLink>
                            {status === 'published' && (
                              <UiLink href={`/opinions/${profile.username}/${a.slug}`} variant="muted">
                                Lihat
                              </UiLink>
                            )}
                          </div>
                        </li>
                      )
                    })}
                  </ul>
                )}

                {list.some((a) => a.status === 'published') && (
                  <div className="mt-12">
                    <h3 className="mb-5 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
                      Analitik
                    </h3>
                    <OpinionAnalyticsDashboard />
                  </div>
                )}
              </>
            )}
          </Section>

          <Section title="Pengaturan">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <p className="font-display text-body-sm text-text-secondary">
                Masuk dengan Google sebagai <span className="text-text-primary">{user.email}</span>.
              </p>
              <SignOutButton />
            </div>
          </Section>
        </div>
      </div>
    </main>
  )
}
