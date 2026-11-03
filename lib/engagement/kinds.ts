// Satu pintu untuk interaksi pembaca (suka · komentar · bagikan · koreksi · laporan). Artikel redaksi dan
// Argumen memakai komponen yang sama; yang berbeda hanya alamat API dan nama kolomnya, dikumpulkan di sini.
// Menyatukan tabelnya ditunda (keputusan D9); lapisan ini membuat penyatuan nanti tinggal mengubah satu berkas.

export type ContentKind = 'article' | 'opinion'

const JSON_HEADERS = { 'Content-Type': 'application/json' }

export const likeApi = {
  statusUrl: (kind: ContentKind, id: string) =>
    kind === 'opinion' ? `/api/opinions/${id}/like` : `/api/likes?articleId=${id}`,
  isLiked: (kind: ContentKind, data: { liked?: boolean; isLiked?: boolean } | null) =>
    !!(kind === 'opinion' ? data?.liked : data?.isLiked),
  request: (kind: ContentKind, id: string, next: boolean): { url: string; init: RequestInit } =>
    kind === 'opinion'
      ? { url: `/api/opinions/${id}/like`, init: { method: next ? 'POST' : 'DELETE' } }
      : {
          url: '/api/likes',
          init: { method: next ? 'POST' : 'DELETE', headers: JSON_HEADERS, body: JSON.stringify({ articleId: id }) },
        },
}

const commentUrl = (kind: ContentKind) => (kind === 'opinion' ? '/api/opinion-comments' : '/api/comments')

export const commentApi = {
  url: commentUrl,
  listUrl: (kind: ContentKind, id: string) => `${commentUrl(kind)}?articleId=${id}`,
  body: (kind: ContentKind, id: string, content: string) =>
    JSON.stringify(kind === 'opinion' ? { opinion_article_id: id, content } : { article_id: id, content }),
}

export const shareApi = {
  url: (kind: ContentKind) => (kind === 'opinion' ? '/api/opinion-shares' : '/api/shares'),
  body: (kind: ContentKind, id: string, platform: string) =>
    JSON.stringify(kind === 'opinion' ? { opinion_article_id: id, platform } : { article_id: id, platform }),
}

export const correctionApi = {
  opinionUrl: '/api/opinion-corrections',
  opinionBody: (id: string, original: string, corrected: string, explanation: string) =>
    JSON.stringify({ opinion_article_id: id, original_text: original, corrected_text: corrected, explanation }),
}

export const reportApi = {
  url: (id: string) => `/api/opinions/${id}/report`,
}
