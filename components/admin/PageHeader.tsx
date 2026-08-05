import Link from 'next/link'
import type { ReactNode } from 'react'
import { ChevronRight } from 'lucide-react'

type BreadcrumbItem = {
  label: string
  href?: string
}

type PageHeaderProps = {
  titleId?: string
  title: string
  description?: string
  eyebrow?: string
  breadcrumbs?: BreadcrumbItem[]
  actions?: ReactNode
}

export default function PageHeader({
  titleId,
  title,
  description,
  eyebrow,
  breadcrumbs = [],
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-border-default/15 pb-6 sm:mb-10 sm:pb-8">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Breadcrumb" className="mb-4 hidden sm:block">
          <ol className="flex flex-wrap items-center gap-1.5 text-xs text-text-tertiary">
            {breadcrumbs.map((item, index) => {
              const current = index === breadcrumbs.length - 1
              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-1.5">
                  {index > 0 && <ChevronRight aria-hidden="true" size={13} />}
                  {item.href && !current ? (
                    <Link href={item.href} className="hover:text-text-primary hover:underline hover:underline-offset-2">
                      {item.label}
                    </Link>
                  ) : (
                    <span aria-current={current ? 'page' : undefined} className={current ? 'text-text-secondary' : undefined}>
                      {item.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      )}

      <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          {eyebrow && (
            <p className="mb-2 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-interactive-primary">
              {eyebrow}
            </p>
          )}
          <h1 id={titleId} className="font-display text-2xl font-bold leading-tight text-text-primary sm:text-3xl">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-sm leading-6 text-text-secondary">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
      </div>
    </header>
  )
}
