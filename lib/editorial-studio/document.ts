export const STUDIO_SCHEMA_VERSION = 1 as const
export const STUDIO_LATEST_SCHEMA_VERSION = 2 as const

export const STUDIO_NODE_TYPES = [
  'doc',
  'text',
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'codeBlock',
  'horizontalRule',
  'hardBreak',
  'callout',
  'figure',
  'citation',
  'footnote',
  'equation',
  'chartReference',
  'datasetReference',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
] as const

export const STUDIO_MARK_TYPES = ['bold', 'italic', 'strike', 'code', 'link'] as const

export const STUDIO_EVIDENCE_LIMITS = {
  sources: 250,
  datasets: 20,
  charts: 20,
  columnsPerDataset: 25,
  rowsPerDataset: 1_000,
  totalDatasetCells: 20_000,
  seriesPerChart: 12,
  authorsPerSource: 20,
} as const

export type StudioSchemaVersion =
  | typeof STUDIO_SCHEMA_VERSION
  | typeof STUDIO_LATEST_SCHEMA_VERSION
export type StudioNodeType = (typeof STUDIO_NODE_TYPES)[number]
export type StudioMarkType = (typeof STUDIO_MARK_TYPES)[number]
export type StudioEvidenceIdType = 'source' | 'dataset' | 'chart' | 'row' | 'series'

export type StudioMark = {
  type: StudioMarkType
  attrs?: Record<string, unknown>
}

export type StudioJsonNode = {
  type: StudioNodeType
  attrs?: Record<string, unknown>
  content?: StudioJsonNode[]
  marks?: StudioMark[]
  text?: string
}

export type StudioArticleMetadata = {
  kind: 'article'
  articleId: string | null
  slug: string
  coverImageUrl: string | null
  category: string
  kicker: string
  coverIllustrator: string
  country: string
}

export type StudioSourceEvidence = {
  id: string
  title: string
  publisher: string
  authors: string[]
  url: string | null
  publishedDate: string | null
  accessedDate: string | null
  note: string
}

export type StudioMethodologyEvidence = {
  summary: string
  limitations: string
  sourceIds: string[]
}

export type StudioDatasetColumn = {
  key: string
  label: string
  dataType: 'string' | 'number' | 'boolean' | 'date'
  unit: string | null
}

export type StudioDatasetValue = string | number | boolean | null

export type StudioDatasetRow = {
  id: string
  values: Record<string, StudioDatasetValue>
}

export type StudioDatasetEvidence = {
  id: string
  title: string
  sourceIds: string[]
  downloadUrl: string | null
  accessedDate: string | null
  methodology: string
  limitations: string
  columns: StudioDatasetColumn[]
  rows: StudioDatasetRow[]
}

export type StudioChartSeries = {
  id: string
  columnKey: string
  label: string
}

export type StudioChartEvidence = {
  id: string
  title: string
  summary: string
  datasetId: string | null
  type: 'line' | 'bar' | 'scatter'
  xKey: string
  series: StudioChartSeries[]
}

export type StudioEvidenceRegistry = {
  sources: StudioSourceEvidence[]
  methodology: StudioMethodologyEvidence | null
  datasets: StudioDatasetEvidence[]
  charts: StudioChartEvidence[]
}

export type StudioDocumentV1 = {
  schemaVersion: typeof STUDIO_SCHEMA_VERSION
  documentId: string
  root: StudioJsonNode
  article?: StudioArticleMetadata
}

export type StudioDocumentV2 = {
  schemaVersion: typeof STUDIO_LATEST_SCHEMA_VERSION
  documentId: string
  evidence: StudioEvidenceRegistry
  root: StudioJsonNode
  article?: StudioArticleMetadata
}

export type StudioEvidenceDependencyTarget =
  | { type: 'source'; id: string }
  | { type: 'dataset'; id: string }
  | { type: 'chart'; id: string }
  | { type: 'datasetColumn'; datasetId: string; columnKey: string }

export type StudioEvidenceDependencyKind =
  | 'citation'
  | 'methodology-source'
  | 'dataset-source'
  | 'dataset-reference'
  | 'chart-dataset'
  | 'chart-reference'
  | 'chart-x-column'
  | 'chart-series-column'

export type StudioEvidenceDependency = {
  kind: StudioEvidenceDependencyKind
  path: string
  ownerId?: string
  ownerTitle?: string
}

// Alias legacy tetap v1 untuk reader dan jalur kompatibilitas yang eksplisit.
// Writer source-first memakai StudioDocumentV2 secara langsung agar perpindahan
// versi tidak terjadi diam-diam pada caller lama.
export type StudioDocument = StudioDocumentV1
export type StudioVersionedDocument = StudioDocumentV1 | StudioDocumentV2

export type StudioValidationIssue = {
  path: string
  message: string
}

export type StudioValidationResult =
  | { ok: true; document: StudioDocument }
  | { ok: false; issues: StudioValidationIssue[] }

export type StudioV2ValidationResult =
  | { ok: true; document: StudioDocumentV2 }
  | { ok: false; issues: StudioValidationIssue[] }

type StudioVersionedValidationResult =
  | { ok: true; document: StudioVersionedDocument }
  | { ok: false; issues: StudioValidationIssue[] }

export type StudioIdFactory = (
  nodeType: StudioNodeType | StudioEvidenceIdType | 'document'
) => string

const SUPPORTED_NODES = new Set<string>(STUDIO_NODE_TYPES)
const SUPPORTED_MARKS = new Set<string>(STUDIO_MARK_TYPES)
const NODES_WITH_STABLE_IDS = new Set<StudioNodeType>([
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'codeBlock',
  'horizontalRule',
  'callout',
  'figure',
  'citation',
  'footnote',
  'equation',
  'chartReference',
  'datasetReference',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
])

const ATOM_NODES = new Set<StudioNodeType>([
  'horizontalRule',
  'hardBreak',
  'figure',
  'citation',
  'footnote',
  'equation',
  'chartReference',
  'datasetReference',
])

