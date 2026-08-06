import { requireAdmin } from '@/lib/admin-check'
import { createNewStudioArticle } from '@/lib/editorial-studio/article-loader'
import StudioLab from '@/components/editorial-studio/StudioLab'

export default async function ArtikelBaruPage({ searchParams }: { searchParams?: { draft?: string } }) {
  await requireAdmin()
  const requestedDraft = typeof searchParams?.draft === 'string' && /^doc-[A-Za-z0-9][A-Za-z0-9_-]{2,123}$/.test(searchParams.draft)
    ? searchParams.draft
    : undefined
  return <StudioLab initialDraft={createNewStudioArticle(requestedDraft)} production />
}
