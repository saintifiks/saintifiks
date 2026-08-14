'use client'

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  type CSSProperties,
  type ComponentType,
  type SVGProps,
} from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Table } from '@tiptap/extension-table'
import { TableCell } from '@tiptap/extension-table-cell'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableRow } from '@tiptap/extension-table-row'
import {
  Bold,
  Braces,
  ChevronDown,
  Code2,
  Heading2,
  Heading3,
  Image as ImageIcon,
  Italic,
  Link2,
  List,
  ListOrdered,
  MessageSquareQuote,
  Minus,
  Pilcrow,
  Quote,
  Redo2,
  RemoveFormatting,
  Sigma,
  StickyNote,
  Strikethrough,
  Table2,
  Undo2,
  Unlink,
  X,
} from 'lucide-react'
import type { StudioDocumentV2, StudioSourceEvidence } from '@/lib/editorial-studio/document'
import { STUDIO_LATEST_SCHEMA_VERSION, createStudioId } from '@/lib/editorial-studio/document'
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
import StudioImageUpload from './StudioImageUpload'

type StudioEditorProps = {
  document: StudioDocumentV2
  title: string
  deck: string
  wordCount: number
  sources: StudioSourceEvidence[]
  onChange: (document: StudioDocumentV2) => void
  onTitleChange: (title: string) => void
  onDeckChange: (deck: string) => void
}

type ConfigurableNodeType = 'figure' | 'footnote' | 'equation'

type SemanticDialogState = {
  type: ConfigurableNodeType
  position: number | null
  values: {
    src: string
    alt: string
    caption: string
    credit: string
    note: string
    latex: string
    label: string
  }
}

type CitationDialogState = {
  position: number | null
  sourceId: string
  label: string
  locator: string
}

type IconComponent = ComponentType<SVGProps<SVGSVGElement> & { size?: number | string }>

type SlashCommand = {
  id: string
  label: string
  description: string
  keywords: string
  icon: IconComponent
  run: (editor: Editor) => void
}

type SlashState = {
  from: number
  to: number
  query: string
  top: number
  left: number
}

type SelectionMenuState = {
  top: number
  left: number
}

type ToolbarButtonProps = {
  label: string
  active?: boolean
  disabled?: boolean
  onClick: () => void
  children: React.ReactNode
  compact?: boolean
}

const focusRing = 'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary'

function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
  compact = false,
}: ToolbarButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={active || undefined}
      disabled={disabled}
      onMouseDown={(event) => event.preventDefault()}
      onClick={onClick}
      className={[
        'flex shrink-0 items-center justify-center rounded-lg text-text-secondary transition-colors duration-swift',
        focusRing,
        compact ? 'h-10 w-10' : 'h-11 w-11',
        active
          ? 'bg-signal-info-surface text-interactive-primary'
          : 'hover:bg-surface-sunken hover:text-text-primary',
        disabled ? 'cursor-not-allowed opacity-35' : '',
      ].join(' ')}
    >
      {children}
    </button>
  )
}

function ToolbarDivider() {
  return <span aria-hidden="true" className="mx-1 h-7 w-px shrink-0 bg-border-default/20" />
}

function resizeTextarea(element: HTMLTextAreaElement | null) {
  if (!element) return
  element.style.height = 'auto'
  element.style.height = `${element.scrollHeight}px`
}

function AutoGrowTextarea({
  value,
  onChange,
  label,
  placeholder,
  className,
  maxLength,
}: {
  value: string
  onChange: (value: string) => void
  label: string
  placeholder: string
  className: string
  maxLength: number
}) {
  const ref = useRef<HTMLTextAreaElement>(null)

  useEffect(() => resizeTextarea(ref.current), [value])

  return (
    <label className="block">
      <span className="sr-only">{label}</span>
      <textarea
        ref={ref}
        value={value}
        rows={1}
        maxLength={maxLength}
        spellCheck
        lang="id"
        onChange={(event) => onChange(event.target.value)}
        onInput={(event) => resizeTextarea(event.currentTarget)}
        className={className}
        placeholder={placeholder}
      />
    </label>
  )
}

function insertCallout(editor: Editor) {
  const calloutId = createStudioId('callout')
  const paragraphId = createStudioId('paragraph')
  editor
    .chain()
    .focus()
    .insertContent({
      type: 'callout',
      attrs: { id: calloutId, schemaVersion: STUDIO_LATEST_SCHEMA_VERSION, tone: 'context' },
      content: [
        {
          type: 'paragraph',
          attrs: { id: paragraphId, schemaVersion: STUDIO_LATEST_SCHEMA_VERSION },
          content: [{ type: 'text', text: 'Tambahkan konteks penting di sini.' }],
        },
      ],
    })
    .run()
}

function currentBlockStyle(editor: Editor) {
  if (editor.isActive('heading', { level: 2 })) return 'heading-2'
  if (editor.isActive('heading', { level: 3 })) return 'heading-3'
  if (editor.isActive('blockquote')) return 'blockquote'
  if (editor.isActive('codeBlock')) return 'code-block'
  return 'paragraph'
}

function getSlashState(editor: Editor): SlashState | null {
  const { selection } = editor.state
  if (!selection.empty || !editor.isEditable) return null

  const { $from } = selection
  if (!$from.parent.isTextblock) return null

  const textBefore = $from.parent.textBetween(0, $from.parentOffset, undefined, '\ufffc')
  const match = textBefore.match(/(?:^|\s)\/([^\s/]*)$/)
  if (!match) return null

  const slashIndex = textBefore.lastIndexOf('/')
  const from = $from.start() + slashIndex
  const coordinates = editor.view.coordsAtPos(from)
  const menuWidth = 344
  const left = Math.max(12, Math.min(coordinates.left, window.innerWidth - menuWidth - 12))
  const estimatedHeight = 420
  const top = coordinates.bottom + estimatedHeight < window.innerHeight
    ? coordinates.bottom + 8
    : Math.max(12, coordinates.top - estimatedHeight - 8)

  return {
    from,
    to: selection.from,
    query: match[1] ?? '',
    top,
    left,
  }
}

function getSelectionMenuState(editor: Editor): SelectionMenuState | null {
  const { from, to, empty } = editor.state.selection
  if (empty || !editor.isEditable || !editor.isFocused) return null

  const start = editor.view.coordsAtPos(from)
  const end = editor.view.coordsAtPos(to)
  const menuWidth = 250
  const left = Math.max(
    12,
    Math.min((Math.min(start.left, end.left) + Math.max(start.right, end.right)) / 2 - menuWidth / 2, window.innerWidth - menuWidth - 12)
  )
  const top = Math.max(12, Math.min(start.top, end.top) - 54)
  return { top, left }
}

function normalizeLink(value: string) {
  const trimmed = value.trim()
  if (!trimmed) return null
  const candidate = /^(https?:\/\/|mailto:)/i.test(trimmed) ? trimmed : `https://${trimmed}`
  try {
    const url = new URL(candidate)
    return ['http:', 'https:', 'mailto:'].includes(url.protocol) ? candidate : null
  } catch {
    return null
  }
}

