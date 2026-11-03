// Argumen — daftar tulisan pembaca. force-dynamic: tulisan baru dan yang disembunyikan moderator harus langsung terlihat.

import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import ArgumenRow from '@/components/opinions/ArgumenRow'
import Link from '@/components/ui/Link'
import { Badge, Button } from '@/components/ui'
import NextLink from 'next/link'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Argumen — Saintifiks',
  description: 'Perspektif dan analisis dari pembaca Saintifiks.',
  openGraph: {
    title: 'Argumen — Saintifiks',
    description: 'Perspektif dan analisis dari pembaca Saintifiks.',
    siteName: 'Saintifiks',
  },
}

const PAGE_SIZE = 20

type Profile = { username: string; display_name: string }

export default async function ArgumenPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams
  const supabase = await createClient()
  const page = Math.max(1, parseInt(searchParams?.page ?? '1', 10) || 1)
  const from = (page - 1) * PAGE_SIZE

  const { data: articles, count, error } = await supabase
    .from('opinion_articles')
    .select('id, title, slug, excerpt, cover_image_url, published_at, author_id', { count: 'exact' })
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(from, from + PAGE_SIZE - 1)
  if (error) console.error('[argumen/page] Error:', error.message)

  const profileMap: Record<string, Profile> = {}
  if (articles && articles.length > 0) {
    const authorIds = Array.from(new Set(articles.map((a) => a.author_id).filter(Boolean)))
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, username, display_name')
      .in('user_id', authorIds)
    for (const p of profiles ?? []) profileMap[p.user_id] = { username: p.username, display_name: p.display_name }
  }

  // Tulisan tanpa profil penulis tidak punya alamat yang bisa dibuka; dilewati.
  const items = (articles ?? []).filter((a) => profileMap[a.author_id])
  const totalPages = count ? Math.ceil(count / PAGE_SIZE) : 1
  const hasNext = page < totalPages

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8 md:pt-16">
        <header className="border-b border-border-default/20 pb-10">
          <Badge variant="kicker">Argumen</Badge>
          <h1 className="mt-4 font-display text-display-sm leading-[1.12] tracking-[-0.01em] text-text-primary md:text-display-base">
            Perspektif dari pembaca Saintifiks
          </h1>
          <p className="mt-5 max-w-xl font-display text-body-sm italic leading-relaxed text-text-secondary sm:text-body-base">
            Pendapat pribadi penulisnya, bukan posisi redaksi. Setiap tulisan dapat disukai, dikomentari, dikoreksi, dan
            dilaporkan.
          </p>
          <NextLink href="/akun/tulis" className="mt-8 inline-block">
            <Button size="sm">Tulis Argumen</Button>
          </NextLink>
        </header>

        {items.length === 0 ? (
          <div className="py-16">
            <p className="font-display text-body-base italic text-text-secondary">
              Belum ada tulisan Argumen yang terbit. Jadilah yang pertama.
            </p>
          </div>
        ) : (
          <div className="pt-8">
            {items.map((a) => {
              const profile = profileMap[a.author_id]
              return (
                <ArgumenRow
                  key={a.id}
                  title={a.title}
                  slug={a.slug}
                  username={profile.username}
                  displayName={profile.display_name}
                  excerpt={a.excerpt}
                  coverImageUrl={a.cover_image_url}
                  publishedAt={a.published_at}
                />
              )
            })}
          </div>
        )}

        {(page > 1 || hasNext) && (
          <nav className="mt-10 flex items-center justify-between border-t border-border-default/20 pt-6" aria-label="Navigasi halaman">
            {page > 1 ? (
              <Link href={`/argumen?page=${page - 1}`} variant="nav">
                Lebih baru
              </Link>
            ) : (
              <span />
            )}
            {hasNext && (
              <Link href={`/argumen?page=${page + 1}`} variant="nav">
                Lebih lama
              </Link>
            )}
          </nav>
        )}
      </div>
    </main>
  )
}
