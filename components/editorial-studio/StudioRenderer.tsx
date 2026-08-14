import { Fragment, type ReactNode } from 'react'
import { BarChart3, Database, Image as ImageIcon } from 'lucide-react'
import type {
  StudioChartEvidence,
  StudioDatasetEvidence,
  StudioDatasetValue,
  StudioJsonNode,
  StudioMark,
  StudioSourceEvidence,
  StudioVersionedDocument,
} from '@/lib/editorial-studio/document'
import {
  validateStudioDocument,
  validateStudioDocumentV2,
} from '@/lib/editorial-studio/document'

type StudioRendererProps = {
  document: StudioVersionedDocument
}

type RenderContext = {
  footnoteNumbers: Map<string, number>
  sources: Map<string, StudioSourceEvidence>
  datasets: Map<string, StudioDatasetEvidence>
  charts: Map<string, StudioChartEvidence>
}

function stringAttr(node: StudioJsonNode, name: string) {
  const value = node.attrs?.[name]
  return typeof value === 'string' ? value : ''
}

function safeHref(value: unknown) {
  if (typeof value !== 'string') return undefined
  try {
    const parsed = new URL(value, 'https://saintifiks.com')
    return ['http:', 'https:', 'mailto:'].includes(parsed.protocol) ? value : undefined
  } catch {
    return undefined
  }
}

function calloutLabel(tone: string) {
  return {
    note: 'Catatan',
    context: 'Konteks',
    warning: 'Perhatian',
    method: 'Metode',
    evidenceLimit: 'Batas bukti',
    unknown: 'Yang belum diketahui',
  }[tone] ?? 'Catatan'
}

function sourceAnchorId(sourceId: string) {
  return `studio-source-${sourceId}`
}

function evidenceValue(value: StudioDatasetValue) {
  if (value === null) return '—'
  if (typeof value === 'boolean') return value ? 'Ya' : 'Tidak'
  return String(value)
}

function sourceMetadata(source: StudioSourceEvidence) {
  return [
    source.authors.join(', '),
    source.publisher,
    source.publishedDate ? `Terbit ${source.publishedDate}` : '',
    source.accessedDate ? `Diakses ${source.accessedDate}` : '',
  ].filter(Boolean)
}

function EvidenceSourceLinks({
  sourceIds,
  context,
  label = 'Sumber data',
}: {
  sourceIds: string[]
  context: RenderContext
  label?: string
}) {
  const sources = sourceIds
    .map((sourceId) => context.sources.get(sourceId))
    .filter((source): source is StudioSourceEvidence => Boolean(source))
  if (sources.length === 0) return null

  return (
    <p className="mt-3 font-interface text-caption leading-relaxed text-text-secondary">
      {label}:{' '}
      {sources.map((source, index) => (
        <Fragment key={source.id}>
          {index > 0 ? '; ' : ''}
          <a
            href={`#${sourceAnchorId(source.id)}`}
            className="text-text-link underline decoration-border-accent underline-offset-4"
          >
            {source.title}
          </a>
        </Fragment>
      ))}
    </p>
  )
}

