import React from 'react'
import ReactMarkdown from 'react-markdown'
import Image from 'next/image'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import rehypeRaw from 'rehype-raw'
import dynamic from 'next/dynamic'
import remarkCallout from '@/lib/supabase/remark/remarkCallout'

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

const CALLOUT_CONFIG: Record<string, { label: string; borderClass: string; bgClass: string; labelClass: string }> = {
  note:      { label: 'Catatan',   borderClass: 'border-accent-blue',  bgClass: 'bg-accent-blue/5',  labelClass: 'text-accent-blue'  },
  warning:   { label: 'Perhatian', borderClass: 'border-yellow-500',   bgClass: 'bg-yellow-50',      labelClass: 'text-yellow-700'   },
  important: { label: 'Penting',   borderClass: 'border-accent-red',   bgClass: 'bg-accent-red/5',   labelClass: 'text-accent-red'   },
  tip:       { label: 'Tips',      borderClass: 'border-green-600',    bgClass: 'bg-green-50',       labelClass: 'text-green-700'    },
}

export default function ArticleRenderer({ content, charts }: ArticleRendererProps) {
  const parts = content.split(/({{chart:[^}]+}})/g)

  return (
    <div className="article-content prose prose-lg max-w-none font-libre text-primary-dark">
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

        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm, remarkMath, remarkCallout]}
            rehypePlugins={[rehypeRaw, rehypeKatex, rehypeHighlight]}
            components={{
              h1: ({ children }) => <h1 className="font-libre text-3xl font-bold text-primary-dark mt-12 mb-6 leading-tight">{children}</h1>,
              h2: ({ children }) => <h2 className="font-libre text-2xl font-bold text-primary-dark mt-10 mb-4 leading-tight">{children}</h2>,
              h3: ({ children }) => <h3 className="font-libre text-xl font-bold text-primary-dark mt-8 mb-3 leading-tight">{children}</h3>,
              p: ({ children }) => <p className="font-libre text-lg leading-relaxed mb-6">{children}</p>,
              strong: ({ children }) => <strong className="font-bold">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => <ul className="font-libre text-lg mb-6 ml-6 list-disc space-y-2">{children}</ul>,
              ol: ({ children }) => <ol className="font-libre text-lg mb-6 ml-6 list-decimal space-y-2">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              table: ({ children }) => (
                <div className="my-8 overflow-x-auto border border-primary-dark/10 rounded">
                  <table className="min-w-full divide-y divide-primary-dark/10">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="px-4 py-3 bg-primary-dark/5 text-left font-medium border-b border-primary-dark/10">{children}</th>,
              td: ({ children }) => <td className="px-4 py-3 border-b border-primary-dark/10">{children}</td>,
              blockquote: ({ node, children }) => {
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

                return (
                  <blockquote className="border-l-4 border-primary-dark/30 pl-6 my-8 italic text-primary-dark/80 font-libre text-lg">
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
                  <code className="font-mono text-sm bg-primary-dark/5 px-1.5 py-0.5 rounded" {...props}>
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
                        className="w-full rounded border border-primary-dark/10"
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
                      <figcaption className="text-center mt-3 text-sm text-primary-dark/60 font-helvetica">
                        {caption}
                        {source && <span className="block text-xs mt-1">Sumber: {source}</span>}
                      </figcaption>
                    )}
                  </figure>
                )
              },
              a: ({ href, children }) => React.createElement('a', {
                href,
                className: "text-accent-blue underline underline-offset-2 hover:opacity-70 transition-opacity duration-150",
                target: href?.startsWith('http') ? '_blank' : undefined,
                rel: href?.startsWith('http') ? 'noopener noreferrer' : undefined
              }, children),
              hr: () => <hr className="border-primary-dark/10 my-12" />
            }}
          >
            {part}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}