const INLINE_NODES = new Set<StudioNodeType>(['text', 'hardBreak', 'citation', 'footnote'])
const TOP_LEVEL_BLOCKS = new Set<StudioNodeType>([
  'paragraph',
  'heading',
  'blockquote',
  'bulletList',
  'orderedList',
  'codeBlock',
  'horizontalRule',
  'callout',
  'figure',
  'equation',
  'chartReference',
  'datasetReference',
  'table',
])
// Selaras dengan content model TipTap `listItem` (`paragraph block*`).
const LIST_ITEM_BLOCKS = TOP_LEVEL_BLOCKS
const ALLOWED_CHILDREN: Partial<Record<StudioNodeType, ReadonlySet<StudioNodeType>>> = {
  doc: TOP_LEVEL_BLOCKS,
  paragraph: INLINE_NODES,
  heading: INLINE_NODES,
  blockquote: TOP_LEVEL_BLOCKS,
  bulletList: new Set<StudioNodeType>(['listItem']),
  orderedList: new Set<StudioNodeType>(['listItem']),
  listItem: LIST_ITEM_BLOCKS,
  codeBlock: new Set<StudioNodeType>(['text']),
  callout: TOP_LEVEL_BLOCKS,
  table: new Set<StudioNodeType>(['tableRow']),
  tableRow: new Set<StudioNodeType>(['tableHeader', 'tableCell']),
  tableHeader: TOP_LEVEL_BLOCKS,
  tableCell: TOP_LEVEL_BLOCKS,
}
const REQUIRES_NON_EMPTY_CONTENT = new Set<StudioNodeType>([
  'doc',
  'blockquote',
  'bulletList',
  'orderedList',
  'listItem',
  'callout',
  'table',
  'tableRow',
  'tableHeader',
  'tableCell',
])

const MAX_DOCUMENT_NODES = 20_000
const MAX_DOCUMENT_DEPTH = 64
const EVIDENCE_ID_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{2,127}$/
const DATASET_KEY_PATTERN = /^[A-Za-z][A-Za-z0-9_-]{0,63}$/
const CHART_TYPES = new Set(['line', 'bar', 'scatter'])
const DATA_TYPES = new Set(['string', 'number', 'boolean', 'date'])
const UNSAFE_DATASET_TEXT = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
}

export function findStudioEvidenceDependencies(
  document: StudioDocumentV2,
  target: StudioEvidenceDependencyTarget
): StudioEvidenceDependency[] {
  const dependencies: StudioEvidenceDependency[] = []
  const nodeStack: Array<{ node: StudioJsonNode; path: string }> = [{
    node: document.root,
    path: '$.root',
  }]

  while (nodeStack.length > 0) {
    const current = nodeStack.pop()
    if (!current) break
    const attrs = current.node.attrs ?? {}
    if (target.type === 'source' && current.node.type === 'citation' && attrs.sourceId === target.id) {
      dependencies.push({ kind: 'citation', path: `${current.path}.attrs.sourceId` })
    }
    if (
      target.type === 'dataset'
      && current.node.type === 'datasetReference'
      && attrs.datasetId === target.id
    ) {
      dependencies.push({ kind: 'dataset-reference', path: `${current.path}.attrs.datasetId` })
    }
    if (
      target.type === 'chart'
      && current.node.type === 'chartReference'
      && attrs.chartId === target.id
    ) {
      dependencies.push({ kind: 'chart-reference', path: `${current.path}.attrs.chartId` })
    }

    const children = current.node.content ?? []
    for (let index = children.length - 1; index >= 0; index -= 1) {
      nodeStack.push({ node: children[index], path: `${current.path}.content[${index}]` })
    }
  }

  if (target.type === 'source') {
    document.evidence.methodology?.sourceIds.forEach((sourceId, index) => {
      if (sourceId === target.id) {
        dependencies.push({
          kind: 'methodology-source',
          path: `$.evidence.methodology.sourceIds[${index}]`,
        })
      }
    })
    document.evidence.datasets.forEach((dataset, datasetIndex) => {
      dataset.sourceIds.forEach((sourceId, sourceIndex) => {
        if (sourceId === target.id) {
          dependencies.push({
            kind: 'dataset-source',
            path: `$.evidence.datasets[${datasetIndex}].sourceIds[${sourceIndex}]`,
            ownerId: dataset.id,
            ownerTitle: dataset.title,
          })
        }
      })
    })
  }

  if (target.type === 'dataset') {
    document.evidence.charts.forEach((chart, chartIndex) => {
      if (chart.datasetId === target.id) {
        dependencies.push({
          kind: 'chart-dataset',
          path: `$.evidence.charts[${chartIndex}].datasetId`,
          ownerId: chart.id,
          ownerTitle: chart.title,
        })
      }
    })
  }

  if (target.type === 'datasetColumn') {
    document.evidence.charts.forEach((chart, chartIndex) => {
      if (chart.datasetId !== target.datasetId) return
      if (chart.xKey === target.columnKey) {
        dependencies.push({
          kind: 'chart-x-column',
          path: `$.evidence.charts[${chartIndex}].xKey`,
          ownerId: chart.id,
          ownerTitle: chart.title,
        })
      }
      chart.series.forEach((series, seriesIndex) => {
        if (series.columnKey === target.columnKey) {
          dependencies.push({
            kind: 'chart-series-column',
            path: `$.evidence.charts[${chartIndex}].series[${seriesIndex}].columnKey`,
            ownerId: chart.id,
            ownerTitle: chart.title,
          })
        }
      })
    })
  }

  return dependencies
}

