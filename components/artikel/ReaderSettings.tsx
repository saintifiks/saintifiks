'use client'

// ReaderSettings — "Aa": ukuran teks baca (3 tingkat) dan tema, disimpan di perangkat pembaca.
// Ukuran memakai variabel CSS --reader-scale yang dibaca aturan .article-body p (globals.css).

import { useEffect, useState } from 'react'
import { IconButton, Sheet } from '@/components/ui'

const STORAGE_KEY = 'saintifiks-reader-scale'
const SIZES = [
  { value: '0.94', label: 'Kecil', sample: 'text-sm' },
  { value: '1', label: 'Sedang', sample: 'text-lg' },
  { value: '1.12', label: 'Besar', sample: 'text-2xl' },
] as const

function applyScale(value: string) {
  document.documentElement.style.setProperty('--reader-scale', value)
}

export default function ReaderSettings() {
  const [open, setOpen] = useState(false)
  // Nilai awal dibaca langsung dari perangkat (hanya di klien); isinya baru tampil saat panel dibuka,
  // sehingga tidak memengaruhi HTML awal dari server.
  const [scale, setScale] = useState<string>(() => {
    if (typeof window === 'undefined') return '1'
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      return saved && SIZES.some((s) => s.value === saved) ? saved : '1'
    } catch {
      return '1'
    }
  })
  const [theme, setTheme] = useState<'light' | 'dark'>(() =>
    typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light'
  )

  // Terapkan ukuran tersimpan ke dokumen (efek samping DOM, bukan state).
  useEffect(() => {
    applyScale(scale)
  }, [scale])

  function chooseScale(value: string) {
    setScale(value)
    applyScale(value)
    try {
      localStorage.setItem(STORAGE_KEY, value)
    } catch {
      // abaikan
    }
  }

  function chooseTheme(next: 'light' | 'dark') {
    setTheme(next)
    document.documentElement.setAttribute('data-theme', next)
    try {
      localStorage.setItem('saintifiks-theme', next)
    } catch {
      // abaikan
    }
  }

  const choice = (active: boolean) =>
    [
      'flex min-h-[56px] flex-1 flex-col items-center justify-center gap-1 border-b py-3 transition-colors duration-fast',
      active
        ? 'border-border-default text-text-primary'
        : 'border-border-default/20 text-text-secondary hover:text-text-primary',
    ].join(' ')

  return (
    <>
      <IconButton icon="aa" label="Tampilan baca" onClick={() => setOpen(true)} />
      <Sheet open={open} onClose={() => setOpen(false)} title="Tampilan baca">
        <p className="font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
          Ukuran teks
        </p>
        <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Ukuran teks">
          {SIZES.map((s) => (
            <button
              key={s.value}
              type="button"
              role="radio"
              aria-checked={scale === s.value}
              onClick={() => chooseScale(s.value)}
              className={choice(scale === s.value)}
            >
              <span className={`font-display ${s.sample}`}>Aa</span>
              <span className="font-interface text-caption">{s.label}</span>
            </button>
          ))}
        </div>

        <p className="mt-10 font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
          Tema
        </p>
        <div className="mt-3 flex gap-2" role="radiogroup" aria-label="Tema">
          {(['light', 'dark'] as const).map((t) => (
            <button
              key={t}
              type="button"
              role="radio"
              aria-checked={theme === t}
              onClick={() => chooseTheme(t)}
              className={choice(theme === t)}
            >
              <span className="font-display text-lg">{t === 'light' ? 'Terang' : 'Gelap'}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </>
  )
}
