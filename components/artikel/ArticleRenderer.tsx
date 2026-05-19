import React from 'react'
import ReactMarkdown from 'react-markdown'
import ChartBlock from './ChartBlock'

type ArticleRendererProps = {
  content: string
  charts: { chart_identifier: string; config: string }[]
}

export default function ArticleRenderer({ content, charts }: ArticleRendererProps) {
  // Pisahkan string markdown berdasarkan pola {{chart:identifier}}
  const parts = content.split(/({{chart:[^}]+}})/g)

  return (
    <div className="article-content">
      {parts.map((part, index) => {
        // Cek apakah blok ini adalah placeholder chart
        const chartMatch = part.match(/^{{chart:([^}]+)}}$/)
        
        if (chartMatch) {
          const identifier = chartMatch[1]
          // Cari data chart yang sesuai dari database
          const chartData = charts.find((c) => c.chart_identifier === identifier)
          
          return (
            <ChartBlock 
              key={index} 
              identifier={identifier} 
              configString={chartData ? chartData.config : null} 
            />
          )
        }

        // Jika bukan placeholder chart, render sebagai Markdown biasa
        return (
          <ReactMarkdown
            key={index}
            components={{
              h1: ({ children }) => <h1 className="font-libre text-3xl font-bold text-primary-dark mt-10 mb-4 leading-tight">{children}</h1>,
              h2: ({ children }) => <h2 className="font-libre text-2xl font-bold text-primary-dark mt-8 mb-3 leading-tight">{children}</h2>,
              h3: ({ children }) => <h3 className="font-libre text-xl font-bold text-primary-dark mt-6 mb-2 leading-tight">{children}</h3>,
              p: ({ children }) => <p className="font-libre text-lg text-primary-dark leading-relaxed mb-5">{children}</p>,
              strong: ({ children }) => <strong className="font-bold text-primary-dark">{children}</strong>,
              em: ({ children }) => <em className="italic">{children}</em>,
              ul: ({ children }) => <ul className="font-libre text-lg text-primary-dark leading-relaxed mb-5 ml-6 list-disc">{children}</ul>,
              ol: ({ children }) => <ol className="font-libre text-lg text-primary-dark leading-relaxed mb-5 ml-6 list-decimal">{children}</ol>,
              li: ({ children }) => <li className="mb-1">{children}</li>,
              blockquote: ({ children }) => <blockquote className="border-l-2 border-primary-dark/20 pl-6 my-6 font-libre text-lg text-primary-dark/70 italic">{children}</blockquote>,
              // Implementasi ini menghindari bug parsing tag "a" saat copy-paste dari antarmuka chat [cite: 731, 735]
              a: ({ href, children }) => React.createElement('a', {
                href,
                className: "text-accent-blue underline underline-offset-2 hover:opacity-70 transition-opacity duration-150",
                target: href?.startsWith('http') ? '_blank' : undefined,
                rel: href?.startsWith('http') ? 'noopener noreferrer' : undefined
              }, children),
              code: ({ children }) => <code className="font-mono text-sm bg-primary-dark/5 text-primary-dark px-1.5 py-0.5 rounded">{children}</code>,
              hr: () => <hr className="border-primary-dark/10 my-10" />
            }}
          >
            {part}
          </ReactMarkdown>
        )
      })}
    </div>
  )
}