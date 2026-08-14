import { Extension, Node, mergeAttributes, type Editor } from '@tiptap/react'
import type { StudioJsonNode, StudioNodeType, StudioSchemaVersion } from '@/lib/editorial-studio/document'
import {
  STUDIO_SCHEMA_VERSION,
  createStudioId,
  nodeRequiresStableId,
  normalizeStudioRoot,
} from '@/lib/editorial-studio/document'

const stableNodeTypes: StudioNodeType[] = [
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
]

export const StableNodeAttributes = Extension.create({
  name: 'stableNodeAttributes',

  addGlobalAttributes() {
    return [
      {
        types: stableNodeTypes,
        attributes: {
          id: {
            default: null,
            parseHTML: (element) => element.getAttribute('data-studio-id'),
            renderHTML: (attributes) =>
              attributes.id ? { 'data-studio-id': attributes.id } : {},
          },
          schemaVersion: {
            default: STUDIO_SCHEMA_VERSION,
            parseHTML: (element) =>
              Number(element.getAttribute('data-studio-schema-version')) || STUDIO_SCHEMA_VERSION,
            renderHTML: (attributes) => ({
              'data-studio-schema-version': attributes.schemaVersion ?? STUDIO_SCHEMA_VERSION,
            }),
          },
        },
      },
    ]
  },
})

export const PreventBrowserSave = Extension.create({
  name: 'preventBrowserSave',
  addKeyboardShortcuts() {
    return { 'Mod-s': () => true }
  },
})

export const CalloutNode = Node.create({
  name: 'callout',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return { tone: { default: 'note' } }
  },

  parseHTML() {
    return [{ tag: 'aside[data-studio-callout]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'aside',
      mergeAttributes(HTMLAttributes, {
        'data-studio-callout': '',
        'data-tone': HTMLAttributes.tone,
      }),
      0,
    ]
  },
})

export const CitationNode = Node.create({
  name: 'citation',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return {
      sourceId: { default: null },
      label: { default: 'Sumber' },
      locator: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'span[data-studio-citation]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const label = node.attrs.locator
      ? `${node.attrs.label}, ${node.attrs.locator}`
      : node.attrs.label
    return [
      'span',
      mergeAttributes(HTMLAttributes, {
        'data-studio-citation': '',
        'data-source-id': node.attrs.sourceId,
        contenteditable: 'false',
      }),
      `[${label}]`,
    ]
  },

  renderText({ node }) {
    return `[${node.attrs.label}]`
  },
})

export const FootnoteNode = Node.create({
  name: 'footnote',
  group: 'inline',
  inline: true,
  atom: true,
  selectable: true,

  addAttributes() {
    return { note: { default: null } }
  },

  parseHTML() {
    return [{ tag: 'sup[data-studio-footnote]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return [
      'sup',
      mergeAttributes(HTMLAttributes, {
        'data-studio-footnote': '',
        title: node.attrs.note,
        contenteditable: 'false',
      }),
      'Catatan',
    ]
  },

  renderText() {
    return '[catatan]'
  },
})

function createReferenceNode(options: {
  name: 'figure' | 'equation' | 'chartReference' | 'datasetReference'
  tag: 'figure' | 'div'
  dataAttribute: string
  attributes: Record<string, unknown>
  label: (attrs: Record<string, unknown>) => string
}) {
  return Node.create({
    name: options.name,
    group: 'block',
    atom: true,
    selectable: true,
    draggable: true,

    addAttributes() {
      return options.attributes
    },

    parseHTML() {
      return [{ tag: `${options.tag}[${options.dataAttribute}]` }]
    },

    renderHTML({ node, HTMLAttributes }) {
      return [
        options.tag,
        mergeAttributes(HTMLAttributes, {
          [options.dataAttribute]: '',
          contenteditable: 'false',
        }),
        options.label(node.attrs),
      ]
    },
  })
}

export const FigureNode = Node.create({
  name: 'figure',
  group: 'block',
  atom: true,
  selectable: true,
  draggable: true,

  addAttributes() {
    return {
      assetId: { default: null },
      src: { default: null },
      alt: { default: null },
      caption: { default: null },
      credit: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'figure[data-studio-figure]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    const caption = [node.attrs.caption, node.attrs.credit].filter(Boolean).join(' — ')
    return [
      'figure',
      mergeAttributes(HTMLAttributes, {
        'data-studio-figure': '',
        contenteditable: 'false',
      }),
      ['img', { src: node.attrs.src, alt: node.attrs.alt ?? '' }],
      ...(caption ? [['figcaption', {}, caption]] : []),
    ]
  },
})

export const EquationNode = createReferenceNode({
  name: 'equation',
  tag: 'div',
  dataAttribute: 'data-studio-equation',
  attributes: { latex: { default: null }, label: { default: null } },
  label: (attrs) => `Rumus — ${attrs.label ?? attrs.latex ?? 'belum diisi'}`,
})

export const ChartReferenceNode = createReferenceNode({
  name: 'chartReference',
  tag: 'figure',
  dataAttribute: 'data-studio-chart',
  attributes: { chartId: { default: null }, title: { default: null } },
  label: (attrs) => `Grafik — ${attrs.title ?? 'belum diberi judul'}`,
})

export const DatasetReferenceNode = createReferenceNode({
  name: 'datasetReference',
  tag: 'div',
  dataAttribute: 'data-studio-dataset',
  attributes: { datasetId: { default: null }, label: { default: null } },
  label: (attrs) => `Dataset — ${attrs.label ?? 'belum diberi nama'}`,
})

export function createSemanticNodeAttrs(
  nodeType: StudioNodeType,
  schemaVersion: StudioSchemaVersion = STUDIO_SCHEMA_VERSION
) {
  return {
    id: createStudioId(nodeType),
    schemaVersion,
  }
}

export function ensureEditorNodeIds(
  editor: Editor,
  schemaVersion: StudioSchemaVersion = STUDIO_SCHEMA_VERSION
): StudioJsonNode {
  const currentRoot = editor.getJSON() as StudioJsonNode
  const rootWithIds = normalizeStudioRoot(currentRoot, createStudioId, schemaVersion)
  const seenIds = new Set<string>()

  function ensureUniqueIds(node: StudioJsonNode): StudioJsonNode {
    let attrs = node.attrs ? { ...node.attrs } : undefined
    if (nodeRequiresStableId(node.type)) {
      const currentId = typeof attrs?.id === 'string' ? attrs.id : ''
      if (!currentId || seenIds.has(currentId)) {
        attrs = {
          ...attrs,
          id: createStudioId(node.type),
          schemaVersion,
        }
      }
      seenIds.add(String(attrs?.id))
    }

    return {
      ...node,
      ...(attrs ? { attrs } : {}),
      ...(node.content ? { content: node.content.map(ensureUniqueIds) } : {}),
    }
  }

  const normalizedRoot = ensureUniqueIds(rootWithIds)

  if (JSON.stringify(currentRoot) !== JSON.stringify(normalizedRoot)) {
    const selection = editor.state.selection
    editor.commands.setContent(normalizedRoot, { emitUpdate: false })
    const maxPosition = Math.max(1, editor.state.doc.content.size)
    editor.commands.setTextSelection({
      from: Math.min(selection.from, maxPosition),
      to: Math.min(selection.to, maxPosition),
    })
  }

  return normalizedRoot
}
