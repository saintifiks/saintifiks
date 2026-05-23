'use client'

// Toolbar editor artikel opinions
// Tombol format Markdown + trigger wizard (tabel, gambar, chart)

import { Bold, Italic, Heading2, Heading3, Quote, List, ListOrdered, Minus, Superscript, Table, Image as ImageIcon, BarChart2 } from 'lucide-react'
import { insertAtCursor, insertFootnote } from '@/lib/editor-helpers'

type EditorToolbarProps = {
  textareaRef: React.RefObject<HTMLTextAreaElement>
  onContentChange: (content: string) => void
  onOpenTableWizard: () => void
  onOpenImageModal: () => void
  onOpenChartWizard: () => void
}

type ToolbarButton = {
  icon: React.ReactNode
  label: string
  action: () => void
}

export default function EditorToolbar({
  textareaRef,
  onContentChange,
  onOpenTableWizard,
  onOpenImageModal,
  onOpenChartWizard,
}: EditorToolbarProps) {

  function wrap(before: string, after: string, placeholder: string) {
    const ta = textareaRef.current
    if (!ta) return
    insertAtCursor(ta, before, after, placeholder, onContentChange)
  }

  function handleFootnote() {
    const ta = textareaRef.current
    if (!ta) return
    insertFootnote(ta, onContentChange)
  }

  const buttons: ToolbarButton[] = [
    {
      icon: <Bold size={15} />,
      label: 'Bold',
      action: () => wrap('**', '**', 'teks tebal'),
    },
    {
      icon: <Italic size={15} />,
      label: 'Italic',
      action: () => wrap('*', '*', 'teks miring'),
    },
    {
      icon: <Heading2 size={15} />,
      label: 'H2',
      action: () => wrap('\n## ', '', 'Subjudul'),
    },
    {
      icon: <Heading3 size={15} />,
      label: 'H3',
      action: () => wrap('\n### ', '', 'Sub-subjudul'),
    },
    {
      icon: <Quote size={15} />,
      label: 'Kutipan',
      action: () => wrap('\n> ', '', 'teks kutipan'),
    },
    {
      icon: <List size={15} />,
      label: 'Bullet list',
      action: () => wrap('\n- ', '', 'item'),
    },
    {
      icon: <ListOrdered size={15} />,
      label: 'Numbered list',
      action: () => wrap('\n1. ', '', 'item'),
    },
    {
      icon: <Minus size={15} />,
      label: 'Garis horizontal',
      action: () => wrap('\n\n---\n\n', '', ''),
    },
    {
      icon: <Superscript size={15} />,
      label: 'Footnote',
      action: handleFootnote,
    },
    {
      icon: <Table size={15} />,
      label: 'Tabel',
      action: onOpenTableWizard,
    },
    {
      icon: <ImageIcon size={15} />,
      label: 'Gambar',
      action: onOpenImageModal,
    },
    {
      icon: <BarChart2 size={15} />,
      label: 'Chart',
      action: onOpenChartWizard,
    },
  ]

  return (
    <div className="flex flex-wrap items-center gap-0.5 px-3 py-2 border-b border-primary-dark/10 bg-primary-dark/[0.02]">
      {buttons.map((btn, idx) => (
        <button
          key={idx}
          type="button"
          onClick={btn.action}
          title={btn.label}
          className="flex items-center justify-center w-8 h-8 text-primary-dark/50 hover:text-primary-dark hover:bg-primary-dark/5 rounded transition-colors duration-100"
        >
          {btn.icon}
        </button>
      ))}
    </div>
  )
}
