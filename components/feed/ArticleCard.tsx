import Link from 'next/link'
import { Badge, Divider } from '@/components/ui'

export type ArticleCardData = {
  id: string
  title: string
  slug: string
  excerpt: string | null
  coverImageUrl: string | null
  category: string | null
  kicker: string | null
  readingMinutes: number
}

type ArticleCardProps = {
  article: ArticleCardData
  showDivider?: boolean
}

export default function ArticleCard({ article, showDivider = false }: ArticleCardProps) {
  return (
    <article>
      <Link
        href={`/artikel/${article.slug}`}
        className="group block rounded-md border border-transparent transition-all duration-fast hover:border-border-accent/40 hover:shadow-sm"
      >
        {article.coverImageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.coverImageUrl}
            alt={article.title}
            className="w-full h-auto aspect-[16/9] object-cover"
            loading="lazy"
          />
        )}

        {(article.category || article.kicker) && (
          <div
            className={`flex items-center gap-2 ${article.coverImageUrl ? 'mt-4' : ''}`}
          >
            {article.category && (
              <Badge variant="category">{article.category}</Badge>
            )}
            {article.category && article.kicker && (
              <span className="inline-block h-4 w-px bg-warm-gray" aria-hidden="true" />
            )}
            {article.kicker && (
              <span className="font-interface text-sm font-semibold text-ink">
                {article.kicker}
              </span>
            )}
          </div>
        )}

        <h2 className="font-display text-2xl font-medium leading-snug text-ink mt-2 group-hover:text-text-link transition-colors duration-fast">
          {article.title}
        </h2>

        {article.excerpt && (
          <p className="font-display text-base font-normal leading-relaxed text-text-secondary mt-2 line-clamp-2">
            {article.excerpt}
          </p>
        )}

        <p className="font-interface text-[13px] text-text-secondary mt-4">
          baca {article.readingMinutes} menit
        </p>
      </Link>

      {showDivider && <Divider spacing="md" className="mt-4" />}
    </article>
  )
}
