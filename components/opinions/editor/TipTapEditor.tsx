'use client'

// Editor WYSIWYG berbasis TipTap — menggantikan EditorTextarea + EditorToolbar + OpinionPreview
// Penulis melihat hasil render langsung (bold, heading, list, dll), bukan sintaks Markdown mentah
// Output ke DB tetap Markdown — konversi dilakukan oleh tiptap-markdown

import { useEffect, useCallback, useImperativeHandle, forwardRef } from 'react'
import { useEditor, EditorContent, Extension, Node, mergeAttributes } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown, type MarkdownStorage } from 'tiptap-markdown'
import { Table } from '@tiptap/extension-table'
import { TableRow } from '@tiptap/extension-table-row'
import { TableHeader } from '@tiptap/extension-table-header'
import { TableCell } from '@tiptap/extension-table-cell'

// Custom Node: ChartPlaceholder — merender {{chart:id}} sebagai chip di editor
// Saat ekspor ke Markdown, dikembalikan ke string {{chart:id}} yang asli
const ChartPlaceholder = Node.create({
  name: 'chartPlaceholder',
  group: 'block',
  atom: true,

  addAttributes() {
    return {
      chartId: { default: null },
    }
  },

  parseHTML() {
    return [{ tag: 'div[data-chart-placeholder]' }]
  },

  renderHTML({ node, HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-chart-placeholder': '' }), `Grafik · ${node.attrs.chartId}`]
  },

  renderText({ node }) {
    return `{{chart:${node.attrs.chartId}}}`
  },
})

// Shortcut keyboard: Ctrl/Cmd+S tidak reload halaman
const PreventSaveShortcut = Extension.create({
  name: 'preventSaveShortcut',
  addKeyboardShortcuts() {
    return {
      'Mod-s': () => true,
    }
  },
})

export type TipTapEditorHandle = {
  insertMarkdown: (markdown: string) => void
}

type TipTapEditorProps = {
  initialContent: string
  onChange: (markdown: string) => void
  onOpenTableWizard: () => void
  onOpenImageModal: () => void
  onOpenChartWizard: () => void
  placeholder?: string
}

const TipTapEditor = forwardRef<TipTapEditorHandle, TipTapEditorProps>(function TipTapEditor({
  initialContent,
  onChange,
  onOpenTableWizard,
  onOpenImageModal,
  onOpenChartWizard,
  placeholder = 'Mulai menulis artikel kamu di sini...',
}: TipTapEditorProps, ref) {

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        // Heading hanya H2 dan H3 sesuai konvensi artikel opinions
        heading: { levels: [2, 3] },
        // Kode inline dan code block tetap aktif
        code: {},
        codeBlock: {},
      }),
      Markdown.configure({
        // tiptap-markdown: import dari Markdown saat init, ekspor ke Markdown saat onChange
        html: false,
        transformPastedText: true,
        transformCopiedText: false,
      }),
      Table.configure({ resizable: false }),
      TableRow,
      TableHeader,
      TableCell,
      ChartPlaceholder,
      PreventSaveShortcut,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: [
          'min-h-[500px] px-4 py-6 focus:outline-none sm:px-6',
          // Tipografi konten — sesuai design system Saintifiks
          'font-display text-ink leading-relaxed',
          // Heading — H2 lebih besar dari H3, keduanya jelas berbeda dari teks biasa
          '[&>h2]:font-display [&>h2]:text-3xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-3',
          '[&>h3]:font-display [&>h3]:text-xl [&>h3]:font-bold [&>h3]:text-text-secondary [&>h3]:mt-6 [&>h3]:mb-2',
          // Paragraf
          '[&>p]:font-display [&>p]:text-base [&>p]:leading-relaxed [&>p]:mb-4',
          // Bold & italic
          '[&_strong]:font-bold',
          '[&_em]:italic',
          // Blockquote
          '[&>blockquote]:border-l [&>blockquote]:border-border-default [&>blockquote]:pl-5 [&>blockquote]:italic [&>blockquote]:text-text-secondary [&>blockquote]:my-4',
          // List
          '[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4',
          '[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4',
          '[&>ul>li]:mb-1 [&>ol>li]:mb-1',
          // HR
          '[&>hr]:border-ink/15 [&>hr]:my-8',
          // Code inline
          '[&_code]:font-mono [&_code]:text-sm [&_code]:bg-ink/5 [&_code]:px-1.5 [&_code]:py-0.5',
          // Code block
          '[&>pre]:bg-ink/5 [&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:mb-4',
          '[&>pre>code]:bg-transparent [&>pre>code]:p-0',
          // Chart placeholder chip
          '[&_div[data-chart-placeholder]]:inline-flex [&_div[data-chart-placeholder]]:items-center',
          '[&_div[data-chart-placeholder]]:gap-1.5',
          '[&_div[data-chart-placeholder]]:border [&_div[data-chart-placeholder]]:border-border-default',
          '[&_div[data-chart-placeholder]]:font-mono [&_div[data-chart-placeholder]]:text-caption [&_div[data-chart-placeholder]]:text-text-secondary',
          '[&_div[data-chart-placeholder]]:px-2.5 [&_div[data-chart-placeholder]]:py-1',
          '[&_div[data-chart-placeholder]]:my-2 [&_div[data-chart-placeholder]]:cursor-default',
          '[&_div[data-chart-placeholder]]:select-none',
          // Tabel GFM — tampilan grid di editor
          '[&_table]:w-full [&_table]:border-collapse [&_table]:my-4 [&_table]:text-sm',
          '[&_th]:border [&_th]:border-ink/20 [&_th]:px-3 [&_th]:py-2 [&_th]:text-left [&_th]:font-semibold [&_th]:bg-ink/5',
          '[&_td]:border [&_td]:border-ink/20 [&_td]:px-3 [&_td]:py-2',
          '[&_tr:hover>td]:bg-ink/[0.02]',
        ].join(' '),
      },
    },
    onUpdate({ editor }) {
      // Ekspor ke Markdown setiap kali konten berubah
      // tiptap-markdown menangani konversi ChartPlaceholder via renderText()
      const mdStorage = ((editor.storage as unknown) as Record<string, unknown>)['markdown'] as MarkdownStorage | undefined
      const md = mdStorage?.getMarkdown() ?? ''
      onChange(md)
    },
  })

  // Sync initialContent jika berubah dari luar (misal saat load edit mode)
  useEffect(() => {
    if (!editor) return
    const current = (((editor.storage as unknown) as Record<string, unknown>)['markdown'] as MarkdownStorage | undefined)?.getMarkdown() ?? ''
    if (current !== initialContent) {
      editor.commands.setContent(initialContent)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editor, initialContent])

  // Fungsi insert chart placeholder dari ChartWizard
  const insertChartPlaceholder = useCallback((chartId: string) => {
    if (!editor) return
    editor.chain().focus().insertContent({
      type: 'chartPlaceholder',
      attrs: { chartId },
    }).run()
  }, [editor])

  // Expose insertMarkdown ke parent via ref — digunakan oleh TableWizard dan ImageModal
  useImperativeHandle(ref, () => ({
    insertMarkdown(markdown: string) {
      if (!editor) return
      // Ambil Markdown saat ini via storage serializer
      const mdStorage = ((editor.storage as unknown) as Record<string, unknown>)['markdown'] as MarkdownStorage | undefined
      const current = mdStorage?.getMarkdown() ?? ''
      const combined = current.trimEnd() + '\n\n' + markdown.trim()
      // setContent agar TipTap state update (untuk tampilan di editor)
      editor.commands.setContent(combined)
      editor.commands.focus('end')
      // Panggil onChange dengan string Markdown asli (bukan hasil re-serialisasi TipTap)
      // Ini penting untuk tabel GFM — TipTap tanpa Table extension tidak bisa re-serialize tabel
      onChange(combined)
    },
  }), [editor, onChange])

  // Expose ke parent via window event — ChartWizard akan dispatch event ini
  useEffect(() => {
    function handleChartInsert(e: Event) {
      const chartId = (e as CustomEvent<string>).detail
      insertChartPlaceholder(chartId)
    }
    window.addEventListener('tiptap:insert-chart', handleChartInsert)
    return () => window.removeEventListener('tiptap:insert-chart', handleChartInsert)
  }, [insertChartPlaceholder])

  if (!editor) return null


  const isActive = (type: string, attrs?: Record<string, unknown>) =>
    editor.isActive(type, attrs)

  // Toolbar berhuruf, bukan ikon: perintah menulis paling cepat dikenali lewat hurufnya sendiri (B, I, H2).
  const btnClass = (active: boolean) =>
    `inline-flex min-h-[36px] min-w-[36px] items-center justify-center px-2 font-interface text-caption font-semibold transition-colors duration-fast focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-text-primary ${
      active ? 'bg-ink text-paper' : 'text-text-secondary hover:text-text-primary'
    }`

  const tools: { label: string; title: string; active?: boolean; run: () => void; className?: string }[][] = [
    [
      { label: 'B', title: 'Tebal', active: isActive('bold'), run: () => editor.chain().focus().toggleBold().run(), className: 'font-bold' },
      { label: 'I', title: 'Miring', active: isActive('italic'), run: () => editor.chain().focus().toggleItalic().run(), className: 'italic' },
    ],
    [
      { label: 'H2', title: 'Subjudul', active: isActive('heading', { level: 2 }), run: () => editor.chain().focus().toggleHeading({ level: 2 }).run() },
      { label: 'H3', title: 'Anak subjudul', active: isActive('heading', { level: 3 }), run: () => editor.chain().focus().toggleHeading({ level: 3 }).run() },
    ],
    [
      { label: 'Kutip', title: 'Kutipan', active: isActive('blockquote'), run: () => editor.chain().focus().toggleBlockquote().run() },
      { label: 'Daftar', title: 'Daftar butir', active: isActive('bulletList'), run: () => editor.chain().focus().toggleBulletList().run() },
      { label: 'Nomor', title: 'Daftar bernomor', active: isActive('orderedList'), run: () => editor.chain().focus().toggleOrderedList().run() },
      { label: 'Garis', title: 'Garis pemisah', run: () => editor.chain().focus().setHorizontalRule().run() },
    ],
    [
      { label: 'Tabel', title: 'Sisipkan tabel', run: onOpenTableWizard },
      { label: 'Gambar', title: 'Sisipkan gambar', run: onOpenImageModal },
      { label: 'Grafik', title: 'Sisipkan grafik', run: onOpenChartWizard },
    ],
  ]

  return (
    <div className="flex flex-1 flex-col">
      {/* Toolbar menempel tepat di bawah bilah atas editor (tinggi tetap 56px = top-14). */}
      <div className="sticky top-14 z-20 flex flex-wrap items-center border-b border-border-default/20 bg-paper px-2 py-1 sm:px-4">
        {tools.map((group, gi) => (
          <div key={gi} className="flex items-center">
            {gi > 0 && <span aria-hidden="true" className="mx-1.5 h-4 w-px bg-border-default/30" />}
            {group.map((tool) => (
              <button
                key={tool.label}
                type="button"
                title={tool.title}
                aria-label={tool.title}
                aria-pressed={tool.active === undefined ? undefined : tool.active}
                onClick={tool.run}
                className={[btnClass(!!tool.active), tool.className].filter(Boolean).join(' ')}
              >
                {tool.label}
              </button>
            ))}
          </div>
        ))}
      </div>

      {/* Area tulis WYSIWYG — wrapper relative agar placeholder tidak keluar dari area editor */}
      <div className="relative flex-1">
        {(() => {
          const isEmpty = editor.state.doc.textContent === '' && editor.state.doc.childCount <= 1
          return isEmpty && !editor.isFocused
        })() && (
          <p className="pointer-events-none absolute left-0 top-0 select-none px-4 py-6 font-display text-base text-text-tertiary sm:px-6">
            {placeholder}
          </p>
        )}
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  )
})

export default TipTapEditor