function createFallbackId() {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export const createStudioId: StudioIdFactory = (nodeType) => {
  const randomPart = globalThis.crypto?.randomUUID?.() ?? createFallbackId()
  const prefix = nodeType === 'document' ? 'doc' : nodeType
  return `${prefix}-${randomPart}`
}

export function nodeRequiresStableId(nodeType: StudioNodeType) {
  return NODES_WITH_STABLE_IDS.has(nodeType)
}

export function normalizeStudioRoot(
  input: StudioJsonNode,
  idFactory: StudioIdFactory = createStudioId,
  schemaVersion: StudioSchemaVersion = STUDIO_SCHEMA_VERSION
): StudioJsonNode {
  function visit(node: StudioJsonNode): StudioJsonNode {
    const attrs = node.attrs ? { ...node.attrs } : undefined
    const normalizedAttrs = nodeRequiresStableId(node.type)
      ? {
          ...attrs,
          id: isNonEmptyString(attrs?.id) ? attrs.id : idFactory(node.type),
          schemaVersion,
        }
      : attrs

    return {
      ...node,
      ...(normalizedAttrs && Object.keys(normalizedAttrs).length > 0
        ? { attrs: normalizedAttrs }
        : {}),
      ...(node.content ? { content: node.content.map(visit) } : {}),
      ...(node.marks
        ? { marks: node.marks.map((mark) => ({ ...mark, attrs: mark.attrs ? { ...mark.attrs } : undefined })) }
        : {}),
    }
  }

  return visit(input)
}

type CreateStudioDocumentOptions = {
  documentId?: string
  idFactory?: StudioIdFactory
  article?: StudioArticleMetadata
}

export function createStudioDocument(
  root: StudioJsonNode = { type: 'doc', content: [{ type: 'paragraph' }] },
  options: CreateStudioDocumentOptions = {}
): StudioDocumentV1 {
  const idFactory = options.idFactory ?? createStudioId
  return {
    schemaVersion: STUDIO_SCHEMA_VERSION,
    documentId: options.documentId ?? idFactory('document'),
    root: normalizeStudioRoot(root, idFactory, STUDIO_SCHEMA_VERSION),
    ...(options.article ? { article: { ...options.article } } : {}),
  }
}

export function createStudioDocumentV2(
  root: StudioJsonNode = { type: 'doc', content: [{ type: 'paragraph' }] },
  options: CreateStudioDocumentOptions & { evidence?: StudioEvidenceRegistry } = {}
): StudioDocumentV2 {
  const idFactory = options.idFactory ?? createStudioId
  return {
    schemaVersion: STUDIO_LATEST_SCHEMA_VERSION,
    documentId: options.documentId ?? idFactory('document'),
    evidence: options.evidence
      ? JSON.parse(JSON.stringify(options.evidence)) as StudioEvidenceRegistry
      : { sources: [], methodology: null, datasets: [], charts: [] },
    root: normalizeStudioRoot(root, idFactory, STUDIO_LATEST_SCHEMA_VERSION),
    ...(options.article ? { article: { ...options.article } } : {}),
  }
}

function pushIssue(
  issues: StudioValidationIssue[],
  path: string,
  message: string
) {
  if (issues.length < 100) issues.push({ path, message })
}

function validateUrl(value: unknown, path: string, issues: StudioValidationIssue[]) {
  if (!isNonEmptyString(value)) {
    pushIssue(issues, path, 'URL harus berupa string yang tidak kosong.')
    return
  }

  try {
    const parsed = new URL(value, 'https://saintifiks.com')
    if (!['http:', 'https:', 'mailto:'].includes(parsed.protocol)) {
      pushIssue(issues, path, 'Protokol URL tidak diizinkan.')
    }
  } catch {
    pushIssue(issues, path, 'Format URL tidak valid.')
  }
}

function validateHttpUrl(value: unknown, path: string, issues: StudioValidationIssue[]) {
  if (value === null) return
  if (!isNonEmptyString(value) || value.length > 2_048) {
    pushIssue(issues, path, 'URL evidence harus berupa http/https maksimal 2.048 karakter atau null.')
    return
  }
  try {
    const parsed = new URL(value)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      pushIssue(issues, path, 'URL evidence hanya mendukung protokol http atau https.')
    }
  } catch {
    pushIssue(issues, path, 'Format URL evidence tidak valid.')
  }
}

function validateRequiredString(
  attrs: Record<string, unknown>,
  key: string,
  path: string,
  issues: StudioValidationIssue[]
) {
  if (!isNonEmptyString(attrs[key])) {
    pushIssue(issues, `${path}.${key}`, `${key} wajib diisi.`)
  }
}

function validateText(
  value: unknown,
  path: string,
  limit: number,
  issues: StudioValidationIssue[],
  required = false
) {
  if (typeof value !== 'string' || value.length > limit || (required && !value.trim())) {
    pushIssue(
      issues,
      path,
      `Field harus berupa teks${required ? ' yang tidak kosong' : ''} maksimal ${limit} karakter.`
    )
  }
}

function validateIsoDate(value: unknown, path: string, issues: StudioValidationIssue[]) {
  if (value === null) return
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    pushIssue(issues, path, 'Tanggal harus memakai format YYYY-MM-DD atau null.')
    return
  }
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (
    parsed.getUTCFullYear() !== year
    || parsed.getUTCMonth() !== month - 1
    || parsed.getUTCDate() !== day
  ) {
    pushIssue(issues, path, 'Tanggal evidence tidak valid.')
  }
}

function validateEvidenceId(value: unknown, path: string, issues: StudioValidationIssue[]) {
  if (typeof value !== 'string' || !EVIDENCE_ID_PATTERN.test(value)) {
    pushIssue(issues, path, 'ID evidence harus stabil, 3–128 karakter, dan hanya memakai huruf, angka, _ atau -.')
    return null
  }
  return value
}

function validateStringIdArray(
  value: unknown,
  path: string,
  issues: StudioValidationIssue[]
) {
  if (!Array.isArray(value)) {
    pushIssue(issues, path, 'Daftar ID harus berupa array.')
    return []
  }
  const result: string[] = []
  const seen = new Set<string>()
  value.forEach((entry, index) => {
    const id = validateEvidenceId(entry, `${path}[${index}]`, issues)
    if (!id) return
    if (seen.has(id)) pushIssue(issues, `${path}[${index}]`, `ID duplikat: ${id}.`)
    seen.add(id)
    result.push(id)
  })
  return result
}

function validateArticleMetadata(value: unknown, issues: StudioValidationIssue[]) {
  if (value === undefined) return
  if (!isRecord(value) || value.kind !== 'article') {
    pushIssue(issues, '$.article', 'Metadata artikel tidak valid.')
    return
  }

  const limits: Record<string, number> = {
    slug: 220,
    category: 120,
    kicker: 240,
    coverIllustrator: 180,
    country: 120,
  }
  for (const [key, limit] of Object.entries(limits)) {
    if (typeof value[key] !== 'string' || value[key].length > limit) {
      pushIssue(issues, `$.article.${key}`, `${key} harus berupa teks maksimal ${limit} karakter.`)
    }
  }
  if (value.articleId !== null && typeof value.articleId !== 'string') {
    pushIssue(issues, '$.article.articleId', 'articleId harus berupa UUID atau null.')
  }
  if (typeof value.articleId === 'string' && !/^[0-9a-f-]{36}$/i.test(value.articleId)) {
    pushIssue(issues, '$.article.articleId', 'articleId tidak berbentuk UUID.')
  }
  if (value.coverImageUrl !== null && typeof value.coverImageUrl !== 'string') {
    pushIssue(issues, '$.article.coverImageUrl', 'coverImageUrl harus berupa URL atau null.')
  }
  if (typeof value.coverImageUrl === 'string' && value.coverImageUrl) {
    validateUrl(value.coverImageUrl, '$.article.coverImageUrl', issues)
  }
}

