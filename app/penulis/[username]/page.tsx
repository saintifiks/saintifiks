// Halaman profil publik penulis — Server Component
// URL: /penulis/[username]

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import OpinionCard from '@/components/opinions/OpinionCard'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { username: string }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient()
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('display_name, bio')
    .eq('username', params.username)
    .maybeSingle()

  if (!profile) return { title: 'Penulis — Saintifiks' }

  return {
    title: `${profile.display_name} — Penulis di Saintifiks Opinions`,
    description: profile.bio ?? `Baca artikel opinions dari ${profile.display_name} di Saintifiks.`,
    openGraph: {
      title: `${profile.display_name} — Penulis di Saintifiks Opinions`,
      description: profile.bio ?? undefined,
      siteName: 'Saintifiks',
    },
  }
}

export default async function PenulisPage({ params }: PageProps) {
  const supabase = await createClient()

  // Ambil profil publik — hanya kolom yang aman (tidak expose user_id ke HTML)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('user_id, username, display_name, bio, avatar_url, created_at')
    .eq('username', params.username)
    .maybeSingle()

  if (!profile) notFound()

  // Ambil artikel published milik penulis ini
  const { data: articles } = await supabase
    .from('opinion_articles')
    .select(`
      id,
      title,
      slug,
      excerpt,
      cover_image_url,
      published_at,
      opinion_likes(count)
    `)
    .eq('author_id', profile.user_id)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .limit(20)

  const items = (articles ?? []).map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    excerpt: a.excerpt,
    cover_image_url: a.cover_image_url,
    published_at: a.published_at,
    like_count: Array.isArray(a.opinion_likes)
      ? (a.opinion_likes[0] as { count: number })?.count ?? 0
      : 0,
  }))

  return (
    <main className="min-h-screen bg-primary-light">
      <div className="max-w-2xl mx-auto px-6 py-16">

        {/* Profil penulis */}
        <div className="mb-12 pb-10 border-b border-primary-dark/10">
          <div className="flex items-start gap-5">

            {/* Avatar */}
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.display_name}
                width={72}
                height={72}
                className="rounded-full border border-primary-dark/10 object-cover flex-shrink-0"
              />
            ) : (
              <div className="w-18 h-18 w-[72px] h-[72px] rounded-full bg-primary-dark flex items-center justify-center flex-shrink-0">
                <span className="font-libre text-2xl font-bold text-primary-light">
                  {profile.display_name.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            {/* Info */}
            <div>
              <h1 className="font-libre text-2xl font-bold text-primary-dark leading-tight">
                {profile.display_name}
              </h1>
              <p className="font-helvetica text-sm text-primary-dark/40 mt-0.5">
                @{profile.username}
              </p>
              {profile.bio && (
                <p className="font-helvetica text-sm text-primary-dark/70 leading-relaxed mt-3 max-w-lg">
                  {profile.bio}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Daftar artikel */}
        <div>
          <h2 className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mb-6">
            Artikel dari {profile.display_name}
          </h2>

          {items.length === 0 ? (
            <div className="py-16 text-center border border-primary-dark/10">
              <p className="font-helvetica text-sm text-primary-dark/40">
                Belum ada artikel yang diterbitkan.
              </p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <OpinionCard
                  key={item.id}
                  title={item.title}
                  slug={item.slug}
                  username={profile.username}
                  displayName={profile.display_name}
                  avatarUrl={profile.avatar_url}
                  excerpt={item.excerpt}
                  coverImageUrl={item.cover_image_url}
                  publishedAt={item.published_at!}
                  likeCount={item.like_count}
                />
              ))}
            </div>
          )}
        </div>

      </div>
    </main>
  )
}
