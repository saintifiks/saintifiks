// Halaman artikel individual — menampilkan satu artikel berdasarkan slug-nya
// Server Component: fetch data di server, SEO metadata di-generate otomatis

import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import ReactMarkdown from 'react-markdown'
import type { Metadata } from 'next'

// ISR: halaman di-cache dan diperbarui otomatis setiap 1 jam
export const revalidate = 3600

type Article = {
  id: string
  title: string
  slug: string
  content: string
  excerpt: string | null
  cover_image_url: string | null
  published_at: string | null
}

type Props = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article } = await supabase
    .from('articles')
    .select('title, excerpt')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!article) {
    return { title: 'Artikel tidak ditemukan — Saintifiks' }
  }

  return {
    title: `${article.title} — Saintifiks`,
    description: article.excerpt ?? undefined,
    openGraph: {
      title: article.title,
      description: article.excerpt ?? undefined,
      siteName: 'Saintifiks',
    },
  }
}

function formatTanggal(tanggal: string): string {
  return new Date(tanggal).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export default async function ArtikelPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: article, error } = await supabase
    .from('articles')
    .select('id, title, slug, content, excerpt, cover_image_url, published_at')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !article) {
    notFound()
  }

  const artikel = article as Article

  return (
    <main className="min-h-screen bg-primary-light">

      <header className="border-b border-primary-dark/10 py-16 px-6">
        <div className="max-w-2xl mx-auto">

          <a
            href="/"
            className="font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest hover:text-primary-dark transition-colors duration-150"
          >
            ← Saintifiks
          </a>

          {artikel.published_at && (
            <time
              dateTime={artikel.published_at}
              className="block font-helvetica text-xs text-primary-dark/40 uppercase tracking-widest mt-6"
            >
              {formatTanggal(artikel.published_at)}
            </time>
          )}

          <h1 className="font-libre text-4xl font-bold text-primary-dark mt-3 leading-tight">
            {artikel.title}
          </h1>

          {artikel.excerpt && (
            <p className="font-helvetica text-base text-primary-dark/60 mt-4 leading-relaxed">
              {artikel.excerpt}
            </p>
          )}

        </div>
      </header>

      <article className="max-w-2xl mx-auto px-6 py-12">
        <ReactMarkdown
          components={{
            h1: ({ children }) => (
              <h1 className="font-libre text-3xl font-bold text-primary-dark mt-10 mb-4 leading-tight">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="font-libre text-2xl font-bold text-primary-dark mt-8 mb-3 leading-tight">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="font-libre text-xl font-bold text-primary-dark mt-6 mb-2 leading-tight">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="font-libre text-lg text-primary-dark leading-relaxed mb-5">
                {children}
              </p>
            ),
            strong: ({ children }) => (
              <strong className="font-bold text-primary-dark">{children}</strong>
            ),
            em: ({ children }) => (
              <em className="italic">{children}</em>
            ),
            ul: ({ children }) => (
              <ul className="font-libre text-lg text-primary-dark leading-relaxed mb-5 ml-6 list-disc">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="font-libre text-lg text-primary-dark leading-relaxed mb-5 ml-6 list-decimal">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="mb-1">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-2 border-primary-dark/20 pl-6 my-6 font-libre text-lg text-primary-dark/70 italic">
                {children}
              </blockquote>
            ),
            a: ({ href, children }) => (
              <a
                href={href}
                className="text-accent-blue underline underline-offset-2 hover:opacity-70 transition-opacity duration-150"
                target={href?.startsWith('http') ? '_blank' : undefined}
                rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
              >
                {children}
              </a>
            ),
            code: ({ children }) => (
              <code className="font-mono text-sm bg-primary-dark/5 text-primary-dark px-1.5 py-0.5 rounded">
                {children}
              </code>
            ),
            hr: () => (
              <hr className="border-primary-dark/10 my-10" />
            ),
          }}
        >
          {artikel.content}
        </ReactMarkdown>
      </article>

    </main>
  )
}
