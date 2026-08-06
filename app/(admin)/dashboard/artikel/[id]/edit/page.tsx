import { notFound } from 'next/navigation'
import { requireAdmin } from '@/lib/admin-check'
import { loadStudioArticle } from '@/lib/editorial-studio/article-loader'
import StudioLab from '@/components/editorial-studio/StudioLab'

export default async function EditArtikelPage({ params }: { params: { id: string } }) {
  await requireAdmin()
  const draft = await loadStudioArticle(params.id)
  if (!draft) notFound()
  return <StudioLab initialDraft={draft} production />
}