function sanitizePastedHtml(html: string) {
  if (typeof DOMParser === 'undefined') return html
  const parsed = new DOMParser().parseFromString(html, 'text/html')
  parsed.querySelectorAll('script,style,meta,link,iframe,object,embed').forEach((node) => node.remove())
  parsed.body.querySelectorAll('*').forEach((element) => {
    for (const attribute of Array.from(element.attributes)) {
      const name = attribute.name.toLowerCase()
      if (name.startsWith('on') || ['style', 'class', 'id', 'contenteditable'].includes(name)) {
        element.removeAttribute(attribute.name)
      }
    }
  })
  return parsed.body.innerHTML
}

function emptySemanticValues(): SemanticDialogState['values'] {
  return { src: '', alt: '', caption: '', credit: '', note: '', latex: '', label: '' }
}

export default function StudioEditor({
  document,
  title,
  deck,
  wordCount,
  onChange,
  onTitleChange,
  onDeckChange,
  sources,
}: StudioEditorProps) {
  const [, rerenderToolbar] = useReducer((value) => value + 1, 0)
  const [slashState, setSlashState] = useState<SlashState | null>(null)
  const [slashIndex, setSlashIndex] = useState(0)
  const [selectionMenu, setSelectionMenu] = useState<SelectionMenuState | null>(null)
  const [linkPanelOpen, setLinkPanelOpen] = useState(false)
  const [linkValue, setLinkValue] = useState('')
  const [linkError, setLinkError] = useState<string | null>(null)
  const [semanticDialog, setSemanticDialog] = useState<SemanticDialogState | null>(null)
  const [semanticError, setSemanticError] = useState<string | null>(null)
  const [citationDialog, setCitationDialog] = useState<CitationDialogState | null>(null)
  const [citationError, setCitationError] = useState<string | null>(null)
  const linkInputRef = useRef<HTMLInputElement>(null)
  const dialogRef = useRef<HTMLElement>(null)
  const slashMenuRef = useRef<HTMLDivElement>(null)
  const slashStateRef = useRef<SlashState | null>(null)
  const slashIndexRef = useRef(0)
  const filteredCommandsRef = useRef<SlashCommand[]>([])
  const editorRef = useRef<Editor | null>(null)
  const slashQueryKey = slashState ? `${slashState.from}\u0000${slashState.query}` : null
  const dialogOpen = Boolean(citationDialog || semanticDialog)

  const openSemanticDialog = useCallback((
    type: ConfigurableNodeType,
    position: number | null = null,
    attrs: Record<string, unknown> = {}
  ) => {
    setSemanticDialog({
      type,
      position,
      values: {
        ...emptySemanticValues(),
        src: typeof attrs.src === 'string' ? attrs.src : '',
        alt: typeof attrs.alt === 'string' ? attrs.alt : '',
        caption: typeof attrs.caption === 'string' ? attrs.caption : '',
        credit: typeof attrs.credit === 'string' ? attrs.credit : '',
        note: typeof attrs.note === 'string' ? attrs.note : '',
        latex: typeof attrs.latex === 'string' ? attrs.latex : '',
        label: typeof attrs.label === 'string' ? attrs.label : '',
      },
    })
    setSemanticError(null)
    setSlashState(null)
    setSelectionMenu(null)
  }, [])

  const openCitationDialog = useCallback((
    position: number | null = null,
    attrs: Record<string, unknown> = {}
  ) => {
    setCitationDialog({
      position,
      sourceId: typeof attrs.sourceId === 'string' ? attrs.sourceId : '',
      label: typeof attrs.label === 'string' ? attrs.label : '',
      locator: typeof attrs.locator === 'string' ? attrs.locator : '',
    })
    setCitationError(null)
    setSlashState(null)
    setSelectionMenu(null)
  }, [])

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
        'aria-multiline': 'true',
        'aria-autocomplete': 'list',
        'aria-haspopup': 'listbox',
        lang: 'id',
        spellcheck: 'true',
        class: 'min-h-[560px] px-0 py-3 focus:outline-none sm:min-h-[640px]',
      },
      transformPastedHTML: sanitizePastedHtml,
      handleDoubleClick(view, position) {
        const resolved = view.state.doc.resolve(position)
        const candidates = [
          { node: resolved.nodeAfter, position },
          { node: resolved.nodeBefore, position: resolved.nodeBefore ? position - resolved.nodeBefore.nodeSize : position },
        ]
        const match = candidates.find((candidate) =>
          candidate.node && ['figure', 'footnote', 'equation', 'citation'].includes(candidate.node.type.name)
        )
        if (!match?.node) return false
        if (match.node.type.name === 'citation') {
          openCitationDialog(match.position, match.node.attrs as Record<string, unknown>)
          return true
        }
        openSemanticDialog(
          match.node.type.name as ConfigurableNodeType,
          match.position,
          match.node.attrs as Record<string, unknown>
        )
        return true
      },
      handleKeyDown(_view, event) {
        const state = slashStateRef.current
        if (!state) return false
        const available = filteredCommandsRef.current

        if (event.key === 'Escape') {
          setSlashState(null)
          return true
        }
        if (event.key === 'ArrowDown' && available.length > 0) {
          setSlashIndex((current) => (current + 1) % available.length)
          return true
        }
        if (event.key === 'ArrowUp' && available.length > 0) {
          setSlashIndex((current) => (current - 1 + available.length) % available.length)
          return true
        }
        if (event.key === 'Enter' && available.length > 0) {
          const instance = editorRef.current
          const command = available[slashIndexRef.current] ?? available[0]
          if (!instance || !command) return false
          instance.chain().focus().deleteRange({ from: state.from, to: state.to }).run()
          command.run(instance)
          setSlashState(null)
          setSlashIndex(0)
          return true
        }
        return false
      },
    },
    onCreate({ editor }) {
      ensureEditorNodeIds(editor, STUDIO_LATEST_SCHEMA_VERSION)
    },
    onSelectionUpdate() {
      rerenderToolbar()
    },
    onUpdate({ editor }) {
      const root = ensureEditorNodeIds(editor, STUDIO_LATEST_SCHEMA_VERSION)
      onChange({
        ...document,
        schemaVersion: STUDIO_LATEST_SCHEMA_VERSION,
        documentId: document.documentId,
        root,
      })
    },
  })
  editorRef.current = editor

  const commands = useMemo<SlashCommand[]>(() => ([
    {
      id: 'paragraph',
      label: 'Teks',
      description: 'Paragraf biasa',
      keywords: 'teks paragraf normal body',
      icon: Pilcrow,
      run: (instance) => instance.chain().focus().setParagraph().run(),
    },
    {
      id: 'heading-2',
      label: 'Judul bagian',
      description: 'Heading utama di dalam artikel',
      keywords: 'heading h2 judul bagian subjudul',
      icon: Heading2,
      run: (instance) => instance.chain().focus().setHeading({ level: 2 }).run(),
    },
    {
      id: 'heading-3',
      label: 'Subjudul bagian',
      description: 'Heading tingkat kedua',
      keywords: 'heading h3 subjudul bagian',
      icon: Heading3,
      run: (instance) => instance.chain().focus().setHeading({ level: 3 }).run(),
    },
    {
      id: 'bullet-list',
      label: 'Daftar poin',
      description: 'Daftar tanpa urutan',
      keywords: 'bullet list daftar poin',
      icon: List,
      run: (instance) => instance.chain().focus().toggleBulletList().run(),
    },
    {
      id: 'ordered-list',
      label: 'Daftar bernomor',
      description: 'Daftar dengan urutan angka',
      keywords: 'numbered ordered list daftar angka nomor',
      icon: ListOrdered,
      run: (instance) => instance.chain().focus().toggleOrderedList().run(),
    },
    {
      id: 'blockquote',
      label: 'Kutipan',
      description: 'Kutipan blok dari narasumber',
      keywords: 'quote blockquote kutipan',
      icon: Quote,
      run: (instance) => instance.chain().focus().toggleBlockquote().run(),
    },
    {
      id: 'callout',
      label: 'Catatan konteks',
      description: 'Sorot konteks atau metode penting',
      keywords: 'callout info note konteks metode catatan',
      icon: StickyNote,
      run: insertCallout,
    },
    {
      id: 'code-block',
      label: 'Blok kode',
      description: 'Kode monospace dengan pemformatan',
      keywords: 'code block kode program',
      icon: Code2,
      run: (instance) => instance.chain().focus().setCodeBlock().run(),
    },
    {
      id: 'equation',
      label: 'Rumus',
      description: 'Referensi persamaan LaTeX terstruktur',
      keywords: 'equation formula math matematika latex rumus',
      icon: Sigma,
      run: () => openSemanticDialog('equation'),
    },
    {
      id: 'divider',
      label: 'Pemisah',
      description: 'Garis pemisah antarbab',
      keywords: 'divider horizontal rule garis pemisah',
      icon: Minus,
      run: (instance) => instance.chain().focus().setHorizontalRule().run(),
    },
    {
      id: 'footnote',
      label: 'Catatan kaki',
      description: 'Catatan yang tetap terikat pada teks',
      keywords: 'footnote note catatan kaki',
      icon: MessageSquareQuote,
      run: () => openSemanticDialog('footnote'),
    },
    {
      id: 'table',
      label: 'Tabel',
      description: 'Tabel 3 x 3 dengan baris kepala',
      keywords: 'table grid tabel data',
      icon: Table2,
      run: (instance) => instance.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      id: 'figure',
      label: 'Gambar',
      description: 'Blok referensi aset dan keterangan',
      keywords: 'image photo media figure gambar foto',
      icon: ImageIcon,
      run: () => openSemanticDialog('figure'),
    },
    {
      id: 'citation',
      label: 'Sitasi sumber',
      description: 'Referensi sumber yang dapat diverifikasi',
      keywords: 'citation source reference sitasi sumber referensi',
      icon: MessageSquareQuote,
      run: () => openCitationDialog(),
    },
  ] satisfies SlashCommand[]), [openCitationDialog, openSemanticDialog])

  const filteredCommands = useMemo(() => {
    const query = slashState?.query.trim().toLocaleLowerCase('id-ID') ?? ''
    if (!query) return commands
    return commands.filter((command) =>
      `${command.label} ${command.description} ${command.keywords}`
        .toLocaleLowerCase('id-ID')
        .includes(query)
    )
  }, [commands, slashState?.query])

  slashStateRef.current = slashState
  slashIndexRef.current = slashIndex
  filteredCommandsRef.current = filteredCommands

  const updateFloatingMenus = useCallback(() => {
    if (!editor) return
    const nextSlash = getSlashState(editor)
    setSlashState((current) => {
      if (
        current?.from === nextSlash?.from
        && current?.to === nextSlash?.to
        && current?.query === nextSlash?.query
        && current?.top === nextSlash?.top
        && current?.left === nextSlash?.left
      ) return current
      return nextSlash
    })
    setSelectionMenu(nextSlash ? null : getSelectionMenuState(editor))
  }, [editor])

  const runSlashCommand = useCallback((command: SlashCommand) => {
    if (!editor) return
    const state = slashStateRef.current
    if (!state) return
    editor.chain().focus().deleteRange({ from: state.from, to: state.to }).run()
    command.run(editor)
    setSlashState(null)
    setSlashIndex(0)
  }, [editor])

  useEffect(() => {
    if (!editor) return
    const current = editor.getJSON()
    if (JSON.stringify(current) !== JSON.stringify(document.root)) {
      editor.commands.setContent(document.root, { emitUpdate: false })
      ensureEditorNodeIds(editor, STUDIO_LATEST_SCHEMA_VERSION)
    }
  }, [document.documentId, document.root, editor])

  useEffect(() => {
    if (!editor) return
    editor.on('transaction', updateFloatingMenus)
    editor.on('focus', updateFloatingMenus)
    editor.on('blur', updateFloatingMenus)
    return () => {
      editor.off('transaction', updateFloatingMenus)
      editor.off('focus', updateFloatingMenus)
      editor.off('blur', updateFloatingMenus)
    }
  }, [editor, updateFloatingMenus])

  useEffect(() => {
    if (slashQueryKey === null) return
    setSlashIndex(0)
  }, [slashQueryKey])

  useEffect(() => {
    if (!editor) return
    const activeEditor = editor
    let frame: number | null = null

    function handleScroll(event: Event) {
      if (event.target instanceof Node && slashMenuRef.current?.contains(event.target)) return
      if (frame !== null) window.cancelAnimationFrame(frame)
      frame = window.requestAnimationFrame(() => {
        frame = null
        if (slashStateRef.current) {
          setSlashState(getSlashState(activeEditor))
          setSelectionMenu(null)
          return
        }
        setSelectionMenu(null)
      })
    }

    window.addEventListener('scroll', handleScroll, { capture: true })
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true })
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [editor])

  useEffect(() => {
    if (!slashState) return
    const selected = filteredCommands[slashIndex]
    if (!selected) return

    const frame = window.requestAnimationFrame(() => {
      globalThis.document
        .getElementById(`studio-command-${selected.id}`)
        ?.scrollIntoView({ block: 'nearest' })
    })
    return () => window.cancelAnimationFrame(frame)
  }, [filteredCommands, slashIndex, slashState])

  useEffect(() => {
    if (!editor) return
    if (slashState) {
      editor.view.dom.setAttribute('aria-expanded', 'true')
      editor.view.dom.setAttribute('aria-controls', 'studio-slash-menu')
      const selected = filteredCommands[slashIndex]
      if (selected) editor.view.dom.setAttribute('aria-activedescendant', `studio-command-${selected.id}`)
    } else {
      editor.view.dom.setAttribute('aria-expanded', 'false')
      editor.view.dom.removeAttribute('aria-controls')
      editor.view.dom.removeAttribute('aria-activedescendant')
    }
  }, [editor, filteredCommands, slashIndex, slashState])

  useEffect(() => {
    if (linkPanelOpen) window.setTimeout(() => linkInputRef.current?.focus(), 0)
  }, [linkPanelOpen])

  useEffect(() => {
    if (!dialogOpen) return
    const restoreFocusTo = globalThis.document.activeElement instanceof HTMLElement
      ? globalThis.document.activeElement
      : null
    const previousOverflow = globalThis.document.body.style.overflow
    globalThis.document.body.style.overflow = 'hidden'

    function handleDialogKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setCitationDialog(null)
        setSemanticDialog(null)
        return
      }
      if (event.key !== 'Tab' || !dialogRef.current) return
      const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
        'button:not([disabled]), select:not([disabled]), input:not([disabled]), textarea:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])'
      )
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && globalThis.document.activeElement === first) {
        event.preventDefault()
        last?.focus()
      } else if (!event.shiftKey && globalThis.document.activeElement === last) {
        event.preventDefault()
        first?.focus()
      }
    }

    globalThis.document.addEventListener('keydown', handleDialogKeyDown)
    return () => {
      globalThis.document.removeEventListener('keydown', handleDialogKeyDown)
      globalThis.document.body.style.overflow = previousOverflow
      restoreFocusTo?.focus()
    }
  }, [dialogOpen])

  if (!editor) {
    return (
      <div className="flex min-h-[720px] items-center justify-center rounded-2xl border border-border-default/15 bg-surface-elevated text-sm text-text-tertiary">
        Menyiapkan ruang tulis...
      </div>
    )
  }

  function openLinkPanel() {
    setLinkValue(String(editor?.getAttributes('link').href ?? ''))
    setLinkError(null)
    setLinkPanelOpen(true)
  }

  function applyLink() {
    if (!editor) return
    const href = normalizeLink(linkValue)
    if (!href) {
      setLinkError('Gunakan alamat http, https, atau email yang valid.')
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href }).run()
    setLinkPanelOpen(false)
    setLinkError(null)
  }

  function removeLink() {
    editor?.chain().focus().extendMarkRange('link').unsetLink().run()
    setLinkPanelOpen(false)
    setLinkError(null)
  }

  function updateSemanticValue(key: keyof SemanticDialogState['values'], value: string) {
    setSemanticDialog((current) => current ? {
      ...current,
      values: { ...current.values, [key]: value },
    } : current)
    setSemanticError(null)
  }

  function applySemanticNode() {
    if (!editor || !semanticDialog) return
    const values = semanticDialog.values
    let attrs: Record<string, unknown>

    if (semanticDialog.type === 'figure') {
      if (!/^https?:\/\//i.test(values.src)) {
        setSemanticError('Unggah gambar terlebih dahulu.')
        return
      }
      if (!values.alt.trim()) {
        setSemanticError('Deskripsi alternatif wajib diisi.')
        return
      }
      attrs = {
        src: values.src,
        alt: values.alt.trim(),
        caption: values.caption.trim(),
        credit: values.credit.trim(),
      }
    } else if (semanticDialog.type === 'footnote') {
      if (!values.note.trim()) {
        setSemanticError('Isi catatan kaki wajib diisi.')
        return
      }
      attrs = { note: values.note.trim() }
    } else {
      if (!values.latex.trim()) {
        setSemanticError('Notasi LaTeX wajib diisi.')
        return
      }
      attrs = { latex: values.latex.trim(), label: values.label.trim() }
    }

    if (semanticDialog.position !== null) {
      editor
        .chain()
        .focus()
        .setNodeSelection(semanticDialog.position)
        .updateAttributes(semanticDialog.type, attrs)
        .run()
    } else {
      const shared = createSemanticNodeAttrs(semanticDialog.type, STUDIO_LATEST_SCHEMA_VERSION)
      editor.chain().focus().insertContent({
        type: semanticDialog.type,
        attrs: {
          ...shared,
          ...(semanticDialog.type === 'figure' ? { assetId: createStudioId('figure') } : {}),
          ...attrs,
        },
      }).run()
    }
    setSemanticDialog(null)
    setSemanticError(null)
  }

  function deleteSemanticNode() {
    if (!editor || !semanticDialog || semanticDialog.position === null) return
    const node = editor.state.doc.nodeAt(semanticDialog.position)
    if (!node) return
    editor.chain().focus().deleteRange({
      from: semanticDialog.position,
      to: semanticDialog.position + node.nodeSize,
    }).run()
    setSemanticDialog(null)
  }

  function defaultCitationLabel(source: StudioSourceEvidence) {
    return source.publisher.trim() || source.authors[0]?.trim() || source.title.trim()
  }

  function selectCitationSource(sourceId: string) {
    const source = sources.find((item) => item.id === sourceId)
    setCitationDialog((current) => current ? {
      ...current,
      sourceId,
      label: source ? defaultCitationLabel(source) : '',
    } : current)
    setCitationError(null)
  }

  function applyCitationNode() {
    if (!editor || !citationDialog) return
    const source = sources.find((item) => item.id === citationDialog.sourceId)
    if (!source) {
      setCitationError('Pilih sumber yang sudah terdaftar.')
      return
    }
    const label = citationDialog.label.trim() || defaultCitationLabel(source)
    const attrs = {
      sourceId: source.id,
      label,
      locator: citationDialog.locator.trim() || null,
    }

    if (citationDialog.position !== null) {
      editor
        .chain()
        .focus()
        .setNodeSelection(citationDialog.position)
        .updateAttributes('citation', attrs)
        .run()
    } else {
      editor.chain().focus().insertContent({
        type: 'citation',
        attrs: {
          ...createSemanticNodeAttrs('citation', STUDIO_LATEST_SCHEMA_VERSION),
          ...attrs,
        },
      }).run()
    }
    setCitationDialog(null)
    setCitationError(null)
  }

  function deleteCitationNode() {
    if (!editor || !citationDialog || citationDialog.position === null) return
    const node = editor.state.doc.nodeAt(citationDialog.position)
    if (!node || node.type.name !== 'citation') return
    editor.chain().focus().deleteRange({
      from: citationDialog.position,
      to: citationDialog.position + node.nodeSize,
    }).run()
    setCitationDialog(null)
  }

  const editorIsEmpty = editor.isEmpty
  const blockStyle = currentBlockStyle(editor)
  const selectedSemanticNode = (() => {
    const position = editor.state.selection.from
    const node = editor.state.doc.nodeAt(position)
    return node && ['figure', 'footnote', 'equation'].includes(node.type.name)
      ? { type: node.type.name as ConfigurableNodeType, position, attrs: node.attrs as Record<string, unknown> }
      : null
  })()
  const selectedCitationNode = (() => {
    const position = editor.state.selection.from
    const node = editor.state.doc.nodeAt(position)
    return node?.type.name === 'citation'
      ? { position, attrs: node.attrs as Record<string, unknown> }
      : null
  })()

  return (
    <section aria-label="Ruang tulis artikel" className="relative overflow-visible rounded-2xl border border-border-default/15 bg-surface-elevated shadow-sm">
      <div className="sticky top-0 z-raised rounded-t-2xl border-b border-border-default/15 bg-surface-elevated/95 px-2 py-2 backdrop-blur sm:px-4">
        <div
          role="toolbar"
          aria-label="Pemformatan artikel"
          className="flex items-center gap-0.5 overflow-x-auto"
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

          <ToolbarDivider />

          <label className="relative shrink-0">
            <span className="sr-only">Gaya blok</span>
            <select
              aria-label="Gaya blok"
              value={blockStyle}
              onChange={(event) => {
                const value = event.target.value
                if (value === 'heading-2') editor.chain().focus().setHeading({ level: 2 }).run()
                else if (value === 'heading-3') editor.chain().focus().setHeading({ level: 3 }).run()
                else if (value === 'blockquote') editor.chain().focus().toggleBlockquote().run()
                else if (value === 'code-block') editor.chain().focus().setCodeBlock().run()
                else editor.chain().focus().setParagraph().run()
              }}
              className={`h-11 appearance-none rounded-lg border-0 bg-transparent py-2 pl-3 pr-9 font-interface text-sm font-medium text-text-primary hover:bg-surface-sunken ${focusRing}`}
            >
              <option value="paragraph">Teks</option>
              <option value="heading-2">Judul bagian</option>
              <option value="heading-3">Subjudul bagian</option>
              <option value="blockquote">Kutipan</option>
              <option value="code-block">Blok kode</option>
            </select>
            <ChevronDown aria-hidden="true" size={15} className="pointer-events-none absolute right-3 top-3.5 text-text-tertiary" />
          </label>

          <ToolbarDivider />

          <ToolbarButton label="Tebal" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold aria-hidden="true" size={18} />
          </ToolbarButton>
          <ToolbarButton label="Miring" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic aria-hidden="true" size={18} />
          </ToolbarButton>
          <ToolbarButton label="Coret" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough aria-hidden="true" size={18} />
          </ToolbarButton>
          <ToolbarButton label="Kode inline" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Code2 aria-hidden="true" size={18} />
          </ToolbarButton>
          <ToolbarButton label="Tautan" active={editor.isActive('link')} disabled={editor.state.selection.empty && !editor.isActive('link')} onClick={openLinkPanel}>
            <Link2 aria-hidden="true" size={18} />
          </ToolbarButton>

          <ToolbarDivider />

          <ToolbarButton label="Daftar poin" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}>
            <List aria-hidden="true" size={18} />
          </ToolbarButton>
          <ToolbarButton label="Daftar bernomor" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()}>
            <ListOrdered aria-hidden="true" size={18} />
          </ToolbarButton>
          <ToolbarButton label="Kutipan blok" active={editor.isActive('blockquote')} onClick={() => editor.chain().focus().toggleBlockquote().run()}>
            <Quote aria-hidden="true" size={18} />
          </ToolbarButton>
          <ToolbarButton label="Bersihkan format teks" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}>
            <RemoveFormatting aria-hidden="true" size={18} />
          </ToolbarButton>

          <span className="ml-auto hidden shrink-0 items-center gap-2 pl-4 font-interface text-xs text-text-tertiary xl:flex">
            Ketik <kbd className="rounded border border-border-default/20 bg-surface-sunken px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">/</kbd> untuk menyisipkan blok
          </span>
        </div>

        {(editor.isActive('table') || selectedSemanticNode || selectedCitationNode) && (
          <div role="toolbar" aria-label="Alat blok terpilih" className="flex flex-wrap items-center gap-1 border-t border-border-default/15 px-1 pt-2 font-interface text-xs">
            {editor.isActive('table') && (
              <>
                <button type="button" onClick={() => editor.chain().focus().addRowAfter().run()} className={`min-h-[40px] rounded-lg px-3 font-semibold text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}>Tambah baris</button>
                <button type="button" onClick={() => editor.chain().focus().addColumnAfter().run()} className={`min-h-[40px] rounded-lg px-3 font-semibold text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}>Tambah kolom</button>
                <button type="button" onClick={() => editor.chain().focus().deleteRow().run()} className={`min-h-[40px] rounded-lg px-3 font-semibold text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}>Hapus baris</button>
                <button type="button" onClick={() => editor.chain().focus().deleteColumn().run()} className={`min-h-[40px] rounded-lg px-3 font-semibold text-text-secondary hover:bg-surface-sunken hover:text-text-primary ${focusRing}`}>Hapus kolom</button>
                <button type="button" onClick={() => editor.chain().focus().deleteTable().run()} className={`min-h-[40px] rounded-lg px-3 font-semibold text-signal-danger hover:bg-signal-danger-surface ${focusRing}`}>Hapus tabel</button>
              </>
            )}
            {selectedSemanticNode && (
              <button type="button" onClick={() => openSemanticDialog(selectedSemanticNode.type, selectedSemanticNode.position, selectedSemanticNode.attrs)} className={`min-h-[40px] rounded-lg px-3 font-semibold text-interactive-primary hover:bg-signal-info-surface ${focusRing}`}>Edit blok terpilih</button>
            )}
            {selectedCitationNode && (
              <button type="button" onClick={() => openCitationDialog(selectedCitationNode.position, selectedCitationNode.attrs)} className={`min-h-[44px] rounded-lg px-3 font-semibold text-interactive-primary hover:bg-signal-info-surface ${focusRing}`}>Edit sitasi terpilih</button>
            )}
          </div>
        )}

        {linkPanelOpen && (
          <form
            onSubmit={(event) => {
              event.preventDefault()
              applyLink()
            }}
            className="absolute right-3 top-[calc(100%+8px)] z-modal w-[min(360px,calc(100vw-24px))] rounded-xl border border-border-default/20 bg-surface-elevated p-3 shadow-lg"
          >
            <div className="flex items-center justify-between gap-3">
              <label htmlFor="studio-link-input" className="font-interface text-xs font-semibold text-text-primary">Tautan</label>
              <button type="button" aria-label="Tutup pengaturan tautan" onClick={() => setLinkPanelOpen(false)} className={`flex h-10 w-10 items-center justify-center rounded-lg hover:bg-surface-sunken ${focusRing}`}>
                <X aria-hidden="true" size={17} />
              </button>
            </div>
            <input
              ref={linkInputRef}
              id="studio-link-input"
              value={linkValue}
              onChange={(event) => setLinkValue(event.target.value)}
              placeholder="https://sumber.example"
              inputMode="url"
              className={`mt-1 h-11 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 font-interface text-sm text-text-primary placeholder:text-text-tertiary ${focusRing}`}
            />
            {linkError && <p role="alert" className="mt-2 font-interface text-xs text-signal-danger">{linkError}</p>}
            <div className="mt-3 flex justify-end gap-2">
              {editor.isActive('link') && (
                <button type="button" onClick={removeLink} className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 font-interface text-xs font-semibold text-signal-danger hover:bg-signal-danger-surface ${focusRing}`}>
                  <Unlink aria-hidden="true" size={15} />
                  Hapus
                </button>
              )}
              <button type="submit" className={`min-h-[44px] rounded-lg bg-interactive-primary px-4 font-interface text-xs font-semibold text-text-on-inverse hover:bg-interactive-primary-hover ${focusRing}`}>
                Terapkan
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="mx-auto w-full max-w-[780px] px-5 pb-12 pt-10 sm:px-10 sm:pb-16 sm:pt-14 lg:px-12">
        <div className="mb-10 border-b border-border-default/15 pb-9">
          <AutoGrowTextarea
            value={title}
            onChange={onTitleChange}
            label="Judul artikel"
            placeholder="Tambahkan judul..."
            maxLength={240}
            className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-display text-[clamp(2rem,5vw,3.4rem)] font-semibold leading-[1.08] tracking-[-0.025em] text-text-primary outline-none placeholder:text-text-tertiary/55 focus:ring-0"
          />
          <div className="mt-4">
            <AutoGrowTextarea
              value={deck}
              onChange={onDeckChange}
              label="Ringkasan artikel"
              placeholder="Tambahkan ringkasan atau dek..."
              maxLength={600}
              className="w-full resize-none overflow-hidden border-0 bg-transparent p-0 font-body text-xl leading-deck text-text-secondary outline-none placeholder:text-text-tertiary/60 focus:ring-0 sm:text-2xl"
            />
          </div>
        </div>

        <div className="relative">
          {editorIsEmpty && (
            <p aria-hidden="true" className="pointer-events-none absolute left-0 top-3 font-body text-body-base text-text-tertiary/70">
              Mulai menulis, atau ketik / untuk memilih blok...
            </p>
          )}
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
              '[&_.ProseMirror_a]:text-interactive-primary [&_.ProseMirror_a]:underline [&_.ProseMirror_a]:decoration-border-accent [&_.ProseMirror_a]:underline-offset-4',
              '[&_.ProseMirror_code:not(pre_code)]:rounded [&_.ProseMirror_code:not(pre_code)]:bg-surface-sunken [&_.ProseMirror_code:not(pre_code)]:px-1.5 [&_.ProseMirror_code:not(pre_code)]:py-0.5 [&_.ProseMirror_code:not(pre_code)]:font-mono [&_.ProseMirror_code:not(pre_code)]:text-[0.88em]',
              '[&_.ProseMirror_pre]:my-6 [&_.ProseMirror_pre]:overflow-x-auto [&_.ProseMirror_pre]:rounded-lg [&_.ProseMirror_pre]:bg-surface-inverse [&_.ProseMirror_pre]:p-5 [&_.ProseMirror_pre]:font-mono [&_.ProseMirror_pre]:text-sm [&_.ProseMirror_pre]:text-text-on-inverse',
              '[&_.ProseMirror_hr]:my-10 [&_.ProseMirror_hr]:border-0 [&_.ProseMirror_hr]:border-t [&_.ProseMirror_hr]:border-border-default/25',
              '[&_.ProseMirror_table]:my-8 [&_.ProseMirror_table]:w-full [&_.ProseMirror_table]:border-collapse [&_.ProseMirror_table]:font-interface [&_.ProseMirror_table]:text-sm',
              '[&_.ProseMirror_th]:border [&_.ProseMirror_th]:border-border-default/25 [&_.ProseMirror_th]:bg-surface-sunken [&_.ProseMirror_th]:p-3 [&_.ProseMirror_th]:text-left [&_.ProseMirror_th]:font-semibold',
              '[&_.ProseMirror_td]:border [&_.ProseMirror_td]:border-border-default/25 [&_.ProseMirror_td]:p-3',
              '[&_[data-studio-callout]]:my-7 [&_[data-studio-callout]]:max-w-content [&_[data-studio-callout]]:rounded-r-lg [&_[data-studio-callout]]:border-l-4 [&_[data-studio-callout]]:border-signal-info [&_[data-studio-callout]]:bg-signal-info-surface [&_[data-studio-callout]]:px-5 [&_[data-studio-callout]]:py-4',
              '[&_[data-studio-citation]]:mx-1 [&_[data-studio-citation]]:inline-flex [&_[data-studio-citation]]:cursor-default [&_[data-studio-citation]]:rounded-full [&_[data-studio-citation]]:bg-signal-info-surface [&_[data-studio-citation]]:px-2 [&_[data-studio-citation]]:py-0.5 [&_[data-studio-citation]]:font-interface [&_[data-studio-citation]]:text-xs [&_[data-studio-citation]]:font-medium [&_[data-studio-citation]]:text-interactive-primary',
              '[&_[data-studio-footnote]]:mx-0.5 [&_[data-studio-footnote]]:cursor-default [&_[data-studio-footnote]]:rounded [&_[data-studio-footnote]]:bg-surface-sunken [&_[data-studio-footnote]]:px-1.5 [&_[data-studio-footnote]]:font-interface [&_[data-studio-footnote]]:text-[10px] [&_[data-studio-footnote]]:font-semibold [&_[data-studio-footnote]]:text-text-secondary',
              '[&_[data-studio-figure]]:my-8 [&_[data-studio-figure]]:max-w-content [&_[data-studio-figure]]:cursor-pointer [&_[data-studio-figure]]:overflow-hidden [&_[data-studio-figure]]:rounded-xl [&_[data-studio-figure]]:border [&_[data-studio-figure]]:border-border-default/25 [&_[data-studio-figure]]:bg-surface-sunken/40 [&_[data-studio-figure]]:font-interface [&_[data-studio-figure]]:text-sm [&_[data-studio-figure]]:text-text-secondary',
              '[&_[data-studio-figure]_img]:h-auto [&_[data-studio-figure]_img]:w-full [&_[data-studio-figure]_img]:object-cover',
              '[&_[data-studio-figure]_figcaption]:px-4 [&_[data-studio-figure]_figcaption]:py-3 [&_[data-studio-figure]_figcaption]:text-left [&_[data-studio-figure]_figcaption]:text-xs',
              '[&_[data-studio-chart]]:my-8 [&_[data-studio-chart]]:max-w-content [&_[data-studio-chart]]:rounded-xl [&_[data-studio-chart]]:border [&_[data-studio-chart]]:border-border-default/20 [&_[data-studio-chart]]:bg-surface-sunken/60 [&_[data-studio-chart]]:p-10 [&_[data-studio-chart]]:text-center [&_[data-studio-chart]]:font-interface [&_[data-studio-chart]]:text-sm [&_[data-studio-chart]]:font-medium',
              '[&_[data-studio-dataset]]:my-6 [&_[data-studio-dataset]]:max-w-content [&_[data-studio-dataset]]:rounded-lg [&_[data-studio-dataset]]:border [&_[data-studio-dataset]]:border-border-default/20 [&_[data-studio-dataset]]:px-4 [&_[data-studio-dataset]]:py-3 [&_[data-studio-dataset]]:font-mono [&_[data-studio-dataset]]:text-xs',
              '[&_[data-studio-equation]]:my-7 [&_[data-studio-equation]]:max-w-content [&_[data-studio-equation]]:rounded-lg [&_[data-studio-equation]]:bg-surface-sunken [&_[data-studio-equation]]:p-6 [&_[data-studio-equation]]:text-center [&_[data-studio-equation]]:font-mono [&_[data-studio-equation]]:text-sm',
              '[&_.ProseMirror-selectednode]:outline [&_.ProseMirror-selectednode]:outline-2 [&_.ProseMirror-selectednode]:outline-offset-2 [&_.ProseMirror-selectednode]:outline-interactive-primary',
            ].join(' ')}
          />
        </div>

        <footer className="mt-8 flex flex-wrap items-center justify-between gap-3 border-t border-border-default/15 pt-4 font-interface text-xs text-text-tertiary">
          <span>{wordCount.toLocaleString('id-ID')} kata</span>
          <span>Markdown tidak diperlukan</span>
        </footer>
      </div>

      {selectionMenu && (
        <div
          role="toolbar"
          aria-label="Format teks terpilih"
          style={{ top: selectionMenu.top, left: selectionMenu.left } as CSSProperties}
          className="fixed z-modal flex items-center gap-0.5 rounded-xl border border-border-default/20 bg-surface-inverse p-1.5 text-text-on-inverse shadow-lg"
        >
          <ToolbarButton compact label="Tebal" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}>
            <Bold aria-hidden="true" size={17} />
          </ToolbarButton>
          <ToolbarButton compact label="Miring" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}>
            <Italic aria-hidden="true" size={17} />
          </ToolbarButton>
          <ToolbarButton compact label="Coret" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()}>
            <Strikethrough aria-hidden="true" size={17} />
          </ToolbarButton>
          <ToolbarButton compact label="Kode inline" active={editor.isActive('code')} onClick={() => editor.chain().focus().toggleCode().run()}>
            <Braces aria-hidden="true" size={17} />
          </ToolbarButton>
          <ToolbarButton compact label="Tautan" active={editor.isActive('link')} onClick={openLinkPanel}>
            <Link2 aria-hidden="true" size={17} />
          </ToolbarButton>
        </div>
      )}

      {slashState && (
        <div
          ref={slashMenuRef}
          id="studio-slash-menu"
          role="listbox"
          aria-label="Sisipkan blok"
          style={{ top: slashState.top, left: slashState.left } as CSSProperties}
          className="fixed z-modal flex max-h-[calc(100dvh-24px)] w-[min(344px,calc(100vw-24px))] flex-col overflow-hidden rounded-xl border border-border-default/20 bg-surface-elevated shadow-lg"
        >
          <div className="shrink-0 border-b border-border-default/15 px-4 py-3">
            <p className="font-interface text-xs font-semibold text-text-primary">
              {slashState.query ? `Hasil untuk "${slashState.query}"` : 'Sisipkan blok'}
            </p>
            <p className="mt-0.5 font-interface text-[11px] text-text-tertiary">Panah untuk memilih | Enter untuk menyisipkan | Esc untuk menutup</p>
          </div>
          <div className="min-h-0 max-h-[356px] flex-1 touch-pan-y overflow-y-auto overscroll-contain p-2 [scrollbar-gutter:stable]">
            {filteredCommands.length > 0 ? filteredCommands.map((command, index) => {
              const Icon = command.icon
              const selected = index === slashIndex
              return (
                <button
                  key={command.id}
                  id={`studio-command-${command.id}`}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setSlashIndex(index)}
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => runSlashCommand(command)}
                  className={[
                    'flex min-h-[58px] w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors',
                    focusRing,
                    selected ? 'bg-signal-info-surface' : 'hover:bg-surface-sunken',
                  ].join(' ')}
                >
                  <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border ${selected ? 'border-border-accent/35 bg-surface-elevated text-interactive-primary' : 'border-border-default/15 bg-surface-sunken text-text-secondary'}`}>
                    <Icon aria-hidden="true" size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-interface text-sm font-semibold text-text-primary">{command.label}</span>
                    <span className="block truncate font-interface text-xs text-text-tertiary">{command.description}</span>
                  </span>
                </button>
              )
            }) : (
              <p className="px-3 py-8 text-center font-interface text-sm text-text-secondary">Tidak ada blok yang cocok.</p>
            )}
          </div>
        </div>
      )}

      {citationDialog && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-8">
          <button type="button" aria-label="Tutup pengaturan sitasi" onClick={() => setCitationDialog(null)} className="absolute inset-0 bg-surface-overlay/60" />
          <section ref={dialogRef} role="dialog" aria-modal="true" aria-labelledby="studio-citation-dialog-title" className="relative z-base max-h-[min(680px,calc(100dvh-32px))] w-full max-w-[620px] overflow-y-auto rounded-2xl border border-border-default/20 bg-surface-elevated p-5 shadow-lg sm:p-7">
            <header className="flex items-start justify-between gap-4">
              <div>
                <h2 id="studio-citation-dialog-title" className="font-interface text-lg font-semibold text-text-primary">{citationDialog.position === null ? 'Sisipkan sitasi' : 'Edit sitasi'}</h2>
                <p className="mt-1 font-interface text-xs leading-relaxed text-text-tertiary">Sitasi harus menunjuk satu sumber nyata dari registry naskah.</p>
              </div>
              <button type="button" aria-label="Tutup" onClick={() => setCitationDialog(null)} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface-sunken ${focusRing}`}><X aria-hidden="true" size={19} /></button>
            </header>

            {sources.length === 0 ? (
              <div className="mt-6 rounded-xl bg-signal-warning-surface px-4 py-3">
                <p role="alert" className="font-interface text-sm leading-relaxed text-text-primary">Belum ada sumber yang dapat dipilih. Tutup dialog ini lalu tambahkan sumber pada bagian “Sumber naskah”.</p>
              </div>
            ) : (
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Sumber <span className="text-signal-danger">*</span></span>
                  <select
                    autoFocus
                    value={citationDialog.sourceId}
                    onChange={(event) => selectCitationSource(event.target.value)}
                    className={`mt-2 min-h-[44px] w-full rounded-lg border border-border-default/25 bg-surface-page px-3 font-interface text-sm text-text-primary ${focusRing}`}
                  >
                    <option value="">Pilih sumber...</option>
                    {sources.map((source) => <option key={source.id} value={source.id}>{source.title}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Label sitasi <span className="text-signal-danger">*</span></span>
                  <span className="mt-1 block font-interface text-[11px] leading-relaxed text-text-tertiary">Gunakan nama singkat yang mudah dikenali, misalnya “BPS” atau “WHO 2025”.</span>
                  <input
                    value={citationDialog.label}
                    onChange={(event) => { setCitationDialog((current) => current ? { ...current, label: event.target.value } : current); setCitationError(null) }}
                    maxLength={180}
                    className={`mt-2 min-h-[44px] w-full rounded-lg border border-border-default/25 bg-surface-page px-3 font-interface text-sm text-text-primary ${focusRing}`}
                  />
                </label>
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Lokator spesifik (opsional)</span>
                  <span className="mt-1 block font-interface text-[11px] leading-relaxed text-text-tertiary">Contoh: halaman 17, tabel 3, atau paragraf 8.</span>
                  <input
                    value={citationDialog.locator}
                    onChange={(event) => { setCitationDialog((current) => current ? { ...current, locator: event.target.value } : current); setCitationError(null) }}
                    maxLength={300}
                    className={`mt-2 min-h-[44px] w-full rounded-lg border border-border-default/25 bg-surface-page px-3 font-interface text-sm text-text-primary ${focusRing}`}
                  />
                </label>
              </div>
            )}

            {citationError && <p role="alert" className="mt-4 rounded-lg bg-signal-danger-surface px-3 py-2.5 font-interface text-xs text-signal-danger">{citationError}</p>}

            <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border-default/15 pt-5">
              <div>
                {citationDialog.position !== null && (
                  <button type="button" onClick={deleteCitationNode} className={`min-h-[44px] rounded-lg px-3 font-interface text-xs font-semibold text-signal-danger hover:bg-signal-danger-surface ${focusRing}`}>Hapus sitasi</button>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setCitationDialog(null)} className={`min-h-[44px] rounded-lg px-4 font-interface text-sm font-semibold text-text-secondary hover:bg-surface-sunken ${focusRing}`}>Batal</button>
                <button type="button" disabled={sources.length === 0} onClick={applyCitationNode} className={`min-h-[44px] rounded-lg bg-interactive-primary px-4 font-interface text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover disabled:cursor-not-allowed disabled:opacity-40 ${focusRing}`}>{citationDialog.position === null ? 'Sisipkan' : 'Simpan perubahan'}</button>
              </div>
            </footer>
          </section>
        </div>
      )}

      {semanticDialog && (
        <div className="fixed inset-0 z-modal flex items-center justify-center p-4 sm:p-8">
          <button
            type="button"
            aria-label="Tutup pengaturan blok"
            onClick={() => setSemanticDialog(null)}
            className="absolute inset-0 bg-surface-overlay/60"
          />
          <section
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="studio-semantic-dialog-title"
            className="relative z-base max-h-[min(760px,calc(100vh-32px))] w-full max-w-[620px] overflow-y-auto rounded-2xl border border-border-default/20 bg-surface-elevated p-5 shadow-lg sm:p-7"
          >
            <header className="flex items-start justify-between gap-4">
              <div>
                <h2 id="studio-semantic-dialog-title" className="font-interface text-lg font-semibold text-text-primary">
                  {semanticDialog.type === 'figure' ? 'Gambar artikel' : semanticDialog.type === 'footnote' ? 'Catatan kaki' : 'Rumus'}
                </h2>
                <p className="mt-1 font-interface text-xs leading-relaxed text-text-tertiary">
                  {semanticDialog.position === null ? 'Lengkapi blok sebelum disisipkan.' : 'Perbarui blok yang dipilih. Perubahan langsung masuk ke naskah.'}
                </p>
              </div>
              <button type="button" aria-label="Tutup" onClick={() => setSemanticDialog(null)} className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg hover:bg-surface-sunken ${focusRing}`}>
                <X aria-hidden="true" size={19} />
              </button>
            </header>

            {semanticDialog.type === 'figure' && (
              <div className="mt-6 space-y-5">
                <StudioImageUpload
                  label="Berkas gambar"
                  value={semanticDialog.values.src || null}
                  previewAlt={semanticDialog.values.alt}
                  onChange={(url) => updateSemanticValue('src', url ?? '')}
                />
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Deskripsi alternatif <span className="text-signal-danger">*</span></span>
                  <span className="mt-1 block font-interface text-[11px] leading-relaxed text-text-tertiary">Jelaskan informasi visual untuk pembaca yang tidak dapat melihat gambar.</span>
                  <textarea
                    value={semanticDialog.values.alt}
                    onChange={(event) => updateSemanticValue('alt', event.target.value)}
                    rows={3}
                    maxLength={500}
                    className={`mt-2 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 py-2.5 font-interface text-sm text-text-primary ${focusRing}`}
                  />
                </label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <span className="font-interface text-xs font-semibold text-text-primary">Keterangan</span>
                    <textarea value={semanticDialog.values.caption} onChange={(event) => updateSemanticValue('caption', event.target.value)} rows={3} maxLength={500} className={`mt-2 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 py-2.5 font-interface text-sm text-text-primary ${focusRing}`} />
                  </label>
                  <label className="block">
                    <span className="font-interface text-xs font-semibold text-text-primary">Kredit atau sumber</span>
                    <textarea value={semanticDialog.values.credit} onChange={(event) => updateSemanticValue('credit', event.target.value)} rows={3} maxLength={300} className={`mt-2 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 py-2.5 font-interface text-sm text-text-primary ${focusRing}`} />
                  </label>
                </div>
              </div>
            )}

            {semanticDialog.type === 'footnote' && (
              <label className="mt-6 block">
                <span className="font-interface text-xs font-semibold text-text-primary">Isi catatan kaki</span>
                <textarea
                  autoFocus
                  value={semanticDialog.values.note}
                  onChange={(event) => updateSemanticValue('note', event.target.value)}
                  rows={5}
                  maxLength={2_000}
                  placeholder="Tuliskan keterangan tambahan atau detail sumber..."
                  className={`mt-2 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 py-2.5 font-interface text-sm leading-relaxed text-text-primary placeholder:text-text-tertiary ${focusRing}`}
                />
              </label>
            )}

            {semanticDialog.type === 'equation' && (
              <div className="mt-6 space-y-4">
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Notasi LaTeX</span>
                  <textarea
                    autoFocus
                    value={semanticDialog.values.latex}
                    onChange={(event) => updateSemanticValue('latex', event.target.value)}
                    rows={5}
                    maxLength={2_000}
                    placeholder="E = mc^2"
                    spellCheck={false}
                    className={`mt-2 w-full rounded-lg border border-border-default/25 bg-surface-inverse px-3 py-3 font-mono text-sm text-text-on-inverse placeholder:text-text-tertiary ${focusRing}`}
                  />
                </label>
                <label className="block">
                  <span className="font-interface text-xs font-semibold text-text-primary">Label atau keterangan (opsional)</span>
                  <input value={semanticDialog.values.label} onChange={(event) => updateSemanticValue('label', event.target.value)} maxLength={300} className={`mt-2 h-11 w-full rounded-lg border border-border-default/25 bg-surface-page px-3 font-interface text-sm text-text-primary ${focusRing}`} />
                </label>
              </div>
            )}

            {semanticError && <p role="alert" className="mt-4 rounded-lg bg-signal-danger-surface px-3 py-2.5 font-interface text-xs text-signal-danger">{semanticError}</p>}

            <footer className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border-default/15 pt-5">
              <div>
                {semanticDialog.position !== null && (
                  <button type="button" onClick={deleteSemanticNode} className={`inline-flex min-h-[44px] items-center gap-2 rounded-lg px-3 font-interface text-xs font-semibold text-signal-danger hover:bg-signal-danger-surface ${focusRing}`}>
                    Hapus blok
                  </button>
                )}
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={() => setSemanticDialog(null)} className={`min-h-[44px] rounded-lg px-4 font-interface text-sm font-semibold text-text-secondary hover:bg-surface-sunken ${focusRing}`}>Batal</button>
                <button type="button" onClick={applySemanticNode} className={`min-h-[44px] rounded-lg bg-interactive-primary px-4 font-interface text-sm font-semibold text-text-on-inverse hover:bg-interactive-primary-hover ${focusRing}`}>
                  {semanticDialog.position === null ? 'Sisipkan' : 'Simpan perubahan'}
                </button>
              </div>
            </footer>
          </section>
        </div>
      )}
    </section>
  )
}
