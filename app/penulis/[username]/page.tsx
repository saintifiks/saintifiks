// Halaman profil publik penulis — Server Component
// URL: /penulis/[username]

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import ArgumenRow from '@/components/opinions/ArgumenRow'
import { Avatar, Badge } from '@/components/ui'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ username: string }>
}

export async function generateMetadata(props: PageProps): Promise<Metadata> {
  const params = await props.params;
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, bio')
    .eq('username', params.username)
    .maybeSingle()

  if (!profile) return { title: 'Penulis — Saintifiks' }

  return {
    title: `${profile.display_name} — Penulis Argumen di Saintifiks`,
    description: profile.bio ?? `Baca tulisan Argumen dari ${profile.display_name} di Saintifiks.`,
    openGraph: {
      title: `${profile.display_name} — Penulis Argumen di Saintifiks`,
      description: profile.bio ?? undefined,
      siteName: 'Saintifiks',
    },
  }
}

export default async function PenulisPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient()

  // Ambil profil publik — hanya kolom yang aman (tidak expose user_id ke HTML)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id, username, display_name, bio, avatar_url, created_at')
    .eq('username', params.username)
    .maybeSingle()

  if (!profile) notFound()

  // Ambil tulisan published milik penulis ini
  const { data: articles } = await supabase
    .from('opinion_articles')
    .select('id, title, slug, excerpt, cover_image_url, published_at')
    .eq('author_id', profile.user_id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  const items = articles ?? []

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="mx-auto max-w-3xl px-5 pb-24 pt-10 md:px-8 md:pt-16">
        <header className="flex items-start gap-5 border-b border-border-default/20 pb-10">
          <Avatar name={profile.display_name} src={profile.avatar_url} size="lg" />
          <div className="min-w-0">
            <Badge variant="kicker">Penulis Argumen</Badge>
            <h1 className="mt-3 font-display text-display-sm leading-tight text-text-primary">{profile.display_name}</h1>
            <p className="mt-1 font-mono text-caption text-text-tertiary">@{profile.username}</p>
            {profile.bio && (
              <p className="mt-4 max-w-xl font-display text-body-sm italic leading-relaxed text-text-secondary">
                {profile.bio}
              </p>
            )}
          </div>
        </header>

        <section aria-label={`Tulisan ${profile.display_name}`} className="pt-8">
          {items.length === 0 ? (
            <p className="py-8 font-display text-body-base italic text-text-secondary">
              Belum ada tulisan yang diterbitkan.
            </p>
          ) : (
            items.map((item) => (
              <ArgumenRow
                key={item.id}
                title={item.title}
                slug={item.slug}
                username={profile.username}
                displayName={profile.display_name}
                excerpt={item.excerpt}
                coverImageUrl={item.cover_image_url}
                publishedAt={item.published_at}
                hideAuthor
              />
            ))
          )}
        </section>
      </div>
    </main>
  )
}
