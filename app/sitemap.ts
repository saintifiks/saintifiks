import { createClient } from '@/lib/supabase/server'
import { MetadataRoute } from 'next'

// Revalidate setiap 24 jam (86400 detik)
export const revalidate = 86400

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://saintifiks.vercel.app'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/login`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/akun`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ]

  // Fetch published articles
  const supabase = await createClient()
  const { data: articles, error } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })

  if (error) {
    console.error('[Sitemap] Error fetching articles:', error)
    return staticPages
  }

  const articleUrls: MetadataRoute.Sitemap = (articles || []).map((article) => ({
    url: `${baseUrl}/artikel/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Fetch published opinions articles
  const { data: opinions, error: opinionsError } = await supabase
    .from('opinion_articles')
    .select('slug, updated_at, author_id')
    .eq('status', 'published')
    .order('updated_at', { ascending: false })

  if (opinionsError) {
    console.error('[Sitemap] Error fetching opinions:', opinionsError)
    return [...staticPages, ...articleUrls]
  }

  // Fetch profil penulis secara terpisah
  const sitemapProfileMap: Record<string, string> = {}
  if (opinions && opinions.length > 0) {
    const authorIds = Array.from(new Set(opinions.map((o) => o.author_id).filter(Boolean)))
    const { data: profiles } = await supabase
      .from('user_profiles')
      .select('user_id, username')
      .in('user_id', authorIds)
    if (profiles) {
      for (const p of profiles) {
        sitemapProfileMap[p.user_id] = p.username
      }
    }
  }

  const opinionUrls: MetadataRoute.Sitemap = (opinions || [])
    .filter((o) => sitemapProfileMap[o.author_id])
    .map((o) => {
      const username = sitemapProfileMap[o.author_id]
      return {
        url: `${baseUrl}/opinions/${username}/${o.slug}`,
        lastModified: new Date(o.updated_at),
        changeFrequency: 'weekly' as const,
        priority: 0.7,
      }
    })

  return [...staticPages, ...articleUrls, ...opinionUrls]
}