type EvidenceIndex = {
  sources: Map<string, Record<string, unknown>>
  datasets: Map<string, Record<string, unknown>>
  charts: Map<string, Record<string, unknown>>
}

function registerEvidenceId(
  value: unknown,
  path: string,
  target: Map<string, Record<string, unknown>>,
  record: Record<string, unknown>,
  issues: StudioValidationIssue[]
) {
  const id = validateEvidenceId(value, path, issues)
  if (!id) return null
  if (target.has(id)) pushIssue(issues, path, `ID evidence duplikat: ${id}.`)
  else target.set(id, record)
  return id
}

function validateSource(
  value: unknown,
  path: string,
  sources: EvidenceIndex['sources'],
  issues: StudioValidationIssue[]
) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'Source harus berupa objek.')
    return
  }
  registerEvidenceId(value.id, `${path}.id`, sources, value, issues)
  validateText(value.title, `${path}.title`, 300, issues, true)
  validateText(value.publisher, `${path}.publisher`, 180, issues)
  validateHttpUrl(value.url, `${path}.url`, issues)
  validateIsoDate(value.publishedDate, `${path}.publishedDate`, issues)
  validateIsoDate(value.accessedDate, `${path}.accessedDate`, issues)
  validateText(value.note, `${path}.note`, 1_000, issues)

  if (!Array.isArray(value.authors) || value.authors.length > STUDIO_EVIDENCE_LIMITS.authorsPerSource) {
    pushIssue(
      issues,
      `${path}.authors`,
      `Authors harus berupa array maksimal ${STUDIO_EVIDENCE_LIMITS.authorsPerSource} nama.`
    )
  } else {
    value.authors.forEach((author, index) => {
      validateText(author, `${path}.authors[${index}]`, 160, issues, true)
    })
  }
}

function validateDataset(
  value: unknown,
  path: string,
  datasets: EvidenceIndex['datasets'],
  issues: StudioValidationIssue[]
) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'Dataset harus berupa objek.')
    return { cells: 0 }
  }
  registerEvidenceId(value.id, `${path}.id`, datasets, value, issues)
  validateText(value.title, `${path}.title`, 300, issues, true)
  validateStringIdArray(value.sourceIds, `${path}.sourceIds`, issues)
  validateHttpUrl(value.downloadUrl, `${path}.downloadUrl`, issues)
  validateIsoDate(value.accessedDate, `${path}.accessedDate`, issues)
  validateText(value.methodology, `${path}.methodology`, 4_000, issues)
  validateText(value.limitations, `${path}.limitations`, 4_000, issues)

  const columnKeys = new Set<string>()
  const columnTypes = new Map<string, string>()
  if (!Array.isArray(value.columns) || value.columns.length > STUDIO_EVIDENCE_LIMITS.columnsPerDataset) {
    pushIssue(
      issues,
      `${path}.columns`,
      `Columns harus berupa array maksimal ${STUDIO_EVIDENCE_LIMITS.columnsPerDataset} item.`
    )
  } else {
    value.columns.forEach((column, index) => {
      const columnPath = `${path}.columns[${index}]`
      if (!isRecord(column)) {
        pushIssue(issues, columnPath, 'Column harus berupa objek.')
        return
      }
      if (typeof column.key !== 'string' || !DATASET_KEY_PATTERN.test(column.key)) {
        pushIssue(issues, `${columnPath}.key`, 'Key kolom tidak valid.')
      } else {
        if (columnKeys.has(column.key)) {
          pushIssue(issues, `${columnPath}.key`, `Key kolom duplikat: ${column.key}.`)
        }
        columnKeys.add(column.key)
        if (typeof column.dataType === 'string') columnTypes.set(column.key, column.dataType)
      }
      validateText(column.label, `${columnPath}.label`, 160, issues, true)
      if (typeof column.dataType !== 'string' || !DATA_TYPES.has(column.dataType)) {
        pushIssue(issues, `${columnPath}.dataType`, 'Tipe kolom tidak didukung.')
      }
      if (column.unit !== null) validateText(column.unit, `${columnPath}.unit`, 80, issues, true)
    })
  }

  const rowIds = new Set<string>()
  if (!Array.isArray(value.rows) || value.rows.length > STUDIO_EVIDENCE_LIMITS.rowsPerDataset) {
    pushIssue(
      issues,
      `${path}.rows`,
      `Rows harus berupa array maksimal ${STUDIO_EVIDENCE_LIMITS.rowsPerDataset} item.`
    )
    return { cells: 0 }
  }

  value.rows.forEach((row, index) => {
    const rowPath = `${path}.rows[${index}]`
    if (!isRecord(row)) {
      pushIssue(issues, rowPath, 'Row harus berupa objek.')
      return
    }
    const rowId = validateEvidenceId(row.id, `${rowPath}.id`, issues)
    if (rowId) {
      if (rowIds.has(rowId)) pushIssue(issues, `${rowPath}.id`, `ID row duplikat: ${rowId}.`)
      rowIds.add(rowId)
    }
    if (!isRecord(row.values)) {
      pushIssue(issues, `${rowPath}.values`, 'Values row harus berupa objek.')
      return
    }
    const rowValues = row.values
    columnKeys.forEach((key) => {
      if (!(key in rowValues)) {
        pushIssue(issues, `${rowPath}.values.${key}`, 'Setiap row harus memiliki seluruh key kolom.')
      }
    })
    for (const [key, cell] of Object.entries(rowValues)) {
      if (!columnKeys.has(key)) {
        pushIssue(issues, `${rowPath}.values.${key}`, 'Cell menunjuk kolom yang tidak dikenal.')
      }
      if (
        cell !== null
        && typeof cell !== 'string'
        && typeof cell !== 'number'
        && typeof cell !== 'boolean'
      ) {
        pushIssue(issues, `${rowPath}.values.${key}`, 'Nilai cell harus berupa primitive atau null.')
      } else if (typeof cell === 'number' && !Number.isFinite(cell)) {
        pushIssue(issues, `${rowPath}.values.${key}`, 'Nilai angka harus finite.')
      } else if (typeof cell === 'number' && Number.isInteger(cell) && !Number.isSafeInteger(cell)) {
        pushIssue(
          issues,
          `${rowPath}.values.${key}`,
          'Bilangan bulat terlalu besar untuk disimpan tepat; gunakan tipe string.'
        )
      } else if (typeof cell === 'string' && cell.length > 500) {
        pushIssue(issues, `${rowPath}.values.${key}`, 'Nilai teks cell maksimal 500 karakter.')
      } else if (typeof cell === 'string' && UNSAFE_DATASET_TEXT.test(cell)) {
        pushIssue(issues, `${rowPath}.values.${key}`, 'Nilai teks cell mengandung karakter kontrol.')
      }
      const expectedType = columnTypes.get(key)
      if (
        cell !== null
        && expectedType
        && (
          (expectedType === 'number' && typeof cell !== 'number')
          || (expectedType === 'boolean' && typeof cell !== 'boolean')
          || ((expectedType === 'string' || expectedType === 'date') && typeof cell !== 'string')
        )
      ) {
        pushIssue(issues, `${rowPath}.values.${key}`, `Nilai cell tidak sesuai tipe kolom ${expectedType}.`)
      } else if (expectedType === 'date' && typeof cell === 'string') {
        validateIsoDate(cell, `${rowPath}.values.${key}`, issues)
      }
    }
  })

  return { cells: columnKeys.size * value.rows.length }
}

