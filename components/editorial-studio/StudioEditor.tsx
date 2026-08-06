'use client'

import { useEffect } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import {
  Bold,
  Braces,
  ChartNoAxesColumnIncreasing,
  Database,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  List,
  ListOrdered,
  MessageSquareQuote,
  Quote,
  Redo2,
  StickyNote,
  Undo2,
} from 'lucide-react'
import type { StudioDocument, StudioJsonNode, StudioNodeType } from '@/lib/editorial-studio/document'
import { STUDIO_SCHEMA_VERSION, createStudioId } from '@/lib/editorial-studio/document'
import {
  CalloutNode,
  ChartReferenceNode,
  CitationNode,
  DatasetReferenceNode,
  EquationNode,
  FigureNode,
  FootnoteNode,
  PreventBrowserSave,
  StableNodeAttributes,
  createSemanticNodeAttrs,
  ensureEditorNodeIds,
} from './extensions'

type StudioEditorProps = {
  document: StudioDocument
  onChange: (document: StudioDocument) => void
}

type ToolbarButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
}

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onClick={onClick}
      className={[
        'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border text-text-secondary',
        'transition-colors duration-swift focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary',
        active
          ? 'border-border-accent bg-signal-info-surface text-interactive-primary'
          : 'border-transparent hover:border-border-default/20 hover:bg-surface-sunken/70 hover:text-text-primary',
        disabled ? 'cursor-not-allowed opacity-35' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <span aria-hidden="true" className="mx-1 h-7 w-px shrink-0 bg-border-default/20" />
}

function insertCallout(editor: Editor) {
  const calloutId = createStudioId('callout')
  const paragraphId = createStudioId('paragraph')
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'callout',
      attrs: { id: calloutId, schemaVersion: STUDIO_SCHEMA_VERSION, tone: 'context' },
      content: [
        {
          type: 'paragraph',
          attrs: { id: paragraphId, schemaVersion: STUDIO_SCHEMA_VERSION },
          content: [{ type: 'text', text: 'Tambahkan konteks penting di sini.' }],
        },
      ],
    })
    .run()
}

function insertReference(editor: Editor, type: StudioNodeType) {
  const shared = createSemanticNodeAttrs(type)
  const contentByType: Partial<Record<StudioNodeType, StudioJsonNode>> = {
    citation: {
      type: 'citation',
      attrs: { ...shared, sourceId: createStudioId('citation'), label: 'Sumber baru' },
    },
    footnote: {
      type: 'footnote',
      attrs: { ...shared, note: 'Tuliskan catatan di panel properti pada fase berikutnya.' },
    },
    figure: {
      type: 'figure',
      attrs: {
        ...shared,
        assetId: createStudioId('figure'),
        alt: 'Deskripsi gambar belum diisi',
        caption: 'Keterangan gambar',
      },
    },
    equation: {
      type: 'equation',
      attrs: { ...shared, latex: 'x = y', label: 'Rumus baru' },
    },
    chartReference: {
      type: 'chartReference',
      attrs: {
        ...shared,
        chartId: createStudioId('chartReference'),
        title: 'Grafik baru',
      },
    },
    datasetReference: {
      type: 'datasetReference',
      attrs: {
        ...shared,
        datasetId: createStudioId('datasetReference'),
        label: 'Dataset baru',
      },
    },
  }
  const content = contentByType[type]
  if (!content) return
  editor.chain().focus().insertContent(content).run()
}

