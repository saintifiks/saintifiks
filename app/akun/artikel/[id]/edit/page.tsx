// Halaman edit artikel opinions — Server Component wrapper
// Ambil data artikel dari DB, render editor dengan data awal

import { createClient } from '@/lib/supabase/server'
import { redirect, notFound } from 'next/navigation'
import OpinionEditorPage from '@/components/opinions/editor/OpinionEditorPage'
import { opinionDocumentFor } from '@/lib/opinions/studio-document'

export const dynamic = 'force-dynamic'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function EditArtikelPage(props: PageProps) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect(`/masuk?next=${encodeURIComponent(`/akun/artikel/${params.id}/edit`)}`)
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('username')
    .eq('user_id', user.id)
    .maybeSingle()

  // Ambil artikel — pastikan milik user ini
  const { data: article } = await supabase
    .from('opinion_articles')
    .select('id, title, content, studio_document, excerpt, cover_image_url, status, slug_locked')
    .eq('id', params.id)
    .eq('author_id', user.id)
    .maybeSingle()

  if (!article) notFound()

  return (
    <OpinionEditorPage
      hasProfile={!!profile}
      authorUsername={profile?.username}
      mode="edit"
      articleId={article.id}
      initialTitle={article.title}
      authorUserId={user.id}
      initialDocument={opinionDocumentFor(article)}
      initialExcerpt={article.excerpt ?? ''}
      initialCoverImageUrl={article.cover_image_url ?? ''}
      initialStatus={article.status as 'draft' | 'published' | 'hidden'}
      slugLocked={article.slug_locked}
    />
  )
}
