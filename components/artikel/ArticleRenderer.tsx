'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkFootnotes from 'remark-footnotes'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import dynamic from 'next/dynamic'
import remarkCallout from '@/lib/supabase/remark/remarkCallout'

// ChartBlock dimuat hanya di sisi client (bukan server)
// Chart.js membutuhkan Canvas API yang hanya tersedia di browser — bukan di server Next.js
const ChartBlock = dynamic(() => import('./ChartBlock'), {
  ssr: false,
  loading: () => (
    <div className="my-10 w-full h-64 bg-primary-dark/5 animate-pulse border border-primary-dark/10" />
  )
})

type ArticleRendererProps = {
  content: string
  charts: { chart_identifier: string; config: string }[]
}

// Konfigurasi visual untuk setiap tipe callout
const CALLOUT_CONFIG: Record<string, { label: string; borderClass: string; bgClass: string; labelClass: string }> = {
  note:      { label: 'Catatan',   borderClass: 'border-accent-blue',  bgClass: 'bg-accent-blue/5',  labelClass: 'text-accent-blue'  },
  warning:   { label: 'Perhatian', borderClass: 'border-yellow-500',   bgClass: 'bg-yellow-50',      labelClass: 'text-yellow-700'   },
  important: { label: 'Penting',   borderClass: 'border-accent-red',   bgClass: 'bg-accent-red/5',   labelClass: 'text-accent-red'   },
  tip:       { label: 'Tips',      borderClass: 'border-green-600',    bgClass: 'bg-green-50',       labelClass: 'text-green-700'    },
}

export default function ArticleRenderer({ content, charts }: ArticleRendererProps) {
  // Parsing chart placeholder {{chart:identifier}} tetap dipertahankan
  const parts = content.split(/({{chart:[^}]+}})/g)

  return (
    <div className="article-content prose prose-lg max-w-none font-libre text-primary-dark dark:text-primary-light">
      {parts.map((part, index) => {
        const chartMatch = part.match(/^{{chart:([^}]+)}}$/)
        
        if (chartMatch) {
          const identifier = chartMatch[1]
          const chartData = charts.find((c) => c.chart_identifier === identifier)
          
          return (
            <ChartBlock 
              key={index} 
              identifier={identifier} 
              configString={chartData ? chartData.config : null} 
            />
          )
        }

        // Render Markdown dengan plugin lanjutan
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm, remarkMath, remarkFootnotes, remarkCallout]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
            components={{
              // Heading
              h1: ({ children }) => <h1 className="font-libre text-3xl font-bold text-primary-dark mt-12 mb-6 leading-tight dark:text-primary-light">{children}</h1>,
              h2: ({ children }) => <h2 className="font-libre text-2xl font-bold text-primary-dark mt-10 mb-4 leading-tight dark:text-primary-light">{children}</h2>,
              h3: ({ children }) => <h3 className="font-libre text-xl font-bold text-primary-dark mt-8 mb-3 leading-tight dark:text-primary-light">{children}</h3>,

              // Paragraph & Text
              p: ({ children }) => <p className="font-libre text-lg leading-relaxed mb-6">{children}</p>,
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,

              // List
              ul: ({ children }) => <ul className="font-libre text-lg mb-6 ml-6 list-disc space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="font-libre text-lg mb-6 ml-6 list-decimal space-y-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,

              // Table
              table: ({ children }) => (
                <div className="my-8 overflow-x-auto border border-primary-dark/10 rounded dark:border-primary-light/10">
                  <table className="min-w-full divide-y divide-primary-dark/10 dark:divide-primary-light/10">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="px-4 py-3 bg-primary-dark/5 text-left font-medium border-b border-primary-dark/10 dark:bg-primary-light/10 dark:border-primary-light/10 dark:text-primary-dark">{children}</th>,
              td: ({ children }) => <td className="px-4 py-3 border-b border-primary-dark/10 dark:border-primary-light/10">{children}</td>,

              // Blockquote — mendukung dua mode:
              // 1. Callout box (> [!NOTE], > [!WARNING], dll.) → box berwarna
              // 2. Blockquote biasa (> teks) → tampilan italic seperti sebelumnya
              blockquote: ({ node, children }) => {
                // Cek apakah blockquote ini adalah callout (ditandai oleh remarkCallout plugin)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const calloutType = (node as any)?.properties?.['data-callout-type'] as string | undefined
                const config = calloutType ? CALLOUT_CONFIG[calloutType] : undefined

                if (config) {
                  return (
                    <div className={`my-8 border-l-4 ${config.borderClass} ${config.bgClass} px-5 py-4 rounded-r`}>
                      <p className={`font-helvetica font-bold text-xs uppercase tracking-widest mb-2 ${config.labelClass}`}>
                        {config.label}
                      </p>
                      <div className="font-libre text-base text-primary-dark/90 [&>p]:mb-0 [&>p]:leading-relaxed">
                        {children}
                      </div>
                    </div>
                  )
                }

                // Blockquote biasa — tampilan tidak berubah
                return (
                  <blockquote className="border-l-4 border-primary-dark/30 pl-6 my-8 italic text-primary-dark/80 font-libre text-lg dark:border-primary-light/30 dark:text-primary-light/80">
                    {children}
                  </blockquote>
                )
              },

              // Code & Highlight
              code: ({ className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '')
                return match ? (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="font-mono text-sm bg-primary-dark/5 px-1.5 py-0.5 rounded dark:bg-primary-light/10" {...props}>
                    {children}
                  </code>
                )
              },

              // Image — pendekatan hibrida:
              // Gambar dari Supabase → <Image> Next.js (dioptimasi, lebih cepat)
              // Gambar dari sumber lain → <img> biasa (aman, tidak error)
              img: ({ src, alt }) => {
                const [caption, source] = (alt || '').split('|').map(s => s.trim())
                const isSupabase = src?.includes('.supabase.co')

                return (
                  <figure className="my-10">
                    {isSupabase ? (
                      <Image
                        src={src!}
                        alt={caption || ''}
                        width={800}
                        height={500}
                        className="w-full rounded border border-primary-dark/10 dark:border-primary-light/10 dark:bg-primary-dark"
                        style={{ height: 'auto' }}
                      />
                    ) : (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={src}
                        alt={caption || ''}
                        className="w-full rounded border border-primary-dark/10"
                      />
                    )}
                    {caption && (
                      <figcaption className="text-center mt-3 text-sm text-primary-dark/60 font-helvetica dark:text-primary-light/60">
                        {caption}
                        {source && <span className="block text-xs mt-1">Sumber: {source}</span>}
                      </figcaption>
                    )}
                  </figure>
                )
              },

              // Link
              a: ({ href, children }) => React.createElement('a', {
                href,
                className: "text-accent-blue underline underline-offset-2 hover:opacity-70 transition-opacity duration-150",
                target: href?.startsWith('http') ? '_blank' : undefined,
                rel: href?.startsWith('http') ? 'noopener noreferrer' : undefined
              }, children),

              hr: () => <hr className="border-primary-dark/10 my-12 dark:border-primary-light/10" />
            }}
          >
            {part}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}