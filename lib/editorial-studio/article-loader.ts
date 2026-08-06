import 'server-only'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  createStudioDocument,
  migrateStudioDocument,
  type StudioArticleMetadata,
  type StudioDocument,
} from './document'
import { markdownToStudioDocument } from './markdown-adapter'

export type StudioArticleDraft = {
  title: string
  deck: string
  document: StudioDocument
  isPublished: boolean
  publishedAt: string | null
}

type ArticleRow = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  category: string | null
  kicker: string | null
  cover_illustrator: string | null
  country: string | null
  is_published: boolean
  published_at: string | null
}

function metadataFromArticle(article: ArticleRow): StudioArticleMetadata {
  return {
    kind: 'article',
    articleId: article.id,
    slug: article.slug.startsWith('draft-') ? '' : article.slug,
    coverImageUrl: article.cover_image_url,
    category: article.category ?? '',
    kicker: article.kicker ?? '',
    coverIllustrator: article.cover_illustrator ?? '',
    country: article.country ?? '',
  }
}

export function createNewStudioArticle(documentId?: string): StudioArticleDraft {
  const article: StudioArticleMetadata = {
    kind: 'article',
    articleId: null,
    slug: '',
    coverImageUrl: null,
    category: '',
    kicker: '',
    coverIllustrator: '',
    country: '',
  }
  return {
    title: '',
    deck: '',
    document: createStudioDocument(undefined, { article, documentId }),
    isPublished: false,
    publishedAt: null,
  }
}

export async function loadStudioArticle(articleId: string): Promise<StudioArticleDraft | null> {
  const admin = createAdminClient()
  const { data, error } = await admin
    .from('articles')
    .select('id,title,slug,content,excerpt,cover_image_url,category,kicker,cover_illustrator,country,is_published,published_at')
    .eq('id', articleId)
    .single()
  if (error || !data) return null
  const article = data as ArticleRow
  const articleMetadata = metadataFromArticle(article)

  const { data: studioHead } = await admin
    .from('editorial_studio_documents')
    .select('id,current_revision_id')
    .eq('article_id', article.id)
    .maybeSingle()

  if (studioHead?.current_revision_id) {
    const { data: revision } = await admin
      .from('editorial_studio_revisions')
      .select('title,deck,content')
      .eq('id', studioHead.current_revision_id)
      .maybeSingle()
    const migrated = migrateStudioDocument(revision?.content)
    if (revision && migrated.ok) {
      return {
        title: revision.title,
        deck: revision.deck,
        document: { ...migrated.document, article: articleMetadata },
        isPublished: article.is_published,
        publishedAt: article.published_at,
      }
    }
  }

  const documentId = `doc-article-${article.id.replace(/-/g, '')}`
  return {
    title: article.title,
    deck: article.excerpt ?? '',
    document: markdownToStudioDocument(article.content, { documentId, article: articleMetadata }),
    isPublished: article.is_published,
    publishedAt: article.published_at,
  }
}
