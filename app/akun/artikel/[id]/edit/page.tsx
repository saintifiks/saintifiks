// Halaman edit artikel opinions — Server Component wrapper
// Ambil data artikel dari DB, render editor dengan data awal

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import OpinionEditorPage from '@/components/opinions/editor/OpinionEditorPage'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: { id: string }
}

export default async function EditArtikelPage({ params }: PageProps) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/auth/callback?next=/akun/artikel/${params.id}/edit`)
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle()

  // Ambil artikel — pastikan milik user ini
  const { data: article } = await supabase
    .from('opinion_articles')
    .select('id, title, content, excerpt, cover_image_url, status, slug_locked')
    .eq('id', params.id)
    .eq('author_id', user.id)
    .maybeSingle()

  if (!article) notFound()

  // Ambil chart configs
  const { data: charts } = await supabase
    .from('opinion_article_charts')
    .select('chart_id, config')
    .eq('opinion_article_id', params.id)

  return (
    <OpinionEditorPage
      hasProfile={!!profile}
      mode="edit"
      articleId={article.id}
      initialTitle={article.title}
      initialContent={article.content}
      initialExcerpt={article.excerpt ?? ''}
      initialCoverImageUrl={article.cover_image_url ?? ''}
      initialStatus={article.status as 'draft' | 'published' | 'hidden'}
      initialCharts={(charts ?? []).map((c) => ({
        chart_id: c.chart_id,
        config: c.config as object,
      }))}
      slugLocked={article.slug_locked}
    />
  )
}
