'use client'

import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import rehypeKatex from 'rehype-katex'
import rehypeHighlight from 'rehype-highlight'
import ChartBlock from './ChartBlock'

// Import CSS akan dilakukan di layout.tsx

type ArticleRendererProps = {
  content: string
  charts: { chart_identifier: string; config: string }[]
}

export default function ArticleRenderer({ content, charts }: ArticleRendererProps) {
  // Parsing chart placeholder {{chart:identifier}} tetap dipertahankan
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

        // Render Markdown dengan plugin lanjutan
        return (
          <ReactMarkdown
            key={index}
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex, rehypeHighlight]}
            components={{
              // Heading
              h1: ({ children }) => <h1 className="font-libre text-3xl font-bold text-primary-dark mt-12 mb-6 leading-tight">{children}</h1>,
              h2: ({ children }) => <h2 className="font-libre text-2xl font-bold text-primary-dark mt-10 mb-4 leading-tight">{children}</h2>,
              h3: ({ children }) => <h3 className="font-libre text-xl font-bold text-primary-dark mt-8 mb-3 leading-tight">{children}</h3>,

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
                <div className="my-8 overflow-x-auto border border-primary-dark/10 rounded">
                  <table className="min-w-full divide-y divide-primary-dark/10">{children}</table>
                </div>
              ),
              th: ({ children }) => <th className="px-4 py-3 bg-primary-dark/5 text-left font-medium border-b border-primary-dark/10">{children}</th>,
              td: ({ children }) => <td className="px-4 py-3 border-b border-primary-dark/10">{children}</td>,

              // Blockquote & Callout
              blockquote: ({ children }) => {
                const text = String(children).trim()
                const calloutMatch = text.match(/^\[!(\w+)\](.*)/s)
                
                if (calloutMatch) {
                  const type = calloutMatch[1].toUpperCase()
                  const content = calloutMatch[2].trim()
                  let bgColor = 'bg-primary-dark/5 border-primary-dark/20'
                  let icon = '📝'

                  if (type === 'WARNING' || type === 'CAUTION') {
                    bgColor = 'bg-accent-red/5 border-accent-red/30'
                    icon = '⚠️'
                  } else if (type === 'IMPORTANT' || type === 'NOTE') {
                    bgColor = 'bg-accent-blue/5 border-accent-blue/30'
                    icon = 'ℹ️'
                  }

                  return (
                    <div className={`my-8 p-6 border-l-4 rounded-r ${bgColor}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-xl mt-0.5">{icon}</span>
                        <div className="font-libre text-lg leading-relaxed">{content}</div>
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

              // Code & Highlight
              code: ({ inline, className, children, ...props }) => {
                const match = /language-(\w+)/.exec(className || '')
                return !inline && match ? (
                  <code className={className} {...props}>
                    {children}
                  </code>
                ) : (
                  <code className="font-mono text-sm bg-primary-dark/5 px-1.5 py-0.5 rounded" {...props}>
                    {children}
                  </code>
                )
              },

              // Image dengan caption & sumber
              img: ({ src, alt }) => {
                const [caption, source] = (alt || '').split('|').map(s => s.trim())
                return (
                  <figure className="my-10">
                    <img 
                      src={src} 
                      alt={caption || ''} 
                      className="w-full rounded border border-primary-dark/10" 
                    />
                    {caption && (
                      <figcaption className="text-center mt-3 text-sm text-primary-dark/60 font-helvetica">
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