'use client'

// ThemeChoice — pilihan tampilan di Pengaturan: Terang, Gelap, atau Ikuti perangkat. Mengikuti cara ThemeToggle
// di header (data-theme pada <html> dan kunci localStorage 'saintifiks-theme'); "Ikuti perangkat" menghapus
// pilihan manual sehingga tema kembali mengikuti OS.

import { useSyncExternalStore } from 'react'

type Choice = 'light' | 'dark' | 'system'

const options: { value: Choice; label: string }[] = [
  { value: 'light', label: 'Terang' },
  { value: 'dark', label: 'Gelap' },
  { value: 'system', label: 'Ikuti perangkat' },
]

function read(): Choice {
  try {
    const stored = localStorage.getItem('saintifiks-theme')
    return stored === 'light' || stored === 'dark' ? stored : 'system'
  } catch {
    return 'system'
  }
}

// Pilihan tersimpan di localStorage (bukan state React), jadi dibaca lewat penyimpanan eksternal; sisi server tidak
// tahu pilihannya (null) agar hidrasi tidak salah.
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export default function ThemeChoice() {
  const choice = useSyncExternalStore<Choice | null>(subscribe, read, () => null)

  function select(next: Choice) {
    const root = document.documentElement
    root.classList.add('theme-transition')
    try {
      if (next === 'system') localStorage.removeItem('saintifiks-theme')
      else localStorage.setItem('saintifiks-theme', next)
    } catch {
      // Penyimpanan tidak tersedia (mode privat): pilihan berlaku untuk halaman ini saja.
    }
    const applied = next === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : next
    root.setAttribute('data-theme', applied)
    listeners.forEach((listener) => listener())
    window.setTimeout(() => root.classList.remove('theme-transition'), 480)
  }

  return (
    <div role="radiogroup" aria-label="Tampilan" className="flex flex-wrap gap-x-7 gap-y-2">
      {options.map((o) => {
        const active = choice === o.value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => select(o.value)}
            className={[
              'min-h-[44px] font-interface text-sm underline decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast',
              'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-interactive-primary',
              active
                ? 'font-semibold text-text-primary decoration-text-primary'
                : 'text-text-secondary decoration-transparent hover:text-text-primary hover:decoration-text-primary',
            ].join(' ')}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
