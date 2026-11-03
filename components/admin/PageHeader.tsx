import Link from 'next/link'
import type { ReactNode } from 'react'

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

// Kepala halaman admin: jejak (opsional), judul serif, satu kalimat penjelasan, aksi di kanan.
// Tanpa ikon dan tanpa warna aksen; hierarki dibangun dari ukuran dan garis.
export default function PageHeader({
  titleId,
  title,
  description,
  eyebrow,
  breadcrumbs = [],
  actions,
}: PageHeaderProps) {
  return (
    <header className="mb-8 border-b border-border-default/20 pb-6 sm:mb-10 sm:pb-8">
      {breadcrumbs.length > 0 && (
        <nav aria-label="Jejak halaman" className="mb-4 hidden sm:block">
          <ol className="flex flex-wrap items-center gap-2 font-mono text-caption text-text-tertiary">
            {breadcrumbs.map((item, index) => {
              const current = index === breadcrumbs.length - 1
              return (
                <li key={`${item.label}-${index}`} className="flex items-center gap-2">
                  {index > 0 && <span aria-hidden="true">/</span>}
                  {item.href && !current ? (
                    <Link
                      href={item.href}
                      className="underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-fast hover:text-text-primary hover:decoration-text-primary"
                    >
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
            <p className="mb-2 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
              {eyebrow}
            </p>
          )}
          <h1 id={titleId} className="font-display text-display-sm leading-tight text-text-primary">
            {title}
          </h1>
          {description && (
            <p className="mt-3 max-w-2xl font-display text-body-sm italic leading-relaxed text-text-secondary">
              {description}
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-5">{actions}</div>}
      </div>
    </header>
  )
}