function validateChart(
  value: unknown,
  path: string,
  charts: EvidenceIndex['charts'],
  issues: StudioValidationIssue[]
) {
  if (!isRecord(value)) {
    pushIssue(issues, path, 'Chart harus berupa objek.')
    return
  }
  registerEvidenceId(value.id, `${path}.id`, charts, value, issues)
  validateText(value.title, `${path}.title`, 300, issues, true)
  validateText(value.summary, `${path}.summary`, 2_000, issues)
  if (value.datasetId !== null) validateEvidenceId(value.datasetId, `${path}.datasetId`, issues)
  if (typeof value.type !== 'string' || !CHART_TYPES.has(value.type)) {
    pushIssue(issues, `${path}.type`, 'Tipe chart hanya mendukung line, bar, atau scatter.')
  }
  validateText(value.xKey, `${path}.xKey`, 64, issues)

  const seriesIds = new Set<string>()
  const seriesColumnKeys = new Set<string>()
  if (!Array.isArray(value.series) || value.series.length > STUDIO_EVIDENCE_LIMITS.seriesPerChart) {
    pushIssue(
      issues,
      `${path}.series`,
      `Series harus berupa array maksimal ${STUDIO_EVIDENCE_LIMITS.seriesPerChart} item.`
    )
    return
  }
  value.series.forEach((series, index) => {
    const seriesPath = `${path}.series[${index}]`
    if (!isRecord(series)) {
      pushIssue(issues, seriesPath, 'Series harus berupa objek.')
      return
    }
    const seriesId = validateEvidenceId(series.id, `${seriesPath}.id`, issues)
    if (seriesId) {
      if (seriesIds.has(seriesId)) {
        pushIssue(issues, `${seriesPath}.id`, `ID series duplikat: ${seriesId}.`)
      }
      seriesIds.add(seriesId)
    }
    validateText(series.columnKey, `${seriesPath}.columnKey`, 64, issues, true)
    if (isNonEmptyString(series.columnKey)) {
      if (seriesColumnKeys.has(series.columnKey)) {
        pushIssue(
          issues,
          `${seriesPath}.columnKey`,
          `Kolom series duplikat: ${series.columnKey}.`
        )
      }
      seriesColumnKeys.add(series.columnKey)
    }
    validateText(series.label, `${seriesPath}.label`, 160, issues, true)
  })
}

