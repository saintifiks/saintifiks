'use client'

// KoreksiQueue — antrean usulan koreksi dari pembaca. Setiap usulan menampilkan teks asli, usulan perbaikan,
// dan dasar/sumber; admin menyetujui (tampil di artikel) atau menolak. Baris hilang segera setelah diputuskan.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import NextLink from 'next/link'
import { Button, useToast } from '@/components/ui'
import { reviewCorrection } from '@/app/(admin)/dashboard/koreksi/actions'
import { formatTanggalPendek } from '@/lib/format-date'

export type KoreksiItem = {
  key: string
  kind: 'article' | 'opinion'
  id: string
  title: string
  href: string | null
  original: string
  corrected: string
  explanation: string | null
  createdAt: string
}

export default function KoreksiQueue({ items }: { items: KoreksiItem[] }) {
  const router = useRouter()
  const toast = useToast()
  const [done, setDone] = useState<Set<string>>(new Set())
  const [busy, setBusy] = useState<string | null>(null)

  async function decide(item: KoreksiItem, decision: 'approved' | 'rejected') {
    setBusy(item.key)
    const result = await reviewCorrection({ kind: item.kind, id: item.id, decision })
    setBusy(null)
    if ('error' in result && result.error) {
      toast({ message: result.error, tone: 'danger' })
      return
    }
    setDone((prev) => new Set(prev).add(item.key))
    toast({
      message: decision === 'approved' ? 'Koreksi disetujui dan tampil di artikel.' : 'Usulan koreksi ditolak.',
      tone: decision === 'approved' ? 'success' : undefined,
      label: decision === 'approved' ? 'Disetujui' : 'Ditolak',
    })
    router.refresh()
  }

  const visible = items.filter((i) => !done.has(i.key))

  if (visible.length === 0) {
    return (
      <p className="py-10 font-display text-body-base italic text-text-secondary">
        Tidak ada usulan koreksi yang menunggu. Semua sudah ditinjau.
      </p>
    )
  }

  return (
    <ul className="divide-y divide-border-default/20 border-y border-border-default/20">
      {visible.map((item) => (
        <li key={item.key} className="py-7">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-1">
            {item.href ? (
              <NextLink
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-display text-lg text-text-primary underline decoration-border-default/40 decoration-1 underline-offset-[6px] transition-[text-decoration-color] duration-fast hover:decoration-text-primary"
              >
                {item.title}
              </NextLink>
            ) : (
              <span className="font-display text-lg text-text-primary">{item.title}</span>
            )}
            <span className="font-mono text-caption text-text-tertiary">
              {item.kind === 'opinion' ? 'Argumen' : 'Artikel'} · {formatTanggalPendek(item.createdAt)}
            </span>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-2">
            <div>
              <p className="font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
                Teks asli
              </p>
              <p className="mt-2 whitespace-pre-line font-display text-base leading-relaxed text-text-secondary line-through decoration-1">
                {item.original}
              </p>
            </div>
            <div>
              <p className="font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
                Usulan
              </p>
              <p className="mt-2 whitespace-pre-line font-display text-base leading-relaxed text-text-primary">
                {item.corrected}
              </p>
            </div>
          </div>

          {item.explanation && (
            <p className="mt-5 max-w-2xl font-display text-body-sm italic leading-relaxed text-text-secondary">
              Dasar: {item.explanation}
            </p>
          )}

          <div className="mt-6 flex items-center gap-6">
            <Button size="sm" onClick={() => decide(item, 'approved')} disabled={busy === item.key} aria-busy={busy === item.key}>
              Setujui
            </Button>
            <Button variant="text" size="sm" onClick={() => decide(item, 'rejected')} disabled={busy === item.key}>
              Tolak
            </Button>
          </div>
        </li>
      ))}
    </ul>
  )
}
