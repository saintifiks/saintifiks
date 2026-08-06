import Link from 'next/link'
import type { SitePageBlock, SitePageContent, SitePageSection, SitePageTemplate } from '@/lib/site-pages/types'

type SitePageRendererProps = {
  content: SitePageContent
  template: SitePageTemplate
  preview?: boolean
}

function SafeLink({ href, children }: { href: string; children: React.ReactNode }) {
  const external = href.startsWith('https://')
  return (
    <Link
      href={href}
      target={external ? '_blank' : undefined}
      rel={external ? 'noreferrer' : undefined}
      className="inline-flex min-h-[44px] items-center font-interface text-sm font-semibold text-text-link underline decoration-border-accent/40 underline-offset-4 transition-colors duration-swift hover:text-interactive-primary-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-interactive-primary"
    >
      {children} <span aria-hidden="true" className="ml-1">→</span>
    </Link>
  )
}

function ContentBlock({ block, compact = false }: { block: SitePageBlock; compact?: boolean }) {
  const proseClass = compact
    ? 'font-lora text-body-sm leading-reading text-text-secondary md:text-body-base'
    : 'font-lora text-body-base leading-reading text-text-primary md:text-body-lg'

  switch (block.type) {
    case 'paragraph':
      return <p className={`${proseClass} ${block.emphasis ? 'font-medium text-text-primary' : ''}`}>{block.text}</p>
    case 'list':
      return (
        <ul className="space-y-3" aria-label="Daftar informasi">
          {block.items.map((item, index) => (
            <li key={`${item}-${index}`} className="flex gap-3 border-t border-border-default/10 pt-3 font-interface text-sm leading-relaxed text-text-secondary first:border-t-0 first:pt-0">
              <span aria-hidden="true" className="mt-1 text-text-link">—</span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      )
    case 'link':
      return <SafeLink href={block.href}>{block.label}</SafeLink>
    case 'callout':
      return (
        <aside className={`border-l-4 px-5 py-5 ${block.tone === 'warning' ? 'border-signal-warning bg-signal-warning-surface' : 'border-border-accent bg-signal-info-surface'}`}>
          {block.title && <h3 className="font-interface text-sm font-semibold text-text-primary">{block.title}</h3>}
          <p className={`${block.title ? 'mt-2 ' : ''}font-interface text-sm leading-relaxed text-text-primary`}>{block.body}</p>
        </aside>
      )
    case 'cards':
      return (
        <div className="divide-y divide-border-default/50 border-y border-border-default/50">
          {block.items.map((item, index) => (
            <article key={`${item.title}-${index}`} className="py-7 md:py-8">
              {item.eyebrow && <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">{item.eyebrow}</p>}
              <h3 className={`${item.eyebrow ? 'mt-2 ' : ''}font-display text-xl font-bold text-text-primary`}>{item.title}</h3>
              <p className="mt-2 max-w-[62ch] font-lora text-body-sm leading-reading text-text-secondary">{item.body}</p>
              {item.href && item.linkLabel && <div className="mt-3"><SafeLink href={item.href}>{item.linkLabel}</SafeLink></div>}
            </article>
          ))}
        </div>
      )
    case 'steps':
      return (
        <ol className="divide-y divide-border-default/50 border-y border-border-default/50">
          {block.items.map((item, index) => (
            <li key={`${item.title}-${index}`} className="grid gap-3 py-7 sm:grid-cols-[48px_minmax(0,1fr)] md:py-8">
              <span className="font-mono text-kicker text-text-tertiary" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <div>
                <h3 className="font-display text-lg font-bold text-text-primary">{item.title}</h3>
                <p className="mt-2 max-w-[62ch] font-lora text-body-sm leading-reading text-text-secondary">{item.body}</p>
              </div>
            </li>
          ))}
        </ol>
      )
    case 'table':
      return (
        <>
          <div className="space-y-4 sm:hidden">
            {block.rows.map((row, rowIndex) => (
              <dl key={rowIndex} className="border border-border-default/15 bg-surface-elevated p-4">
                {block.columns.map((column, columnIndex) => (
                  <div key={column} className={columnIndex ? 'mt-4' : ''}>
                    <dt className="font-interface text-xs font-semibold uppercase tracking-wider text-text-tertiary">{column}</dt>
                    <dd className="mt-1 font-interface text-sm leading-relaxed text-text-secondary">{row[columnIndex]}</dd>
                  </div>
                ))}
              </dl>
            ))}
          </div>
          <div className="hidden overflow-x-auto border border-border-default/15 sm:block">
            <table className="w-full border-collapse text-left">
              <caption className="sr-only">{block.caption}</caption>
              <thead className="bg-surface-sunken/50">
                <tr>
                  {block.columns.map((column) => (
                    <th key={column} scope="col" className="px-4 py-3 font-interface text-xs font-semibold uppercase tracking-wider text-text-secondary">{column}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-t border-border-default/10">
                    {row.map((cell, cellIndex) => cellIndex === 0 ? (
                      <th key={cellIndex} scope="row" className="px-4 py-4 align-top font-interface text-sm font-semibold text-text-primary">{cell}</th>
                    ) : (
                      <td key={cellIndex} className="px-4 py-4 align-top font-interface text-sm leading-relaxed text-text-secondary">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )
    case 'definitions':
      return (
        <dl className="divide-y divide-border-default/15 border-y border-border-default/15">
          {block.items.map((item, index) => (
            <div key={`${item.term}-${index}`} className="grid gap-1 py-5 sm:grid-cols-[160px_1fr] sm:gap-6">
              <dt className="font-interface text-sm font-semibold text-text-primary">{item.term}</dt>
              <dd className="font-interface text-sm leading-relaxed text-text-secondary">{item.description}</dd>
            </div>
          ))}
        </dl>
      )
    case 'subsections':
      return (
        <div className="space-y-8">
          {block.items.map((item, index) => (
            <section key={`${item.title}-${index}`}>
              <h3 className="font-display text-xl font-bold text-text-primary">{item.title}</h3>
              <div className="mt-3 space-y-4">
                {item.paragraphs.map((paragraph, paragraphIndex) => (
                  <p key={paragraphIndex} className={proseClass}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>
      )
  }
}

function SectionBlocks({ section, compact }: { section: SitePageSection; compact?: boolean }) {
  return (
    <div className="space-y-6">
      {section.blocks.map((block, index) => <ContentBlock key={`${block.type}-${index}`} block={block} compact={compact} />)}
    </div>
  )
}

function EditorialTemplate({ content }: { content: SitePageContent }) {
  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-12 md:pb-28 md:pt-20">
      <header className="max-w-4xl pb-14 md:pb-20">
        {content.kicker && <p className="font-mono text-kicker uppercase tracking-widest text-text-link">{content.kicker}</p>}
        <h1 className="mt-4 max-w-3xl font-display text-display-base font-bold text-text-primary md:text-display-lg">{content.title}</h1>
        <p className="mt-6 max-w-2xl font-lora text-body-base leading-reading text-text-secondary md:text-body-lg">{content.introduction}</p>
      </header>

      {content.facts?.length ? (
        <dl className="grid border-y border-border-default/50 md:grid-cols-3">
          {content.facts.map((fact, index) => (
            <div key={`${fact.label}-${index}`} className={`py-6 ${index ? 'border-t border-border-default/50 md:border-l md:border-t-0 md:px-8' : 'md:pr-8'}`}>
              <dt className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">{fact.label}</dt>
              <dd className="mt-2 font-interface text-sm leading-relaxed text-text-primary">{fact.value}</dd>
            </div>
          ))}
        </dl>
      ) : null}

      {content.notice && <div className="mt-10"><ContentBlock block={{ type: 'callout', ...content.notice }} compact /></div>}

      {content.sections.map((section, index) => (
        <section id={section.id} aria-labelledby={`${section.id}-title`} key={section.id} className={`scroll-mt-24 grid gap-6 py-14 md:grid-cols-[minmax(0,220px)_minmax(0,1fr)] md:gap-12 md:py-20 ${index < content.sections.length - 1 ? 'border-b border-border-default/50' : ''}`}>
          <div>
            {section.eyebrow && <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">{section.eyebrow}</p>}
            <h2 id={`${section.id}-title`} className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary">{section.title}</h2>
            {section.description && <p className="mt-3 font-interface text-sm leading-relaxed text-text-secondary">{section.description}</p>}
          </div>
          <div className="min-w-0 max-w-[65ch]"><SectionBlocks section={section} compact /></div>
        </section>
      ))}

      {content.footer && (
        <footer className="border-t border-border-default/50 pt-6">
          {content.footer.label && <p className="font-interface text-sm font-semibold text-text-primary">{content.footer.label}</p>}
          <p className={`${content.footer.label ? 'mt-2 font-interface text-sm normal-case tracking-normal text-text-secondary' : 'font-mono text-kicker uppercase tracking-widest text-text-tertiary'}`}>{content.footer.body}</p>
        </footer>
      )}
    </div>
  )
}

function PolicyTemplate({ content }: { content: SitePageContent }) {
  const navigation = content.sections.filter((section) => section.navLabel)
  return (
    <div className="mx-auto max-w-6xl px-5 py-12 md:px-8 md:py-20">
      <header className="max-w-3xl">
        {content.kicker && <span className="inline-flex rounded-full bg-signal-info-surface px-3 py-1 font-interface text-kicker font-semibold uppercase tracking-widest text-text-link">{content.kicker}</span>}
        <h1 className="mt-4 font-display text-display-sm font-bold leading-tight text-text-primary md:text-display-base">{content.title}</h1>
        <p className="mt-5 max-w-[65ch] font-lora text-body-base leading-reading text-text-secondary md:text-body-lg">{content.introduction}</p>
        {content.documentMeta && <p className="mt-5 font-interface text-sm text-text-tertiary">{content.documentMeta}</p>}
      </header>

      {content.notice && <div className="mt-10 max-w-3xl"><ContentBlock block={{ type: 'callout', ...content.notice }} /></div>}

      {content.highlights?.length ? (
        <section aria-label="Ringkasan" className="mt-14 border-y border-border-default/15 py-8 md:mt-16 md:py-10">
          <div className="grid gap-8 md:grid-cols-3 md:gap-10">
            {content.highlights.map((highlight, index) => (
              <div key={`${highlight.title}-${index}`}>
                {highlight.label && <p className="font-interface text-kicker font-semibold uppercase tracking-widest text-text-link">{highlight.label}</p>}
                <h2 className="mt-2 font-display text-xl font-bold text-text-primary">{highlight.title}</h2>
                <p className="mt-3 font-lora text-base leading-relaxed text-text-secondary">{highlight.body}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {navigation.length > 0 && (
        <details className="mt-8 border border-border-default/20 bg-surface-elevated px-4 py-3 lg:hidden">
          <summary className="min-h-[44px] cursor-pointer py-2 font-interface text-sm font-semibold text-text-primary focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary">Daftar isi</summary>
          <nav aria-label="Daftar isi" className="pb-3 pt-2">
            <ol className="space-y-1">
              {navigation.map((section) => <li key={section.id}><a href={`#${section.id}`} className="flex min-h-[44px] items-center border-t border-border-default/10 py-2 font-interface text-sm text-text-link">{section.navLabel}</a></li>)}
            </ol>
          </nav>
        </details>
      )}

      <div className={`mt-12 ${navigation.length ? 'lg:grid lg:grid-cols-[240px_minmax(0,680px)] lg:gap-16 xl:gap-24' : ''}`}>
        {navigation.length > 0 && (
          <aside className="hidden lg:block" aria-label="Navigasi halaman">
            <nav className="sticky top-24 border-l border-border-default/20 pl-5">
              <p className="mb-3 font-interface text-kicker font-semibold uppercase tracking-widest text-text-tertiary">Di halaman ini</p>
              <ol className="space-y-1">
                {navigation.map((section) => <li key={section.id}><a href={`#${section.id}`} className="inline-flex min-h-[44px] items-center py-2 font-interface text-sm text-text-secondary hover:text-text-link">{section.navLabel}</a></li>)}
              </ol>
            </nav>
          </aside>
        )}

        <article className="min-w-0 max-w-[680px]">
          {content.sections.map((section, index) => (
            <section id={section.id} key={section.id} className={`scroll-mt-24 ${index ? 'mt-14 border-t border-border-default/15 pt-12' : ''}`}>
              <header className="mb-5">
                {section.eyebrow && <p className="font-interface text-kicker font-semibold uppercase tracking-widest text-text-link">{section.eyebrow}</p>}
                <h2 className="mt-2 font-display text-2xl font-bold leading-tight text-text-primary md:text-3xl">{section.title}</h2>
                {section.description && <p className="mt-3 font-lora text-body-base leading-reading text-text-secondary md:text-body-lg">{section.description}</p>}
              </header>
              <SectionBlocks section={section} />
            </section>
          ))}
          {content.footer && (
            <footer className="mt-14 border-t-2 border-border-strong/40 pt-6">
              {content.footer.label && <p className="font-interface text-sm font-semibold text-text-primary">{content.footer.label}</p>}
              <p className={`${content.footer.label ? 'mt-2 ' : ''}font-interface text-sm leading-relaxed text-text-secondary`}>{content.footer.body}</p>
            </footer>
          )}
        </article>
      </div>
    </div>
  )
}

function StandardTemplate({ content }: { content: SitePageContent }) {
  return (
    <div className="mx-auto max-w-4xl px-5 pb-20 pt-12 md:pb-28 md:pt-20">
      <header className="max-w-3xl border-b border-border-default/30 pb-10 md:pb-14">
        {content.kicker && <p className="font-mono text-kicker uppercase tracking-widest text-text-link">{content.kicker}</p>}
        <h1 className="mt-4 font-display text-display-sm font-bold text-text-primary md:text-display-base">{content.title}</h1>
        <p className="mt-5 max-w-[65ch] font-lora text-body-base leading-reading text-text-secondary md:text-body-lg">{content.introduction}</p>
        {content.documentMeta && <p className="mt-5 font-interface text-sm text-text-tertiary">{content.documentMeta}</p>}
      </header>
      {content.notice && <div className="mt-8"><ContentBlock block={{ type: 'callout', ...content.notice }} /></div>}
      <article className="max-w-[680px]">
        {content.sections.map((section, index) => (
          <section id={section.id} key={section.id} className={`scroll-mt-24 py-12 ${index < content.sections.length - 1 ? 'border-b border-border-default/20' : ''}`}>
            {section.eyebrow && <p className="font-mono text-kicker uppercase tracking-widest text-text-tertiary">{section.eyebrow}</p>}
            <h2 className="mt-2 font-display text-2xl font-bold text-text-primary">{section.title}</h2>
            {section.description && <p className="mt-3 font-lora text-body-base leading-reading text-text-secondary">{section.description}</p>}
            <div className="mt-6"><SectionBlocks section={section} /></div>
          </section>
        ))}
      </article>
      {content.footer && <footer className="border-t border-border-default/30 pt-6"><p className="font-interface text-sm text-text-secondary">{content.footer.body}</p></footer>}
    </div>
  )
}

export default function SitePageRenderer({ content, template, preview = false }: SitePageRendererProps) {
  return (
    <main className="min-h-screen bg-surface-page text-text-primary">
      {preview && (
        <div role="status" className="sticky top-0 z-sticky border-b border-signal-warning/40 bg-signal-warning-surface px-4 py-3 text-center font-interface text-sm font-semibold text-text-primary">
          Pratinjau draf — perubahan ini belum terlihat oleh pembaca.
        </div>
      )}
      {template === 'editorial' ? <EditorialTemplate content={content} /> : template === 'policy' ? <PolicyTemplate content={content} /> : <StandardTemplate content={content} />}
    </main>
  )
}