function validateEvidenceRegistry(
  value: unknown,
  issues: StudioValidationIssue[]
): EvidenceIndex {
  const index: EvidenceIndex = {
    sources: new Map(),
    datasets: new Map(),
    charts: new Map(),
  }
  if (!isRecord(value)) {
    pushIssue(issues, '$.evidence', 'Dokumen v2 wajib memiliki evidence registry.')
    return index
  }

  if (!Array.isArray(value.sources) || value.sources.length > STUDIO_EVIDENCE_LIMITS.sources) {
    pushIssue(
      issues,
      '$.evidence.sources',
      `Sources harus berupa array maksimal ${STUDIO_EVIDENCE_LIMITS.sources} item.`
    )
  } else {
    value.sources.forEach((source, sourceIndex) => {
      validateSource(source, `$.evidence.sources[${sourceIndex}]`, index.sources, issues)
    })
  }

  if (value.methodology !== null) {
    if (!isRecord(value.methodology)) {
      pushIssue(issues, '$.evidence.methodology', 'Methodology harus berupa objek atau null.')
    } else {
      validateText(value.methodology.summary, '$.evidence.methodology.summary', 4_000, issues)
      validateText(value.methodology.limitations, '$.evidence.methodology.limitations', 4_000, issues)
      validateStringIdArray(value.methodology.sourceIds, '$.evidence.methodology.sourceIds', issues)
    }
  }

  let totalCells = 0
  if (!Array.isArray(value.datasets) || value.datasets.length > STUDIO_EVIDENCE_LIMITS.datasets) {
    pushIssue(
      issues,
      '$.evidence.datasets',
      `Datasets harus berupa array maksimal ${STUDIO_EVIDENCE_LIMITS.datasets} item.`
    )
  } else {
    value.datasets.forEach((dataset, datasetIndex) => {
      const result = validateDataset(
        dataset,
        `$.evidence.datasets[${datasetIndex}]`,
        index.datasets,
        issues
      )
      totalCells += result.cells
    })
  }
  if (totalCells > STUDIO_EVIDENCE_LIMITS.totalDatasetCells) {
    pushIssue(
      issues,
      '$.evidence.datasets',
      `Total cell dataset melebihi batas ${STUDIO_EVIDENCE_LIMITS.totalDatasetCells}.`
    )
  }

  if (!Array.isArray(value.charts) || value.charts.length > STUDIO_EVIDENCE_LIMITS.charts) {
    pushIssue(
      issues,
      '$.evidence.charts',
      `Charts harus berupa array maksimal ${STUDIO_EVIDENCE_LIMITS.charts} item.`
    )
  } else {
    value.charts.forEach((chart, chartIndex) => {
      validateChart(chart, `$.evidence.charts[${chartIndex}]`, index.charts, issues)
    })
  }

  const ensureSourceIdsResolve = (sourceIds: unknown, path: string) => {
    if (!Array.isArray(sourceIds)) return
    sourceIds.forEach((sourceId, sourceIndex) => {
      if (typeof sourceId === 'string' && !index.sources.has(sourceId)) {
        pushIssue(issues, `${path}[${sourceIndex}]`, `Source tidak ditemukan: ${sourceId}.`)
      }
    })
  }

  if (isRecord(value.methodology)) {
    ensureSourceIdsResolve(value.methodology.sourceIds, '$.evidence.methodology.sourceIds')
  }
  index.datasets.forEach((dataset, datasetId) => {
    const datasetPath = `$.evidence.datasets[id=${datasetId}]`
    ensureSourceIdsResolve(dataset.sourceIds, `${datasetPath}.sourceIds`)
  })
  index.charts.forEach((chart, chartId) => {
    const chartPath = `$.evidence.charts[id=${chartId}]`
    if (typeof chart.datasetId !== 'string') return
    const dataset = index.datasets.get(chart.datasetId)
    if (!dataset) {
      pushIssue(issues, `${chartPath}.datasetId`, `Dataset tidak ditemukan: ${chart.datasetId}.`)
      return
    }
    const columns = new Map<string, Record<string, unknown>>()
    if (Array.isArray(dataset.columns)) {
      dataset.columns.filter(isRecord).forEach((column) => {
        if (typeof column.key === 'string') columns.set(column.key, column)
      })
    }
    const xColumn = typeof chart.xKey === 'string' ? columns.get(chart.xKey) : undefined
    if (typeof chart.xKey === 'string' && chart.xKey && !xColumn) {
      pushIssue(issues, `${chartPath}.xKey`, `Kolom chart tidak ditemukan: ${chart.xKey}.`)
    } else if (xColumn && typeof chart.type === 'string' && CHART_TYPES.has(chart.type)) {
      const xDataType = xColumn.dataType
      if (chart.type === 'scatter' && xDataType !== 'number') {
        pushIssue(issues, `${chartPath}.xKey`, 'Scatter memerlukan kolom angka pada sumbu X.')
      } else if (
        chart.type !== 'scatter'
        && xDataType !== 'string'
        && xDataType !== 'date'
        && xDataType !== 'number'
      ) {
        pushIssue(
          issues,
          `${chartPath}.xKey`,
          'Sumbu X line atau bar hanya menerima kolom string, date, atau number.'
        )
      }
    }
    if (Array.isArray(chart.series)) {
      const seriesUnits = new Set<string>()
      chart.series.forEach((series, seriesIndex) => {
        if (!isRecord(series) || typeof series.columnKey !== 'string') return
        const column = columns.get(series.columnKey)
        if (!column) {
          pushIssue(
            issues,
            `${chartPath}.series[${seriesIndex}].columnKey`,
            `Kolom series tidak ditemukan: ${series.columnKey}.`
          )
          return
        }
        if (column.dataType !== 'number') {
          pushIssue(
            issues,
            `${chartPath}.series[${seriesIndex}].columnKey`,
            'Series chart hanya menerima kolom number.'
          )
        }
        if (typeof column.unit === 'string' && column.unit.trim()) {
          seriesUnits.add(column.unit.trim().normalize('NFKC').toLocaleLowerCase('id-ID'))
        }
      })
      if (seriesUnits.size > 1) {
        pushIssue(
          issues,
          `${chartPath}.series`,
          'Seluruh series chart harus memakai unit yang sama; dual axis tidak didukung.'
        )
      }
    }
  })

  return index
}

function validateNodeAttributes(
  node: StudioJsonNode,
  path: string,
  issues: StudioValidationIssue[],
  schemaVersion: StudioSchemaVersion
) {
  const attrs = isRecord(node.attrs) ? node.attrs : {}

  if (nodeRequiresStableId(node.type)) {
    validateRequiredString(attrs, 'id', path, issues)
    if (attrs.schemaVersion !== schemaVersion) {
      pushIssue(issues, `${path}.schemaVersion`, `Versi node harus ${schemaVersion}.`)
    }
  }

  switch (node.type) {
    case 'heading':
      if (attrs.level !== 2 && attrs.level !== 3) {
        pushIssue(issues, `${path}.level`, 'Heading artikel hanya mendukung level 2 atau 3.')
      }
      break
    case 'callout': {
      const allowedTones = schemaVersion === STUDIO_LATEST_SCHEMA_VERSION
        ? ['note', 'context', 'warning', 'method', 'evidenceLimit', 'unknown']
        : ['note', 'context', 'warning', 'method']
      if (!allowedTones.includes(String(attrs.tone))) {
        pushIssue(issues, `${path}.tone`, 'Jenis callout tidak dikenali.')
      }
      break
    }
    case 'figure':
      validateRequiredString(attrs, 'assetId', path, issues)
      validateRequiredString(attrs, 'alt', path, issues)
      break
    case 'citation':
      validateRequiredString(attrs, 'sourceId', path, issues)
      validateRequiredString(attrs, 'label', path, issues)
      break
    case 'footnote':
      validateRequiredString(attrs, 'note', path, issues)
      break
    case 'equation':
      validateRequiredString(attrs, 'latex', path, issues)
      break
    case 'chartReference':
      validateRequiredString(attrs, 'chartId', path, issues)
      if (schemaVersion === STUDIO_SCHEMA_VERSION) validateRequiredString(attrs, 'title', path, issues)
      break
    case 'datasetReference':
      validateRequiredString(attrs, 'datasetId', path, issues)
      if (schemaVersion === STUDIO_SCHEMA_VERSION) validateRequiredString(attrs, 'label', path, issues)
      break
  }
}

