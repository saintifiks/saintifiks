export const STUDIO_SCHEMA_VERSION = 1 as const

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

export type StudioNodeType = (typeof STUDIO_NODE_TYPES)[number]
export type StudioMarkType = (typeof STUDIO_MARK_TYPES)[number]

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

export type StudioDocument = {
  schemaVersion: typeof STUDIO_SCHEMA_VERSION
  documentId: string
  root: StudioJsonNode
  article?: StudioArticleMetadata
}

export type StudioValidationIssue = {
  path: string
  message: string
}

export type StudioValidationResult =
  | { ok: true; document: StudioDocument }
  | { ok: false; issues: StudioValidationIssue[] }

export type StudioIdFactory = (nodeType: StudioNodeType | 'document') => string

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
// Dengan demikian gambar, rumus, tabel, atau heading yang sah dibuat dari UI
// tidak berubah menjadi dokumen invalid hanya karena berada di dalam daftar.
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0
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
  idFactory: StudioIdFactory = createStudioId
): StudioJsonNode {
  function visit(node: StudioJsonNode): StudioJsonNode {
    const attrs = node.attrs ? { ...node.attrs } : undefined
    const normalizedAttrs = nodeRequiresStableId(node.type)
      ? {
          ...attrs,
          id: isNonEmptyString(attrs?.id) ? attrs.id : idFactory(node.type),
          schemaVersion: STUDIO_SCHEMA_VERSION,
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

export function createStudioDocument(
  root: StudioJsonNode = { type: 'doc', content: [{ type: 'paragraph' }] },
  options: {
    documentId?: string
    idFactory?: StudioIdFactory
    article?: StudioArticleMetadata
  } = {}
): StudioDocument {
  const idFactory = options.idFactory ?? createStudioId
  return {
    schemaVersion: STUDIO_SCHEMA_VERSION,
    documentId: options.documentId ?? idFactory('document'),
    root: normalizeStudioRoot(root, idFactory),
    ...(options.article ? { article: { ...options.article } } : {}),
  }
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

function validateNodeAttributes(
  node: StudioJsonNode,
  path: string,
  issues: StudioValidationIssue[]
) {
  const attrs = isRecord(node.attrs) ? node.attrs : {}

  if (nodeRequiresStableId(node.type)) {
    validateRequiredString(attrs, 'id', path, issues)
    if (attrs.schemaVersion !== STUDIO_SCHEMA_VERSION) {
      pushIssue(
        issues,
        `${path}.schemaVersion`,
        `Versi node harus ${STUDIO_SCHEMA_VERSION}.`
      )
    }
  }

  switch (node.type) {
    case 'heading':
      if (attrs.level !== 2 && attrs.level !== 3) {
        pushIssue(issues, `${path}.level`, 'Heading artikel hanya mendukung level 2 atau 3.')
      }
      break
    case 'callout':
      if (!['note', 'context', 'warning', 'method'].includes(String(attrs.tone))) {
        pushIssue(issues, `${path}.tone`, 'Jenis callout tidak dikenali.')
      }
      break
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
      validateRequiredString(attrs, 'title', path, issues)
      break
    case 'datasetReference':
      validateRequiredString(attrs, 'datasetId', path, issues)
      validateRequiredString(attrs, 'label', path, issues)
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

export function validateStudioDocument(input: unknown): StudioValidationResult {
  const issues: StudioValidationIssue[] = []
  const seenIds = new Set<string>()
  let nodeCount = 0

  if (!isRecord(input)) {
    return { ok: false, issues: [{ path: '$', message: 'Dokumen harus berupa objek.' }] }
  }

  if (input.schemaVersion !== STUDIO_SCHEMA_VERSION) {
    pushIssue(
      issues,
      '$.schemaVersion',
      `Versi dokumen harus ${STUDIO_SCHEMA_VERSION}.`
    )
  }

  if (!isNonEmptyString(input.documentId)) {
    pushIssue(issues, '$.documentId', 'documentId wajib diisi.')
  }
  validateArticleMetadata(input.article, issues)

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
      if (typeof node.text !== 'string') {
        pushIssue(issues, `${path}.text`, 'Node text wajib memiliki string text.')
      }
      if (node.content !== undefined) {
        pushIssue(issues, `${path}.content`, 'Node text tidak boleh memiliki content.')
      }
    } else if (node.text !== undefined) {
      pushIssue(issues, `${path}.text`, 'Hanya node text yang boleh memiliki properti text.')
    }

    if (node.type !== 'text' && node.marks !== undefined) {
      pushIssue(issues, `${path}.marks`, 'Hanya node text yang boleh memiliki marks.')
    }

    validateNodeAttributes(node, `${path}.attrs`, issues)

    if (nodeRequiresStableId(node.type)) {
      const nodeId = isRecord(node.attrs) ? node.attrs.id : undefined
      if (isNonEmptyString(nodeId)) {
        if (seenIds.has(nodeId)) {
          pushIssue(issues, `${path}.attrs.id`, `ID node duplikat: ${nodeId}.`)
        }
        seenIds.add(nodeId)
      }
    }

    if (node.marks !== undefined) {
      if (!Array.isArray(node.marks)) {
        pushIssue(issues, `${path}.marks`, 'marks harus berupa array.')
      } else {
        node.marks.forEach((mark, index) => validateMark(mark, `${path}.marks[${index}]`, issues))
      }
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
            ? (child.type as StudioNodeType)
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

  if (issues.length > 0) return { ok: false, issues }
  return { ok: true, document: input as StudioDocument }
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
      ? (input.root as StudioJsonNode)
      : ({ type: 'doc', content: Array.isArray(input.content) ? input.content : [] } as StudioJsonNode)
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

export function studioDocumentsEqual(left: StudioDocument, right: StudioDocument) {
  return JSON.stringify(left) === JSON.stringify(right)
}