function EvidenceDataTable({
  dataset,
  caption,
}: {
  dataset: StudioDatasetEvidence
  caption: string
}) {
  if (dataset.columns.length === 0) {
    return (
      <p className="mt-4 font-interface text-sm text-text-secondary">
        Tabel data belum tersedia.
      </p>
    )
  }

  return (
    <div
      role="region"
      aria-label={`Tabel data ${caption}`}
      tabIndex={0}
      className="mt-4 overflow-x-auto rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2"
    >
      <table className="w-full border-collapse font-interface text-sm">
        <caption className="sr-only">{caption}</caption>
        <thead>
          <tr>
            {dataset.columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className="border border-border-default/25 bg-surface-sunken p-3 text-left font-semibold"
              >
                {column.label}
                {column.unit ? <span className="font-normal"> ({column.unit})</span> : null}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {dataset.rows.map((row) => (
            <tr key={row.id}>
              {dataset.columns.map((column) => (
                <td
                  key={column.key}
                  className="border border-border-default/25 p-3 align-top"
                >
                  {evidenceValue(row.values[column.key] ?? null)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

function DatasetEvidenceBlock({
  dataset,
  context,
}: {
  dataset: StudioDatasetEvidence
  context: RenderContext
}) {
  const downloadUrl = safeHref(dataset.downloadUrl)
  return (
    <section
      aria-labelledby={`studio-dataset-${dataset.id}`}
      className="my-8 rounded-lg border border-border-default/20 bg-surface-sunken/30 p-5"
    >
      <div className="flex items-start gap-3">
        <Database aria-hidden="true" className="mt-1 shrink-0 text-text-tertiary" size={18} />
        <div className="min-w-0">
          <p className="font-interface text-kicker-lg font-semibold uppercase tracking-wider text-text-tertiary">
            Dataset
          </p>
          <h2 id={`studio-dataset-${dataset.id}`} className="mt-1 font-interface text-lg font-semibold leading-heading">
            {dataset.title}
          </h2>
        </div>
      </div>
      <EvidenceSourceLinks sourceIds={dataset.sourceIds} context={context} />
      {downloadUrl ? (
        <p className="mt-3 font-interface text-caption">
          <a
            href={downloadUrl}
            className="text-text-link underline decoration-border-accent underline-offset-4"
            rel="noreferrer noopener"
          >
            Unduh data
          </a>
          {dataset.accessedDate ? ` · Diakses ${dataset.accessedDate}` : ''}
        </p>
      ) : null}
      {dataset.methodology ? (
        <p className="mt-3 font-interface text-sm leading-relaxed text-text-secondary">
          <strong className="text-text-primary">Metodologi:</strong> {dataset.methodology}
        </p>
      ) : null}
      {dataset.limitations ? (
        <p className="mt-2 font-interface text-sm leading-relaxed text-text-secondary">
          <strong className="text-text-primary">Keterbatasan:</strong> {dataset.limitations}
        </p>
      ) : null}
      <EvidenceDataTable dataset={dataset} caption={dataset.title} />
    </section>
  )
}

function ChartEvidenceBlock({
  chart,
  context,
}: {
  chart: StudioChartEvidence
  context: RenderContext
}) {
  const dataset = chart.datasetId ? context.datasets.get(chart.datasetId) : undefined
  const downloadUrl = dataset ? safeHref(dataset.downloadUrl) : undefined
  return (
    <figure
      aria-labelledby={`studio-chart-${chart.id}`}
      className="my-9 rounded-lg border border-border-default/20 bg-surface-sunken/30 p-5"
    >
      <div className="flex items-start gap-3">
        <BarChart3 aria-hidden="true" className="mt-1 shrink-0 text-interactive-primary" size={20} />
        <div className="min-w-0">
          <p className="font-interface text-kicker-lg font-semibold uppercase tracking-wider text-text-tertiary">
            Grafik
          </p>
          <figcaption id={`studio-chart-${chart.id}`} className="mt-1 font-interface text-lg font-semibold leading-heading">
            {chart.title}
          </figcaption>
        </div>
      </div>
      {chart.summary ? (
        <p className="mt-3 font-interface text-sm leading-relaxed text-text-secondary">
          {chart.summary}
        </p>
      ) : null}
      {dataset ? (
        <>
          <p className="mt-3 font-interface text-sm leading-relaxed text-text-secondary">
            <strong className="text-text-primary">Dataset:</strong> {dataset.title}
          </p>
          <EvidenceSourceLinks sourceIds={dataset.sourceIds} context={context} />
          {downloadUrl ? (
            <p className="mt-3 font-interface text-caption">
              <a
                href={downloadUrl}
                className="text-text-link underline decoration-border-accent underline-offset-4"
                rel="noreferrer noopener"
              >
                Unduh data
              </a>
              {dataset.accessedDate ? ` · Diakses ${dataset.accessedDate}` : ''}
            </p>
          ) : null}
          {dataset.methodology ? (
            <p className="mt-3 font-interface text-sm leading-relaxed text-text-secondary">
              <strong className="text-text-primary">Metodologi:</strong> {dataset.methodology}
            </p>
          ) : null}
          {dataset.limitations ? (
            <p className="mt-2 font-interface text-sm leading-relaxed text-text-secondary">
              <strong className="text-text-primary">Keterbatasan:</strong> {dataset.limitations}
            </p>
          ) : null}
          <EvidenceDataTable dataset={dataset} caption={`Data untuk ${chart.title}`} />
        </>
      ) : (
        <p className="mt-4 font-interface text-sm text-text-secondary">Data grafik belum tersedia.</p>
      )}
    </figure>
  )
}

function renderMarkedText(text: string, marks: StudioMark[] | undefined, key: string) {
  let output: ReactNode = text

  const activeMarks = marks ?? []
  for (let index = 0; index < activeMarks.length; index += 1) {
    const mark = activeMarks[index]
    const markKey = `${key}-mark-${index}`
    switch (mark.type) {
      case 'bold':
        output = <strong key={markKey}>{output}</strong>
        break
      case 'italic':
        output = <em key={markKey}>{output}</em>
        break
      case 'strike':
        output = <s key={markKey}>{output}</s>
        break
      case 'code':
        output = (
          <code key={markKey} className="rounded bg-surface-sunken px-1.5 py-0.5 font-mono text-[0.85em]">
            {output}
          </code>
        )
        break
      case 'link': {
        const href = safeHref(mark.attrs?.href)
        output = href ? (
          <a
            key={markKey}
            href={href}
            className="text-text-link underline decoration-border-accent underline-offset-4"
            rel={href.startsWith('http') ? 'noreferrer noopener' : undefined}
          >
            {output}
          </a>
        ) : (
          <Fragment key={markKey}>{output}</Fragment>
        )
        break
      }
    }
  }

  return output
}

function renderChildren(node: StudioJsonNode, context: RenderContext, key: string) {
  return node.content?.map((child, index) =>
    renderNode(child, context, `${key}-${child.type}-${index}`)
  )
}

function renderNode(node: StudioJsonNode, context: RenderContext, key: string): ReactNode {
  const stableId = stringAttr(node, 'id') || undefined

  switch (node.type) {
    case 'doc':
      return <Fragment key={key}>{renderChildren(node, context, key)}</Fragment>
    case 'text':
      return <Fragment key={key}>{renderMarkedText(node.text ?? '', node.marks, key)}</Fragment>
    case 'paragraph':
      return (
        <p key={key} data-block-id={stableId} className="mb-5">
          {renderChildren(node, context, key)}
        </p>
      )
    case 'heading': {
      const content = renderChildren(node, context, key)
      return node.attrs?.level === 3 ? (
        <h3
          key={key}
          id={stableId}
          className="mb-3 mt-9 scroll-mt-24 font-interface text-xl font-semibold leading-heading"
        >
          {content}
        </h3>
      ) : (
        <h2
          key={key}
          id={stableId}
          className="mb-4 mt-12 scroll-mt-24 font-display text-display-sm font-semibold leading-heading"
        >
          {content}
        </h2>
      )
    }
    case 'blockquote':
      return (
        <blockquote
          key={key}
          data-block-id={stableId}
          className="my-7 border-l-2 border-border-accent pl-5 italic text-text-secondary"
        >
          {renderChildren(node, context, key)}
        </blockquote>
      )
    case 'bulletList':
      return (
        <ul key={key} data-block-id={stableId} className="mb-6 list-disc pl-7">
          {renderChildren(node, context, key)}
        </ul>
      )
    case 'orderedList':
      return (
        <ol key={key} data-block-id={stableId} className="mb-6 list-decimal pl-7">
          {renderChildren(node, context, key)}
        </ol>
      )
    case 'listItem':
      return (
        <li key={key} data-block-id={stableId} className="my-1.5 pl-1">
          {renderChildren(node, context, key)}
        </li>
      )
    case 'codeBlock':
      return (
        <pre
          key={key}
          data-block-id={stableId}
          className="my-6 overflow-x-auto rounded-lg bg-surface-inverse p-5 font-mono text-sm text-text-on-inverse"
        >
          <code>{node.content?.map((child) => child.text ?? '').join('')}</code>
        </pre>
      )
    case 'horizontalRule':
      return <hr key={key} data-block-id={stableId} className="my-10 border-border-default/25" />
    case 'hardBreak':
      return <br key={key} />
    case 'callout': {
      const tone = stringAttr(node, 'tone')
      return (
        <aside
          key={key}
          data-block-id={stableId}
          data-tone={tone}
          className="my-7 rounded-r-lg border-l-4 border-signal-info bg-signal-info-surface px-5 py-4"
        >
          <p className="mb-2 font-interface text-kicker-lg font-semibold uppercase tracking-wider text-text-secondary">
            {calloutLabel(tone)}
          </p>
          <div className="[&>p:last-child]:mb-0">{renderChildren(node, context, key)}</div>
        </aside>
      )
    }
    case 'citation': {
      const sourceId = stringAttr(node, 'sourceId')
      const label = stringAttr(node, 'label')
      const locator = stringAttr(node, 'locator')
      const source = context.sources.get(sourceId)
      const citationText = `[${label}${locator ? `, ${locator}` : ''}]`
      if (source) {
        return (
          <a
            key={key}
            href={`#${sourceAnchorId(sourceId)}`}
            data-block-id={stableId}
            className="mx-1 inline-flex rounded-full bg-signal-info-surface px-2 py-0.5 align-baseline font-interface text-xs font-medium text-interactive-primary no-underline"
            aria-label={`Sitasi ${label}: ${source.title}${locator ? `, ${locator}` : ''}`}
            title={source.title}
          >
            {citationText}
          </a>
        )
      }
      return (
        <span
          key={key}
          data-block-id={stableId}
          className="mx-1 inline-flex rounded-full bg-signal-info-surface px-2 py-0.5 align-baseline font-interface text-xs font-medium text-interactive-primary no-underline"
          aria-label={`Sitasi ${label}${locator ? `, ${locator}` : ''}`}
          title={`sourceId: ${sourceId}`}
        >
          {citationText}
        </span>
      )
    }
    case 'footnote': {
      const footnoteNumber = context.footnoteNumbers.get(stableId ?? '') ?? '?'
      return (
        <sup key={key} id={stableId} data-block-id={stableId} className="ml-0.5 font-interface text-xs font-semibold">
          <a href={`#footnote-${stableId}`} aria-label={`Buka catatan kaki ${footnoteNumber}`}>
            {footnoteNumber}
          </a>
        </sup>
      )
    }
    case 'figure': {
      const figureSource = safeHref(stringAttr(node, 'src'))
      return (
        <figure key={key} data-block-id={stableId} className="my-9">
          {figureSource ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={figureSource} alt={stringAttr(node, 'alt')} className="h-auto w-full rounded-lg" />
          ) : (
            <div
              role="img"
              aria-label={stringAttr(node, 'alt')}
              className="flex min-h-56 items-center justify-center rounded-lg border border-dashed border-border-default/30 bg-surface-sunken/55 p-8 text-center"
            >
              <div>
                <ImageIcon aria-hidden="true" className="mx-auto mb-3 text-text-tertiary" size={28} />
                <p className="font-interface text-sm text-text-secondary">{stringAttr(node, 'alt')}</p>
              </div>
            </div>
          )}
          {(stringAttr(node, 'caption') || stringAttr(node, 'credit')) && (
            <figcaption className="mt-3 font-interface text-caption text-text-secondary">
              {stringAttr(node, 'caption')}
              {stringAttr(node, 'credit') ? ` — ${stringAttr(node, 'credit')}` : ''}
            </figcaption>
          )}
        </figure>
      )
    }
    case 'equation':
      return (
        <figure key={key} data-block-id={stableId} className="my-8 rounded-lg bg-surface-sunken px-6 py-7 text-center">
          <code className="font-mono text-sm text-text-primary">{stringAttr(node, 'latex')}</code>
          {stringAttr(node, 'label') && (
            <figcaption className="mt-3 font-interface text-caption text-text-secondary">
              {stringAttr(node, 'label')}
            </figcaption>
          )}
        </figure>
      )
    case 'chartReference':
      return context.charts.has(stringAttr(node, 'chartId')) ? (
        <ChartEvidenceBlock
          key={key}
          chart={context.charts.get(stringAttr(node, 'chartId'))!}
          context={context}
        />
      ) : (
        <figure
          key={key}
          data-block-id={stableId}
          className="my-9 flex min-h-64 items-center justify-center rounded-lg border border-border-default/20 bg-surface-sunken/45 p-8 text-center"
        >
          <div>
            <BarChart3 aria-hidden="true" className="mx-auto mb-3 text-interactive-primary" size={30} />
            <p className="font-interface text-sm font-semibold">{stringAttr(node, 'title')}</p>
            <figcaption className="mt-1 font-mono text-[10px] text-text-tertiary">
              chartId: {stringAttr(node, 'chartId')}
            </figcaption>
          </div>
        </figure>
      )
    case 'datasetReference':
      return context.datasets.has(stringAttr(node, 'datasetId')) ? (
        <DatasetEvidenceBlock
          key={key}
          dataset={context.datasets.get(stringAttr(node, 'datasetId'))!}
          context={context}
        />
      ) : (
        <aside
          key={key}
          data-block-id={stableId}
          className="my-7 flex items-start gap-3 rounded-lg border border-border-default/20 px-4 py-3"
        >
          <Database aria-hidden="true" className="mt-0.5 shrink-0 text-text-tertiary" size={18} />
          <div>
            <p className="font-interface text-sm font-medium">{stringAttr(node, 'label')}</p>
            <p className="mt-1 font-mono text-[10px] text-text-tertiary">
              datasetId: {stringAttr(node, 'datasetId')}
            </p>
          </div>
        </aside>
      )
    case 'table':
      return (
        <div key={key} className="my-8 overflow-x-auto">
          <table data-block-id={stableId} className="w-full border-collapse font-interface text-sm">
            <tbody>{renderChildren(node, context, key)}</tbody>
          </table>
        </div>
      )
    case 'tableRow':
      return (
        <tr key={key} data-block-id={stableId}>
          {renderChildren(node, context, key)}
        </tr>
      )
    case 'tableHeader':
      return (
        <th
          key={key}
          data-block-id={stableId}
          scope="col"
          className="border border-border-default/25 bg-surface-sunken p-3 text-left font-semibold [&>p]:mb-0"
        >
          {renderChildren(node, context, key)}
        </th>
      )
    case 'tableCell':
      return (
        <td
          key={key}
          data-block-id={stableId}
          className="border border-border-default/25 p-3 align-top [&>p]:mb-0"
        >
          {renderChildren(node, context, key)}
        </td>
      )
  }
}

function EvidenceAppendix({
  document,
  context,
}: {
  document: StudioVersionedDocument
  context: RenderContext
}) {
  if (document.schemaVersion !== 2) return null
  const methodology = document.evidence.methodology
  if (!methodology && document.evidence.sources.length === 0) return null

  return (
    <div className="mt-14 space-y-10 border-t border-border-default/25 pt-7">
      {methodology ? (
        <section aria-labelledby="studio-methodology-title">
          <h2 id="studio-methodology-title" className="font-interface text-lg font-semibold leading-heading">
            Metodologi
          </h2>
          {methodology.summary ? (
            <p className="mt-3 font-interface text-sm leading-relaxed text-text-secondary">
              {methodology.summary}
            </p>
          ) : null}
          {methodology.limitations ? (
            <p className="mt-3 font-interface text-sm leading-relaxed text-text-secondary">
              <strong className="text-text-primary">Keterbatasan:</strong> {methodology.limitations}
            </p>
          ) : null}
          <EvidenceSourceLinks
            sourceIds={methodology.sourceIds}
            context={context}
            label="Sumber metodologi"
          />
        </section>
      ) : null}

      {document.evidence.sources.length > 0 ? (
        <section aria-labelledby="studio-sources-title">
          <h2 id="studio-sources-title" className="font-interface text-lg font-semibold leading-heading">
            Sumber
          </h2>
          <ol className="mt-4 list-decimal space-y-5 pl-6 font-interface text-sm leading-relaxed text-text-secondary">
            {document.evidence.sources.map((source) => {
              const href = safeHref(source.url)
              const metadata = sourceMetadata(source)
              return (
                <li
                  key={source.id}
                  id={sourceAnchorId(source.id)}
                  tabIndex={-1}
                  className="scroll-mt-24 pl-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-interactive-primary focus-visible:ring-offset-2"
                >
                  {href ? (
                    <a
                      href={href}
                      className="font-medium text-text-link underline decoration-border-accent underline-offset-4"
                      rel="noreferrer noopener"
                    >
                      {source.title}
                    </a>
                  ) : (
                    <span className="font-medium text-text-primary">{source.title}</span>
                  )}
                  {metadata.length > 0 ? (
                    <p className="mt-1 text-caption text-text-secondary">{metadata.join(' · ')}</p>
                  ) : null}
                  {source.note ? <p className="mt-1 text-caption text-text-secondary">{source.note}</p> : null}
                </li>
              )
            })}
          </ol>
        </section>
      ) : null}
    </div>
  )
}

function collectFootnotes(root: StudioJsonNode) {
  const footnotes: StudioJsonNode[] = []
  function visit(node: StudioJsonNode) {
    if (node.type === 'footnote') footnotes.push(node)
    node.content?.forEach(visit)
  }
  visit(root)
  return footnotes
}

export default function StudioRenderer({ document }: StudioRendererProps) {
  const validation = document.schemaVersion === 2
    ? validateStudioDocumentV2(document)
    : validateStudioDocument(document)
  if (!validation.ok) {
    return (
      <section role="alert" className="rounded-lg border border-signal-danger/30 bg-signal-danger-surface p-5 font-interface text-sm text-text-primary">
        Dokumen tidak dapat dirender karena kontraknya tidak valid.
      </section>
    )
  }

  const footnotes = collectFootnotes(document.root)
  const context: RenderContext = {
    footnoteNumbers: new Map(
      footnotes.map((node, index) => [stringAttr(node, 'id'), index + 1])
    ),
    sources: new Map(
      document.schemaVersion === 2
        ? document.evidence.sources.map((source) => [source.id, source])
        : []
    ),
    datasets: new Map(
      document.schemaVersion === 2
        ? document.evidence.datasets.map((dataset) => [dataset.id, dataset])
        : []
    ),
    charts: new Map(
      document.schemaVersion === 2
        ? document.evidence.charts.map((chart) => [chart.id, chart])
        : []
    ),
  }

  return (
    <div className="mx-auto max-w-content font-body text-body-base leading-reading text-text-primary">
      {renderNode(document.root, context, 'document-root')}
      {footnotes.length > 0 && (
        <section aria-labelledby="studio-footnotes-title" className="mt-14 border-t border-border-default/25 pt-7">
          <h2 id="studio-footnotes-title" className="font-interface text-sm font-semibold">
            Catatan kaki
          </h2>
          <ol className="mt-4 list-decimal space-y-3 pl-6 font-interface text-sm leading-relaxed text-text-secondary">
            {footnotes.map((node, index) => {
              const footnoteId = stringAttr(node, 'id')
              return (
                <li key={footnoteId} id={`footnote-${footnoteId}`}>
                  {stringAttr(node, 'note')}{' '}
                  <a href={`#${footnoteId}`} aria-label={`Kembali ke penanda catatan kaki ${index + 1}`}>
                    ↩
                  </a>
                </li>
              )
            })}
          </ol>
        </section>
      )}
      <EvidenceAppendix document={document} context={context} />
    </div>
  )
}