function validateMark(mark: unknown, path: string, issues: StudioValidationIssue[]) {
  if (!isRecord(mark) || !isNonEmptyString(mark.type)) {
    pushIssue(issues, path, 'Mark harus memiliki type.')
    return
  }
  if (!SUPPORTED_MARKS.has(mark.type)) {
    pushIssue(issues, `${path}.type`, `Mark ${mark.type} tidak didukung.`)
    return
  }
  if (mark.type === 'link') {
    const attrs = isRecord(mark.attrs) ? mark.attrs : {}
    validateUrl(attrs.href, `${path}.attrs.href`, issues)
  }
}

function validateStudioVersionedDocument(input: unknown): StudioVersionedValidationResult {
  const issues: StudioValidationIssue[] = []
  const seenIds = new Set<string>()
  const references: Array<{ type: 'source' | 'dataset' | 'chart'; id: string; path: string }> = []
  let nodeCount = 0

  if (!isRecord(input)) {
    return { ok: false, issues: [{ path: '$', message: 'Dokumen harus berupa objek.' }] }
  }
  if (input.schemaVersion !== STUDIO_SCHEMA_VERSION && input.schemaVersion !== STUDIO_LATEST_SCHEMA_VERSION) {
    pushIssue(issues, '$.schemaVersion', 'Versi dokumen harus 1 atau 2.')
    return { ok: false, issues }
  }
  const schemaVersion = input.schemaVersion as StudioSchemaVersion
  if (!isNonEmptyString(input.documentId)) {
    pushIssue(issues, '$.documentId', 'documentId wajib diisi.')
  }
  validateArticleMetadata(input.article, issues)
  const evidenceIndex = schemaVersion === STUDIO_LATEST_SCHEMA_VERSION
    ? validateEvidenceRegistry(input.evidence, issues)
    : null

  function visit(nodeInput: unknown, path: string, depth: number) {
    nodeCount += 1
    if (nodeCount > MAX_DOCUMENT_NODES) {
      pushIssue(issues, path, `Dokumen melebihi batas ${MAX_DOCUMENT_NODES} node.`)
      return
    }
    if (depth > MAX_DOCUMENT_DEPTH) {
      pushIssue(issues, path, `Kedalaman dokumen melebihi batas ${MAX_DOCUMENT_DEPTH}.`)
      return
    }
    if (!isRecord(nodeInput) || !isNonEmptyString(nodeInput.type)) {
      pushIssue(issues, path, 'Node harus berupa objek dan memiliki type.')
      return
    }
    if (!SUPPORTED_NODES.has(nodeInput.type)) {
      pushIssue(issues, `${path}.type`, `Node ${nodeInput.type} tidak didukung.`)
      return
    }

    const node = nodeInput as StudioJsonNode
    if (node.attrs !== undefined && !isRecord(node.attrs)) {
      pushIssue(issues, `${path}.attrs`, 'attrs harus berupa objek.')
    }
    if (node.type === 'text') {
      if (typeof node.text !== 'string') pushIssue(issues, `${path}.text`, 'Node text wajib memiliki string text.')
      if (node.content !== undefined) pushIssue(issues, `${path}.content`, 'Node text tidak boleh memiliki content.')
    } else if (node.text !== undefined) {
      pushIssue(issues, `${path}.text`, 'Hanya node text yang boleh memiliki properti text.')
    }
    if (node.type !== 'text' && node.marks !== undefined) {
      pushIssue(issues, `${path}.marks`, 'Hanya node text yang boleh memiliki marks.')
    }

    validateNodeAttributes(node, `${path}.attrs`, issues, schemaVersion)
    const attrs = isRecord(node.attrs) ? node.attrs : {}
    if (schemaVersion === STUDIO_LATEST_SCHEMA_VERSION) {
      const reference = node.type === 'citation'
        ? { type: 'source' as const, id: attrs.sourceId, key: 'sourceId' }
        : node.type === 'datasetReference'
          ? { type: 'dataset' as const, id: attrs.datasetId, key: 'datasetId' }
          : node.type === 'chartReference'
            ? { type: 'chart' as const, id: attrs.chartId, key: 'chartId' }
            : null
      if (reference && typeof reference.id === 'string') {
        references.push({
          type: reference.type,
          id: reference.id,
          path: `${path}.attrs.${reference.key}`,
        })
      }
    }

    if (nodeRequiresStableId(node.type)) {
      const nodeId = attrs.id
      if (isNonEmptyString(nodeId)) {
        if (seenIds.has(nodeId)) pushIssue(issues, `${path}.attrs.id`, `ID node duplikat: ${nodeId}.`)
        seenIds.add(nodeId)
      }
    }
    if (node.marks !== undefined) {
      if (!Array.isArray(node.marks)) pushIssue(issues, `${path}.marks`, 'marks harus berupa array.')
      else node.marks.forEach((mark, index) => validateMark(mark, `${path}.marks[${index}]`, issues))
    }
    if (ATOM_NODES.has(node.type) && node.content !== undefined) {
      pushIssue(issues, `${path}.content`, `Node ${node.type} tidak boleh memiliki content.`)
      return
    }
    if (node.content !== undefined) {
      if (!Array.isArray(node.content)) {
        pushIssue(issues, `${path}.content`, 'content harus berupa array.')
      } else {
        const allowedChildren = ALLOWED_CHILDREN[node.type]
        node.content.forEach((child, index) => {
          const childType = isRecord(child) && isNonEmptyString(child.type)
            ? child.type as StudioNodeType
            : undefined
          if (allowedChildren && childType && !allowedChildren.has(childType)) {
            pushIssue(
              issues,
              `${path}.content[${index}].type`,
              `Node ${childType} tidak boleh berada langsung di dalam ${node.type}.`
            )
          }
          visit(child, `${path}.content[${index}]`, depth + 1)
        })
      }
    }
    if (REQUIRES_NON_EMPTY_CONTENT.has(node.type) && (!node.content || node.content.length === 0)) {
      pushIssue(issues, `${path}.content`, `Node ${node.type} wajib memiliki content.`)
    }
  }

  visit(input.root, '$.root', 0)
  if (isRecord(input.root) && input.root.type !== 'doc') {
    pushIssue(issues, '$.root.type', 'Root dokumen harus bertipe doc.')
  }

  if (evidenceIndex) {
    references.forEach((reference) => {
      const registry = reference.type === 'source'
        ? evidenceIndex.sources
        : reference.type === 'dataset'
          ? evidenceIndex.datasets
          : evidenceIndex.charts
      if (!registry.has(reference.id)) {
        pushIssue(issues, reference.path, `${reference.type} tidak ditemukan: ${reference.id}.`)
      }
    })
  }

  if (issues.length > 0) return { ok: false, issues }
  return { ok: true, document: input as StudioVersionedDocument }
}

