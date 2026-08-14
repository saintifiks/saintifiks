import type {
  StudioChartEvidence,
  StudioDatasetEvidence,
  StudioDocument,
  StudioDocumentV2,
  StudioJsonNode,
  StudioSourceEvidence,
} from './document'
import { validateStudioDocument, validateStudioDocumentV2 } from './document'
import { resolveStudioChartModel } from './chart-model'

export type StudioPreflightIssue = {
  severity: 'blocker' | 'warning'
  code: string
  message: string
}

function textContent(node: StudioJsonNode): string {
  return `${node.text ?? ''}${(node.content ?? []).map(textContent).join('')}`
}

function visit(node: StudioJsonNode, callback: (node: StudioJsonNode) => void) {
  callback(node)
  node.content?.forEach((child) => visit(child, callback))
}

function preflightResult(issues: StudioPreflightIssue[]) {
  return {
    issues,
    blockers: issues.filter((issue) => issue.severity === 'blocker'),
    warnings: issues.filter((issue) => issue.severity === 'warning'),
    ok: !issues.some((issue) => issue.severity === 'blocker'),
  }
}

function commonPreflightIssues(
  title: string,
  deck: string,
  document: StudioDocument | StudioDocumentV2,
  documentIsValid: boolean
) {
  const issues: StudioPreflightIssue[] = []
  if (!documentIsValid) {
    issues.push({ severity: 'blocker', code: 'invalid-document', message: 'Kontrak dokumen belum valid.' })
  }
  if (!title.trim()) issues.push({ severity: 'blocker', code: 'missing-title', message: 'Judul artikel wajib diisi.' })
  if (!document.article?.slug.trim()) issues.push({ severity: 'blocker', code: 'missing-slug', message: 'Slug artikel wajib diisi.' })
  if (document.article?.slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(document.article.slug)) {
    issues.push({ severity: 'blocker', code: 'invalid-slug', message: 'Slug hanya boleh berisi huruf kecil, angka, dan tanda hubung.' })
  }
  if (!textContent(document.root).trim()) {
    issues.push({ severity: 'blocker', code: 'empty-body', message: 'Isi artikel belum memiliki teks.' })
  }
  if (!deck.trim()) issues.push({ severity: 'warning', code: 'missing-deck', message: 'Ringkasan kosong; kartu dan hasil pencarian akan kurang informatif.' })

  visit(document.root, (node) => {
    if (node.attrs?.legacyRawHtml === true) {
      issues.push({ severity: 'blocker', code: 'legacy-raw-html', message: 'HTML mentah dari artikel lama harus dikonversi ke blok Studio sebelum diterbitkan.' })
    }
    if (node.type === 'figure') {
      const src = String(node.attrs?.src ?? '')
      const alt = String(node.attrs?.alt ?? '')
      if (!/^https?:\/\//i.test(src)) issues.push({ severity: 'blocker', code: 'figure-source', message: 'Setiap gambar harus selesai diunggah sebelum diterbitkan.' })
      if (!alt.trim() || /belum diisi|gambar artikel/i.test(alt)) issues.push({ severity: 'blocker', code: 'figure-alt', message: 'Setiap gambar informatif memerlukan deskripsi alternatif.' })
    }
    if (node.type === 'footnote' && /catatan kaki baru/i.test(String(node.attrs?.note ?? ''))) {
      issues.push({ severity: 'blocker', code: 'footnote-placeholder', message: 'Catatan kaki placeholder harus dilengkapi.' })
    }
    if (node.type === 'equation' && /^(x\s*=\s*y)?$/i.test(String(node.attrs?.latex ?? '').trim())) {
      issues.push({ severity: 'blocker', code: 'equation-placeholder', message: 'Rumus placeholder harus dilengkapi.' })
    }
  })

  return issues
}

function isPlaceholderSource(source: StudioSourceEvidence) {
  return /^(?:sumber|source)(?:[\s_-]*\d+)?$/i.test(source.title.trim())
    || /belum (?:diisi|lengkap)|placeholder/i.test(source.title)
}

function inspectDataset(
  dataset: StudioDatasetEvidence,
  issues: StudioPreflightIssue[]
) {
  if (dataset.sourceIds.length === 0) {
    issues.push({ severity: 'blocker', code: 'dataset-source-missing', message: `Dataset “${dataset.title}” belum terhubung ke sumber.` })
  }
  if (!dataset.downloadUrl) {
    issues.push({ severity: 'warning', code: 'dataset-download-missing', message: `Dataset “${dataset.title}” belum memiliki tautan unduhan; tabel, sumber, dan metodologi tetap tersedia untuk pemeriksaan.` })
  }
  if (dataset.columns.length === 0 || dataset.rows.length === 0) {
    issues.push({ severity: 'blocker', code: 'dataset-table-missing', message: `Dataset “${dataset.title}” belum memiliki tabel data yang dapat diperiksa.` })
  }
  if (!dataset.methodology.trim()) {
    issues.push({ severity: 'blocker', code: 'dataset-methodology-missing', message: `Metodologi dataset “${dataset.title}” belum dijelaskan.` })
  }
  if (!dataset.limitations.trim()) {
    issues.push({ severity: 'warning', code: 'dataset-limitations-missing', message: `Keterbatasan dataset “${dataset.title}” belum dinyatakan.` })
  }
  if (!dataset.accessedDate) {
    issues.push({ severity: 'warning', code: 'dataset-access-date-missing', message: `Tanggal akses dataset “${dataset.title}” belum dicatat.` })
  }
  const columnsWithoutUnit = dataset.columns.filter(
    (column) => column.dataType === 'number' && !column.unit?.trim()
  )
  if (columnsWithoutUnit.length > 0) {
    issues.push({
      severity: 'blocker',
      code: 'dataset-unit-missing',
      message: `Kolom angka tanpa unit pada dataset “${dataset.title}”: ${columnsWithoutUnit.map((column) => column.label).join(', ')}.`,
    })
  }
}

function inspectChart(
  chart: StudioChartEvidence,
  dataset: StudioDatasetEvidence | undefined,
  issues: StudioPreflightIssue[]
) {
  if (!chart.summary.trim()) {
    issues.push({ severity: 'blocker', code: 'chart-summary-missing', message: `Ringkasan grafik “${chart.title}” belum diisi.` })
  }
  if (!chart.datasetId) {
    issues.push({ severity: 'blocker', code: 'chart-dataset-missing', message: `Grafik “${chart.title}” belum terhubung ke dataset.` })
    return
  }
  if (!dataset) {
    issues.push({ severity: 'blocker', code: 'chart-dataset-unresolved', message: `Dataset untuk grafik “${chart.title}” tidak ditemukan.` })
    return
  }
  if (!chart.xKey.trim() || chart.series.length === 0) {
    issues.push({ severity: 'blocker', code: 'chart-mapping-missing', message: `Mapping data grafik “${chart.title}” belum lengkap.` })
  }

  const resolved = resolveStudioChartModel(dataset, chart)
  if (resolved.ok) return
  const issuesAlreadyCovered = new Set([
    'summary-required',
    'x-column-required',
    'series-required',
  ])
  resolved.issues.forEach((issue) => {
    if (issuesAlreadyCovered.has(issue.code)) return
    issues.push({
      severity: 'blocker',
      code: `chart-${issue.code}`,
      message: `Grafik “${chart.title}”: ${issue.message}`,
    })
  })
}

export function preflightStudioArticle(title: string, deck: string, document: StudioDocument) {
  const validation = validateStudioDocument(document)
  const issues = commonPreflightIssues(title, deck, document, validation.ok)

  visit(document.root, (node) => {
    if (['citation', 'chartReference', 'datasetReference'].includes(node.type)) {
      issues.push({ severity: 'blocker', code: `future-${node.type}`, message: `Blok ${node.type} belum memiliki workflow produksi dan tidak boleh diterbitkan.` })
    }
  })

  return preflightResult(issues)
}

export function preflightStudioArticleV2(
  title: string,
  deck: string,
  document: StudioDocumentV2
) {
  const validation = validateStudioDocumentV2(document)
  const issues = commonPreflightIssues(title, deck, document, validation.ok)
  const sourceIds = new Set<string>()
  const datasetIds = new Set<string>()
  const chartIds = new Set<string>()

  visit(document.root, (node) => {
    if (node.type === 'citation') {
      sourceIds.add(String(node.attrs?.sourceId ?? ''))
    }
    if (node.type === 'datasetReference') {
      const datasetId = String(node.attrs?.datasetId ?? '')
      datasetIds.add(datasetId)
      issues.push({
        severity: 'blocker',
        code: 'future-datasetReference',
        message: 'Blok dataset belum dibuka untuk publikasi production.',
      })
    }
    if (node.type === 'chartReference') {
      const chartId = String(node.attrs?.chartId ?? '')
      chartIds.add(chartId)
      issues.push({
        severity: 'blocker',
        code: 'future-chartReference',
        message: 'Blok grafik belum dibuka untuk publikasi production.',
      })
    }
  })

  const sources = new Map(document.evidence.sources.map((source) => [source.id, source]))
  const datasets = new Map(document.evidence.datasets.map((dataset) => [dataset.id, dataset]))
  const charts = new Map(document.evidence.charts.map((chart) => [chart.id, chart]))

  chartIds.forEach((chartId) => {
    const chart = charts.get(chartId)
    if (!chart) return
    if (chart.datasetId) datasetIds.add(chart.datasetId)
    inspectChart(chart, chart.datasetId ? datasets.get(chart.datasetId) : undefined, issues)
  })

  datasetIds.forEach((datasetId) => {
    const dataset = datasets.get(datasetId)
    if (!dataset) return
    inspectDataset(dataset, issues)
    dataset.sourceIds.forEach((sourceId) => sourceIds.add(sourceId))
  })
  document.evidence.methodology?.sourceIds.forEach((sourceId) => sourceIds.add(sourceId))

  sourceIds.forEach((sourceId) => {
    const source = sources.get(sourceId)
    if (!source) return
    if (!source.url) {
      issues.push({ severity: 'blocker', code: 'source-url-missing', message: `Sumber “${source.title}” belum memiliki URL yang dapat diperiksa.` })
    }
    if (isPlaceholderSource(source)) {
      issues.push({ severity: 'blocker', code: 'source-placeholder', message: `Judul sumber “${source.title}” masih berupa placeholder.` })
    }
    if (!source.publisher.trim() && source.authors.length === 0) {
      issues.push({ severity: 'warning', code: 'source-attribution-missing', message: `Sumber “${source.title}” belum memiliki author atau publisher.` })
    }
    if (!source.accessedDate) {
      issues.push({ severity: 'warning', code: 'source-access-date-missing', message: `Tanggal akses sumber “${source.title}” belum dicatat.` })
    }
  })

  const orphanSources = document.evidence.sources.filter((source) => !sourceIds.has(source.id))
  const orphanDatasets = document.evidence.datasets.filter((dataset) => !datasetIds.has(dataset.id))
  const orphanCharts = document.evidence.charts.filter((chart) => !chartIds.has(chart.id))
  if (orphanSources.length > 0) {
    issues.push({ severity: 'warning', code: 'orphan-source', message: `${orphanSources.length} sumber belum dipakai oleh isi, metodologi, atau data.` })
  }
  if (orphanDatasets.length > 0) {
    issues.push({ severity: 'warning', code: 'orphan-dataset', message: `${orphanDatasets.length} dataset belum dirujuk oleh isi atau grafik.` })
  }
  if (orphanCharts.length > 0) {
    issues.push({ severity: 'warning', code: 'orphan-chart', message: `${orphanCharts.length} grafik belum dirujuk oleh isi.` })
  }

  const methodology = document.evidence.methodology
  if (methodology && (!methodology.summary.trim() || !methodology.limitations.trim())) {
    issues.push({
      severity: 'warning',
      code: 'methodology-metadata-incomplete',
      message: 'Metodologi sebaiknya menjelaskan ringkasan dan keterbatasan secara eksplisit.',
    })
  }

  return preflightResult(issues)
}
