'use client'

// Editor WYSIWYG berbasis TipTap — menggantikan EditorTextarea + EditorToolbar + OpinionPreview
// Penulis melihat hasil render langsung (bold, heading, list, dll), bukan sintaks Markdown mentah
// Output ke DB tetap Markdown — konversi dilakukan oleh tiptap-markdown

import { useEffect, useCallback } from 'react'
import { useEditor, EditorContent, Extension, Node, mergeAttributes } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Markdown, type MarkdownStorage } from 'tiptap-markdown'
import {
  Bold, Italic, Heading2, Heading3, Quote,
  List, ListOrdered, Minus, Table as TableIcon,
  Image as ImageIcon, BarChart2
} from 'lucide-react'

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

  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { 'data-chart-placeholder': '' })]
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

type TipTapEditorProps = {
  initialContent: string
  onChange: (markdown: string) => void
  onOpenTableWizard: () => void
  onOpenImageModal: () => void
  onOpenChartWizard: () => void
  placeholder?: string
}

export default function TipTapEditor({
  initialContent,
  onChange,
  onOpenTableWizard,
  onOpenImageModal,
  onOpenChartWizard,
  placeholder = 'Mulai menulis artikel kamu di sini...',
}: TipTapEditorProps) {

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
      ChartPlaceholder,
      PreventSaveShortcut,
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class: [
          'min-h-[500px] px-6 py-6 focus:outline-none',
          // Tipografi konten — sesuai design system Saintifiks
          'font-libre text-primary-dark leading-relaxed',
          // Heading
          '[&>h2]:font-libre [&>h2]:text-2xl [&>h2]:font-bold [&>h2]:mt-8 [&>h2]:mb-3',
          '[&>h3]:font-libre [&>h3]:text-xl [&>h3]:font-bold [&>h3]:mt-6 [&>h3]:mb-2',
          // Paragraf
          '[&>p]:font-libre [&>p]:text-base [&>p]:leading-relaxed [&>p]:mb-4',
          // Bold & italic
          '[&_strong]:font-bold',
          '[&_em]:italic',
          // Blockquote
          '[&>blockquote]:border-l-4 [&>blockquote]:border-primary-dark/20 [&>blockquote]:pl-4 [&>blockquote]:italic [&>blockquote]:text-primary-dark/70 [&>blockquote]:my-4',
          // List
          '[&>ul]:list-disc [&>ul]:pl-6 [&>ul]:mb-4',
          '[&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:mb-4',
          '[&>ul>li]:mb-1 [&>ol>li]:mb-1',
          // HR
          '[&>hr]:border-primary-dark/15 [&>hr]:my-8',
          // Code inline
          '[&_code]:font-mono [&_code]:text-sm [&_code]:bg-primary-dark/5 [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded',
          // Code block
          '[&>pre]:bg-primary-dark/5 [&>pre]:rounded [&>pre]:p-4 [&>pre]:overflow-x-auto [&>pre]:mb-4',
          '[&>pre>code]:bg-transparent [&>pre>code]:p-0',
          // Chart placeholder chip
          '[&_div[data-chart-placeholder]]:inline-flex [&_div[data-chart-placeholder]]:items-center',
          '[&_div[data-chart-placeholder]]:gap-1.5 [&_div[data-chart-placeholder]]:bg-accent-blue/10',
          '[&_div[data-chart-placeholder]]:border [&_div[data-chart-placeholder]]:border-accent-blue/30',
          '[&_div[data-chart-placeholder]]:text-accent-blue [&_div[data-chart-placeholder]]:text-xs',
          '[&_div[data-chart-placeholder]]:px-2.5 [&_div[data-chart-placeholder]]:py-1 [&_div[data-chart-placeholder]]:rounded',
          '[&_div[data-chart-placeholder]]:my-2 [&_div[data-chart-placeholder]]:cursor-default',
          '[&_div[data-chart-placeholder]]:select-none',
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

  const btnClass = (active: boolean) =>
    `flex items-center justify-center w-8 h-8 rounded transition-colors duration-100 ${
      active
        ? 'bg-primary-dark text-primary-light'
        : 'text-primary-dark/50 hover:text-primary-dark hover:bg-primary-dark/5'
    }`

  return (
    <div className="flex flex-col flex-1">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-primary-dark/10 bg-primary-dark/[0.02] sticky top-[var(--editor-header-h,112px)] z-20">

        <button type="button" title="Bold" onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(isActive('bold'))}>
          <Bold size={15} />
        </button>

        <button type="button" title="Italic" onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(isActive('italic'))}>
          <Italic size={15} />
        </button>

        <div className="w-px h-5 bg-primary-dark/10 mx-0.5" />

        <button type="button" title="H2" onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} className={btnClass(isActive('heading', { level: 2 }))}>
          <Heading2 size={15} />
        </button>

        <button type="button" title="H3" onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} className={btnClass(isActive('heading', { level: 3 }))}>
          <Heading3 size={15} />
        </button>

        <div className="w-px h-5 bg-primary-dark/10 mx-0.5" />

        <button type="button" title="Kutipan" onClick={() => editor.chain().focus().toggleBlockquote().run()} className={btnClass(isActive('blockquote'))}>
          <Quote size={15} />
        </button>

        <button type="button" title="Bullet list" onClick={() => editor.chain().focus().toggleBulletList().run()} className={btnClass(isActive('bulletList'))}>
          <List size={15} />
        </button>

        <button type="button" title="Numbered list" onClick={() => editor.chain().focus().toggleOrderedList().run()} className={btnClass(isActive('orderedList'))}>
          <ListOrdered size={15} />
        </button>

        <button type="button" title="Garis horizontal" onClick={() => editor.chain().focus().setHorizontalRule().run()} className={btnClass(false)}>
          <Minus size={15} />
        </button>

        <div className="w-px h-5 bg-primary-dark/10 mx-0.5" />

        <button type="button" title="Tabel" onClick={onOpenTableWizard} className={btnClass(false)}>
          <TableIcon size={15} />
        </button>

        <button type="button" title="Gambar" onClick={onOpenImageModal} className={btnClass(false)}>
          <ImageIcon size={15} />
        </button>

        <button type="button" title="Chart" onClick={onOpenChartWizard} className={btnClass(false)}>
          <BarChart2 size={15} />
        </button>

      </div>

      {/* Area tulis WYSIWYG */}
      {!editor.getText() && !editor.isFocused && (
        <p className="absolute pointer-events-none px-6 py-6 font-libre text-base text-primary-dark/25 select-none">
          {placeholder}
        </p>
      )}
      <EditorContent editor={editor} className="flex-1 bg-white" />
    </div>
  )
}
