'use client'

// Menu — menu tarik-turun kecil (menu akun). Tombol pemicu bebas; isi berupa daftar tautan/aksi.
// Keyboard: Enter/Spasi/↓ membuka, ↑↓ memindah, Home/End, Escape menutup dan mengembalikan fokus, Tab menutup.
// Klik di luar menutup. Panel berada di lapisan dropdown, bukan modal.

import { useEffect, useId, useRef, useState, type ReactNode } from 'react'
import NextLink from 'next/link'

export type MenuItem =
  | { label: string; href: string; onSelect?: never }
  | { label: string; onSelect: () => void; href?: never }

export type MenuProps = {
  // Nama untuk pembaca layar, mis. "Menu akun"
  label: string
  trigger: ReactNode
  // Bagian atas yang tidak interaktif (nama dan surel)
  heading?: ReactNode
  items: MenuItem[]
  className?: string
}

const itemClass =
  'flex min-h-[44px] w-full items-center px-4 text-left font-interface text-sm text-text-primary underline decoration-transparent decoration-1 underline-offset-4 transition-[text-decoration-color] duration-fast hover:decoration-text-primary focus-visible:decoration-text-primary'

export default function Menu({ label, trigger, heading, items, className = '' }: MenuProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const panelId = useId()

  function focusItem(index: number) {
    const els = rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]')
    if (!els || els.length === 0) return
    els[(index + els.length) % els.length].focus()
  }

  function close(returnFocus: boolean) {
    setOpen(false)
    if (returnFocus) triggerRef.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    // fokus ke item pertama saat dibuka lewat keyboard maupun mouse
    const raf = requestAnimationFrame(() => focusItem(0))
    return () => {
      document.removeEventListener('mousedown', onDown)
      cancelAnimationFrame(raf)
    }
  }, [open])

  function onPanelKeyDown(e: React.KeyboardEvent) {
    const els = Array.from(rootRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
    const current = els.findIndex((el) => el === document.activeElement)
    if (e.key === 'Escape') {
      e.preventDefault()
      close(true)
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      focusItem(current + 1)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      focusItem(current - 1)
    } else if (e.key === 'Home') {
      e.preventDefault()
      focusItem(0)
    } else if (e.key === 'End') {
      e.preventDefault()
      focusItem(els.length - 1)
    } else if (e.key === 'Tab') {
      setOpen(false)
    }
  }

  return (
    <div ref={rootRef} className={['relative', className].filter(Boolean).join(' ')}>
      <button
        ref={triggerRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown' && !open) {
            e.preventDefault()
            setOpen(true)
          }
        }}
        className="inline-flex min-h-[44px] min-w-[44px] items-center justify-center"
      >
        {trigger}
      </button>

      {open && (
        <div
          id={panelId}
          role="menu"
          aria-label={label}
          onKeyDown={onPanelKeyDown}
          className="absolute right-0 top-full z-dropdown mt-1 w-64 border border-border-default/25 bg-surface-page shadow-md"
        >
          {heading && <div className="border-b border-border-default/20 px-4 py-3">{heading}</div>}
          <div className="py-1">
            {items.map((item) =>
              item.href ? (
                <NextLink
                  key={item.label}
                  href={item.href}
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => setOpen(false)}
                  className={itemClass}
                >
                  {item.label}
                </NextLink>
              ) : (
                <button
                  key={item.label}
                  type="button"
                  role="menuitem"
                  tabIndex={-1}
                  onClick={() => {
                    setOpen(false)
                    item.onSelect?.()
                  }}
                  className={itemClass}
                >
                  {item.label}
                </button>
              )
            )}
          </div>
        </div>
      )}
    </div>
  )
}
