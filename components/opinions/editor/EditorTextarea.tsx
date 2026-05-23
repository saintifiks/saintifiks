'use client'

// Textarea editor dengan auto-resize dan shortcut keyboard dasar

import { useEffect, useRef, forwardRef, useImperativeHandle } from 'react'

type EditorTextareaProps = {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

const EditorTextarea = forwardRef<HTMLTextAreaElement, EditorTextareaProps>(
  function EditorTextarea({ value, onChange, placeholder }, ref) {
    const internalRef = useRef<HTMLTextAreaElement>(null)

    // Expose internal ref ke parent
    useImperativeHandle(ref, () => internalRef.current!, [])

    // Auto-resize textarea berdasarkan konten
    useEffect(() => {
      const ta = internalRef.current
      if (!ta) return
      ta.style.height = 'auto'
      ta.style.height = `${Math.max(400, ta.scrollHeight)}px`
    }, [value])

    // Tab key → insert 2 spasi bukan berpindah fokus
    function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
      if (e.key === 'Tab') {
        e.preventDefault()
        const ta = internalRef.current
        if (!ta) return
        const start = ta.selectionStart
        const end = ta.selectionEnd
        const newVal = value.substring(0, start) + '  ' + value.substring(end)
        onChange(newVal)
        setTimeout(() => {
          ta.setSelectionRange(start + 2, start + 2)
        }, 0)
      }
    }

    return (
      <textarea
        ref={internalRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder ?? 'Mulai menulis...'}
        className="w-full min-h-[400px] px-6 py-5 font-mono text-sm text-primary-dark bg-white focus:outline-none resize-none leading-relaxed placeholder:text-primary-dark/25"
        spellCheck={false}
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
      />
    )
  }
)

export default EditorTextarea