export function validateStudioDocument(input: unknown): StudioValidationResult {
  const result = validateStudioVersionedDocument(input)
  if (!result.ok) return result
  if (result.document.schemaVersion !== STUDIO_SCHEMA_VERSION) {
    return {
      ok: false,
      issues: [{ path: '$.schemaVersion', message: 'Writer produksi masih memakai canonical schema v1.' }],
    }
  }
  return { ok: true, document: result.document }
}

export function validateStudioDocumentV2(input: unknown): StudioV2ValidationResult {
  const result = validateStudioVersionedDocument(input)
  if (!result.ok) return result
  if (result.document.schemaVersion !== STUDIO_LATEST_SCHEMA_VERSION) {
    return {
      ok: false,
      issues: [{ path: '$.schemaVersion', message: 'Dokumen belum memakai canonical schema v2.' }],
    }
  }
  return { ok: true, document: result.document }
}

function cloneRootToV2(root: StudioJsonNode) {
  const sources = new Map<string, StudioSourceEvidence>()
  const datasets = new Map<string, StudioDatasetEvidence>()
  const charts = new Map<string, StudioChartEvidence>()

  function visit(node: StudioJsonNode): StudioJsonNode {
    let attrs = node.attrs ? { ...node.attrs } : undefined
    if (nodeRequiresStableId(node.type)) attrs = { ...attrs, schemaVersion: STUDIO_LATEST_SCHEMA_VERSION }

    if (node.type === 'citation' && attrs) {
      const sourceId = String(attrs.sourceId ?? '')
      if (sourceId && !sources.has(sourceId)) {
        sources.set(sourceId, {
          id: sourceId,
          title: String(attrs.label ?? 'Sumber'),
          publisher: '',
          authors: [],
          url: null,
          publishedDate: null,
          accessedDate: null,
          note: '',
        })
      }
    } else if (node.type === 'datasetReference' && attrs) {
      const datasetId = String(attrs.datasetId ?? '')
      if (datasetId && !datasets.has(datasetId)) {
        datasets.set(datasetId, {
          id: datasetId,
          title: String(attrs.label ?? 'Dataset'),
          sourceIds: [],
          downloadUrl: null,
          accessedDate: null,
          methodology: '',
          limitations: '',
          columns: [],
          rows: [],
        })
      }
      const v2Attrs = { ...attrs }
      delete v2Attrs.label
      attrs = v2Attrs
    } else if (node.type === 'chartReference' && attrs) {
      const chartId = String(attrs.chartId ?? '')
      if (chartId && !charts.has(chartId)) {
        charts.set(chartId, {
          id: chartId,
          title: String(attrs.title ?? 'Grafik'),
          summary: '',
          datasetId: null,
          type: 'line',
          xKey: '',
          series: [],
        })
      }
      const v2Attrs = { ...attrs }
      delete v2Attrs.title
      attrs = v2Attrs
    }

    return {
      ...node,
      ...(attrs ? { attrs } : {}),
      ...(node.content ? { content: node.content.map(visit) } : {}),
      ...(node.marks
        ? { marks: node.marks.map((mark) => ({ ...mark, attrs: mark.attrs ? { ...mark.attrs } : undefined })) }
        : {}),
    }
  }

  return {
    root: visit(root),
    evidence: {
      sources: Array.from(sources.values()),
      methodology: null,
      datasets: Array.from(datasets.values()),
      charts: Array.from(charts.values()),
    } satisfies StudioEvidenceRegistry,
  }
}

export function migrateStudioDocument(
  input: unknown,
  idFactory: StudioIdFactory = createStudioId
): StudioValidationResult {
  if (!isRecord(input)) {
    return { ok: false, issues: [{ path: '$', message: 'Dokumen harus berupa objek.' }] }
  }
  if (input.schemaVersion === STUDIO_SCHEMA_VERSION) {
    return validateStudioDocument(input)
  }
  if (input.schemaVersion === 0) {
    const legacyRoot = isRecord(input.root)
      ? input.root as StudioJsonNode
      : { type: 'doc', content: Array.isArray(input.content) ? input.content : [] } as StudioJsonNode
    const migrated = createStudioDocument(legacyRoot, {
      documentId: isNonEmptyString(input.documentId) ? input.documentId : undefined,
      idFactory,
    })
    return validateStudioDocument(migrated)
  }
  return {
    ok: false,
    issues: [{ path: '$.schemaVersion', message: 'Versi dokumen belum memiliki jalur migrasi.' }],
  }
}

export function migrateStudioDocumentToV2(
  input: unknown,
  idFactory: StudioIdFactory = createStudioId
): StudioV2ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, issues: [{ path: '$', message: 'Dokumen harus berupa objek.' }] }
  }
  if (input.schemaVersion === STUDIO_LATEST_SCHEMA_VERSION) return validateStudioDocumentV2(input)

  const migratedToReadable = migrateStudioDocument(input, idFactory)
  if (!migratedToReadable.ok) return migratedToReadable
  if (migratedToReadable.document.schemaVersion !== STUDIO_SCHEMA_VERSION) {
    return {
      ok: false,
      issues: [{ path: '$.schemaVersion', message: 'Dokumen tidak dapat dijadikan sumber migrasi v2.' }],
    }
  }

  const migratedContent = cloneRootToV2(migratedToReadable.document.root)
  const migrated: StudioDocumentV2 = {
    schemaVersion: STUDIO_LATEST_SCHEMA_VERSION,
    documentId: migratedToReadable.document.documentId,
    evidence: migratedContent.evidence,
    root: migratedContent.root,
    ...(migratedToReadable.document.article
      ? { article: { ...migratedToReadable.document.article } }
      : {}),
  }
  return validateStudioDocumentV2(migrated)
}

export function studioDocumentsEqual(left: StudioVersionedDocument, right: StudioVersionedDocument) {
  return JSON.stringify(left) === JSON.stringify(right)
}