export default function StudioEditor({ document, onChange }: StudioEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
        link: {
          openOnClick: false,
          protocols: ['http', 'https', 'mailto'],
        },
      }),
      StableNodeAttributes,
      CalloutNode,
      CitationNode,
      FootnoteNode,
      FigureNode,
      EquationNode,
      ChartReferenceNode,
      DatasetReferenceNode,
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      PreventBrowserSave,
    ],
    content: document.root,
    editorProps: {
      attributes: {
        'aria-label': 'Isi artikel Saintifiks',
        class: 'min-h-[620px] px-5 py-8 focus:outline-none sm:px-9 lg:px-12',
      },
    },
    onCreate({ editor }) {
      ensureEditorNodeIds(editor)
    },
    onUpdate({ editor }) {
      const root = ensureEditorNodeIds(editor)
      onChange({
        schemaVersion: STUDIO_SCHEMA_VERSION,
        documentId: document.documentId,
        root,
      })
    },
  })

  useEffect(() => {
    if (!editor) return
    const current = editor.getJSON()
    if (JSON.stringify(current) !== JSON.stringify(document.root)) {
      editor.commands.setContent(document.root, { emitUpdate: false })
      ensureEditorNodeIds(editor)
    }
  }, [document.documentId, document.root, editor])

  if (!editor) {
    return (
      <div className="flex min-h-[620px] items-center justify-center text-sm text-text-tertiary">
        Menyiapkan kanvas editorial…
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-border-default/20 bg-surface-elevated shadow-xs">
      <div
        role="toolbar"
        aria-label="Pemformatan dan sisipan artikel"
        className="sticky top-0 z-raised flex items-center gap-0.5 overflow-x-auto border-b border-border-default/15 bg-surface-elevated/95 px-2 py-2 backdrop-blur sm:px-3"
      >
        <ToolbarButton
          label="Urungkan"
          disabled={!editor.can().undo()}
          onClick={() => editor.chain().focus().undo().run()}
        >
          <Undo2 aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Ulangi"
          disabled={!editor.can().redo()}
          onClick={() => editor.chain().focus().redo().run()}
        >
          <Redo2 aria-hidden="true" size={18} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton
          label="Tebal"
          active={editor.isActive('bold')}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Miring"
          active={editor.isActive('italic')}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Subjudul tingkat 2"
          active={editor.isActive('heading', { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Subjudul tingkat 3"
          active={editor.isActive('heading', { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Kutipan blok"
          active={editor.isActive('blockquote')}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Daftar poin"
          active={editor.isActive('bulletList')}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Daftar bernomor"
          active={editor.isActive('orderedList')}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered aria-hidden="true" size={18} />
        </ToolbarButton>

        <Divider />

        <ToolbarButton label="Sisipkan callout konteks" onClick={() => insertCallout(editor)}>
          <StickyNote aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Sisipkan sitasi"
          onClick={() => insertReference(editor, 'citation')}
        >
          <MessageSquareQuote aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Sisipkan catatan kaki"
          onClick={() => insertReference(editor, 'footnote')}
        >
          <Quote aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton label="Sisipkan gambar" onClick={() => insertReference(editor, 'figure')}>
          <ImageIcon aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Sisipkan grafik"
          onClick={() => insertReference(editor, 'chartReference')}
        >
          <ChartNoAxesColumnIncreasing aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Sisipkan dataset"
          onClick={() => insertReference(editor, 'datasetReference')}
        >
          <Database aria-hidden="true" size={18} />
        </ToolbarButton>
        <ToolbarButton
          label="Sisipkan rumus"
          onClick={() => insertReference(editor, 'equation')}
        >
          <Braces aria-hidden="true" size={18} />
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className={[
          'font-body text-body-base leading-reading text-text-primary',
          '[&_.ProseMirror>p]:mb-5 [&_.ProseMirror>p]:max-w-content',
          '[&_.ProseMirror>h2]:mb-4 [&_.ProseMirror>h2]:mt-12 [&_.ProseMirror>h2]:max-w-content [&_.ProseMirror>h2]:font-display [&_.ProseMirror>h2]:text-display-sm [&_.ProseMirror>h2]:font-semibold [&_.ProseMirror>h2]:leading-heading',
          '[&_.ProseMirror>h3]:mb-3 [&_.ProseMirror>h3]:mt-9 [&_.ProseMirror>h3]:max-w-content [&_.ProseMirror>h3]:font-interface [&_.ProseMirror>h3]:text-xl [&_.ProseMirror>h3]:font-semibold',
          '[&_.ProseMirror>blockquote]:my-7 [&_.ProseMirror>blockquote]:max-w-content [&_.ProseMirror>blockquote]:border-l-2 [&_.ProseMirror>blockquote]:border-border-accent [&_.ProseMirror>blockquote]:pl-5 [&_.ProseMirror>blockquote]:italic [&_.ProseMirror>blockquote]:text-text-secondary',
          '[&_.ProseMirror>ul]:mb-6 [&_.ProseMirror>ul]:max-w-content [&_.ProseMirror>ul]:list-disc [&_.ProseMirror>ul]:pl-7',
          '[&_.ProseMirror>ol]:mb-6 [&_.ProseMirror>ol]:max-w-content [&_.ProseMirror>ol]:list-decimal [&_.ProseMirror>ol]:pl-7',
          '[&_.ProseMirror_li]:my-1.5',
          '[&_.ProseMirror_pre]:my-6 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:bg-surface-inverse [&_.ProseMirror_pre]:p-5 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-sm [&_.ProseMirror_pre]:text-text-on-inverse',
          '[&_.ProseMirror_table]:my-8 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:font-interface [&_.ProseMirror_table]:text-sm',
          '[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border-default/25 [&_.ProseMirror_th]:bg-surface-sunken [&_.ProseMirror_th]:p-3 [&_.ProseMirror_th]:text-left [&_.ProseMirror_th]:font-semibold',
          '[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border-default/25 [&_.ProseMirror_td]:p-3',
          '[&_[data-studio-callout]]:my-7 [&_[data-studio-callout]]:max-w-content [&_[data-studio-callout]]:rounded-r-lg [&_[data-studio-callout]]:border-l-4 [&_[data-studio-callout]]:border-signal-info [&_[data-studio-callout]]:bg-signal-info-surface [&_[data-studio-callout]]:px-5 [&_[data-studio-callout]]:py-4',
          '[&_[data-studio-citation]]:mx-1 [&_[data-studio-citation]]:inline-flex [&_[data-studio-citation]]:cursor-default [&_[data-studio-citation]]:rounded-full [&_[data-studio-citation]]:bg-signal-info-surface [&_[data-studio-citation]]:px-2 [&_[data-studio-citation]]:py-0.5 [&_[data-studio-citation]]:font-interface [&_[data-studio-citation]]:text-xs [&_[data-studio-citation]]:font-medium [&_[data-studio-citation]]:text-interactive-primary',
          '[&_[data-studio-footnote]]:mx-0.5 [&_[data-studio-footnote]]:cursor-default [&_[data-studio-footnote]]:rounded [&_[data-studio-footnote]]:bg-surface-sunken [&_[data-studio-footnote]]:px-1.5 [&_[data-studio-footnote]]:font-interface [&_[data-studio-footnote]]:text-[10px] [&_[data-studio-footnote]]:font-semibold [&_[data-studio-footnote]]:text-text-secondary',
          '[&_[data-studio-figure]]:my-8 [&_[data-studio-figure]]:max-w-content [&_[data-studio-figure]]:rounded-lg [&_[data-studio-figure]]:border [&_[data-studio-figure]]:border-dashed [&_[data-studio-figure]]:border-border-default/30 [&_[data-studio-figure]]:bg-surface-sunken/40 [&_[data-studio-figure]]:p-8 [&_[data-studio-figure]]:font-interface [&_[data-studio-figure]]:text-sm [&_[data-studio-figure]]:text-text-secondary',
          '[&_[data-studio-chart]]:my-8 [&_[data-studio-chart]]:max-w-content [&_[data-studio-chart]]:rounded-lg [&_[data-studio-chart]]:border [&_[data-studio-chart]]:border-border-default/20 [&_[data-studio-chart]]:bg-surface-sunken/60 [&_[data-studio-chart]]:p-8 [&_[data-studio-chart]]:font-interface [&_[data-studio-chart]]:text-sm [&_[data-studio-chart]]:font-medium',
          '[&_[data-studio-dataset]]:my-6 [&_[data-studio-dataset]]:max-w-content [&_[data-studio-dataset]]:rounded-lg [&_[data-studio-dataset]]:border [&_[data-studio-dataset]]:border-border-default/20 [&_[data-studio-dataset]]:px-4 [&_[data-studio-dataset]]:py-3 [&_[data-studio-dataset]]:font-mono [&_[data-studio-dataset]]:text-xs',
          '[&_[data-studio-equation]]:my-7 [&_[data-studio-equation]]:max-w-content [&_[data-studio-equation]]:rounded-lg [&_[data-studio-equation]]:bg-surface-sunken [&_[data-studio-equation]]:p-6 [&_[data-studio-equation]]:text-center [&_[data-studio-equation]]:font-mono [&_[data-studio-equation]]:text-sm',
          '[&_.ProseMirror-selectednode]:outline [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-offset-2 [&_.ProseMirror-selectednode]:outline-interactive-primary',
        ].join(' ')}
      />
    </div>
  )
}
