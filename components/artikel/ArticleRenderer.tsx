import React from 'react'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize'
import dynamic from 'next/dynamic'
import remarkCallout from '@/lib/supabase/remark/remarkCallout'

const ChartBlock = dynamic(() => import('./ChartBlock'), {
  ssr: false,
  loading: () => (
    <div className="my-10 w-full h-64 bg-ink/5 animate-pulse border border-ink/10" />
  )
})

type ArticleRendererProps = {
  content: string
  charts: { chart_identifier: string; config: string | object }[]
}

const CALLOUT_CONFIG: Record<string, { label: string; typeClass: string }> = {
  note:      { label: 'Catatan',   typeClass: 'callout-note' },
  warning:   { label: 'Perhatian', typeClass: 'callout-warning' },
  important: { label: 'Penting',   typeClass: 'callout-important' },
  tip:       { label: 'Tips',      typeClass: 'callout-tip' },
}

// Custom sanitize schema: extend defaultSchema untuk izinkan class, id, dan data-* attributes
// Diperlukan agar chart placeholder (div.saintifiks-chart#id) dan callout (data-callout-type)
// tidak dihapus oleh sanitizer — sambil tetap memblokir script/event handlers berbahaya
const sanitizeSchema = {
  ...defaultSchema,
  clobberPrefix: '',
  attributes: {
    ...defaultSchema.attributes,
    '*': [...(defaultSchema.attributes?.['*'] ?? []), 'className', 'id'],
    div: [...(defaultSchema.attributes?.['div'] ?? []), 'className', 'id', 'dataCalloutType'],
    blockquote: [...(defaultSchema.attributes?.['blockquote'] ?? []), 'dataCalloutType'],
    code: [...(defaultSchema.attributes?.['code'] ?? []), 'className'],
    span: [...(defaultSchema.attributes?.['span'] ?? []), 'className'],
  },
}

export default function ArticleRenderer({ content, charts }: ArticleRendererProps) {
  // Regex Replacement: Mengubah token AI menjadi HTML statis block-level sebelum diproses parser
  const processedContent = content.replace(
    /{{chart:([^}]+)}}/g,
    '\n\n<div class="saintifiks-chart" id="$1"></div>\n\n'
  )

  return (
    <div className="article-body">
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkCallout]}
        rehypePlugins={[rehypeRaw, [rehypeSanitize, sanitizeSchema], rehypeKatex, rehypeHighlight]}
        components={{
          h1: ({ children }) => <h1 className="font-body text-display-sm font-bold text-ink mt-12 mb-6 leading-heading">{children}</h1>,
          h2: ({ children }) => <h2 className="font-body text-2xl font-bold text-ink mt-10 mb-4 leading-heading">{children}</h2>,
          h3: ({ children }) => <h3 className="font-body text-xl font-bold text-ink mt-8 mb-3 leading-heading">{children}</h3>,
          p: ({ children }) => <p className="font-body text-body-base leading-reading mb-6">{children}</p>,
          strong: ({ children }) => <strong className="font-bold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,
          ul: ({ children }) => <ul className="font-body text-body-base mb-6 ml-6 list-disc space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="font-body text-body-base mb-6 ml-6 list-decimal space-y-2">{children}</ol>,
          li: ({ children }) => <li className="mb-1">{children}</li>,
          table: ({ children }) => (
            <div className="my-8 overflow-x-auto border border-ink/10 rounded">
              <table className="min-w-full divide-y divide-ink/10">{children}</table>
            </div>
          ),
          th: ({ children }) => <th className="px-4 py-3 bg-ink/5 text-left font-medium border-b border-ink/10 text-ink">{children}</th>,
          td: ({ children }) => <td className="px-4 py-3 border-b border-ink/10 text-ink">{children}</td>,
          blockquote: ({ node, children }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const calloutType = (node as any)?.properties?.['data-callout-type'] as string | undefined
            const config = calloutType ? CALLOUT_CONFIG[calloutType] : undefined

            if (config) {
              return (
                <div
                  className={`callout-box ${config.typeClass}`}
                  data-callout-type={calloutType}
                  role="note"
                >
                  <p className="callout-box__label">{config.label}</p>
                  <div className="font-lora text-body-sm text-text-primary [&>p]:mb-0 [&>p]:leading-reading">
                    {children}
                  </div>
                </div>
              )
            }

            return (
              <blockquote className="my-8">
                {children}
              </blockquote>
            )
          },
          code: ({ className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            return match ? (
              <code className={className} {...props}>
                {children}
              </code>
            ) : (
              <code className="font-mono text-sm bg-ink/5 px-1.5 py-0.5 rounded text-ink">
                {children}
              </code>
            )
          },
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
                    className="w-full rounded border border-ink/10"
                    style={{ height: 'auto' }}
                  />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt={caption || ''}
                    className="w-full rounded border border-ink/10"
                  />
                )}
                {caption && (
                  <figcaption className="text-center mt-3 text-sm text-warm-gray font-mono">
                    {caption}
                    {source && <span className="block text-xs mt-1">Sumber: {source}</span>}
                  </figcaption>
                )}
              </figure>
            )
          },
          a: ({ href, children }) => React.createElement('a', {
            href,
            className: "text-text-link underline underline-offset-2 hover:text-interactive-primary-hover transition-colors duration-150",
            target: href?.startsWith('http') ? '_blank' : undefined,
            rel: href?.startsWith('http') ? 'noopener noreferrer' : undefined
          }, children),
          hr: () => <hr className="border-ink/10 my-12" />,
          
          // Penukar Dinamis: Mencegat HTML div yang masuk dan menukarnya menjadi grafik React jika teridentifikasi
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          div: ({ className, id, children, ...props }: any) => {
            if (className === 'saintifiks-chart' && id) {
              const chartData = charts.find((c) => c.chart_identifier === id)
              return <ChartBlock identifier={id} configString={chartData ? chartData.config : null} />
            }
            return <div className={className} id={id} {...props}>{children}</div>
          }
        }}
      >
        {processedContent}
      </ReactMarkdown>
    </div>
  )
}
