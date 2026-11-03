'use client'

// CorrectionSection — Koreksi & klarifikasi. Koreksi adalah pembeda kepercayaan Saintifiks, jadi diberi ikon
// merek (berlian bercentang) dan jumlahnya terlihat. Panel menampilkan koreksi yang sudah disetujui dan
// formulir usulan koreksi dari pembaca.

import { useId, useState } from 'react'
import { usePathname } from 'next/navigation'
import { submitCorrection } from '@/app/(admin)/dashboard/koreksi/actions'
import { Button, Field, IconButton, Sheet, Textarea, useToast } from '@/components/ui'
import { useAuth } from '@/components/auth/AuthProvider'
import { signInWithGoogle } from '@/lib/auth-client'
import { correctionApi, type ContentKind } from '@/lib/engagement/kinds'

type Correction = {
  id: string
  original_text: string
  corrected_text: string
  explanation: string | null
  created_at: string
}

type CorrectionSectionProps = {
  articleId: string
  corrections: Correction[]
  kind?: ContentKind
}

async function sendOpinionCorrection(
  id: string,
  original: string,
  corrected: string,
  explanation: string
): Promise<{ error?: string }> {
  try {
    const res = await fetch(correctionApi.opinionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: correctionApi.opinionBody(id, original, corrected, explanation),
    })
    if (res.ok) return {}
    const data = (await res.json().catch(() => null)) as { error?: string } | null
    return { error: data?.error ?? 'Gagal mengirim koreksi.' }
  } catch {
    return { error: 'Gagal mengirim koreksi.' }
  }
}

export default function CorrectionSection({ articleId, corrections, kind = 'article' }: CorrectionSectionProps) {
  const { userId } = useAuth()
  const toast = useToast()
  const pathname = usePathname()
  const formId = useId()
  const [open, setOpen] = useState(false)
  const [original, setOriginal] = useState('')
  const [corrected, setCorrected] = useState('')
  const [explanation, setExplanation] = useState('')
  const [sending, setSending] = useState(false)

  const count = corrections.length

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!original.trim() || !corrected.trim() || sending) return

    if (!userId) {
      toast({
        message: 'Masuk dengan Google untuk mengusulkan koreksi.',
        label: 'Perlu masuk',
        duration: 9000,
        action: { label: 'Masuk', onClick: () => void signInWithGoogle(pathname) },
      })
      return
    }

    setSending(true)
    const result: { error?: string } =
      kind === 'opinion'
        ? await sendOpinionCorrection(articleId, original, corrected, explanation)
        : await submitCorrection({
            article_id: articleId,
            original_text: original,
            corrected_text: corrected,
            explanation,
          })
    setSending(false)

    if (result.error) {
      toast({ message: result.error, tone: 'danger' })
      return
    }
    setOriginal('')
    setCorrected('')
    setExplanation('')
    setOpen(false)
    toast({ message: 'Usulan koreksi Anda akan ditinjau. Terima kasih.', tone: 'success', label: 'Terkirim' })
  }

  return (
    <>
      <div className="flex items-center xl:flex-col">
        <IconButton
          icon="brand-koreksi"
          label={count > 0 ? `Koreksi dan klarifikasi, ${count} koreksi` : 'Koreksi dan klarifikasi'}
          onClick={() => setOpen(true)}
        />
        {count > 0 && (
          <span aria-hidden="true" className="-ml-1 font-mono text-caption text-text-secondary xl:ml-0 xl:-mt-1">
            {count}
          </span>
        )}
      </div>

      <Sheet open={open} onClose={() => setOpen(false)} title="Koreksi & klarifikasi" meta={count || undefined}>
        {count > 0 ? (
          <ul className="space-y-8">
            {corrections.map((c) => (
              <li key={c.id} className="border-l border-border-default pl-5">
                <p className="font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
                  Koreksi
                </p>
                <p className="mt-3 font-display text-base leading-relaxed text-text-secondary line-through decoration-1">
                  {c.original_text}
                </p>
                <p className="mt-2 font-display text-base leading-relaxed text-text-primary">{c.corrected_text}</p>
                {c.explanation && (
                  <p className="mt-3 font-display text-sm italic leading-relaxed text-text-secondary">{c.explanation}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="font-display text-base italic leading-relaxed text-text-secondary">
            Belum ada koreksi untuk artikel ini.
          </p>
        )}

        <form onSubmit={submit} className="mt-10 space-y-7 border-t border-border-default/20 pt-8">
          <p className="font-interface text-kicker-lg font-semibold uppercase tracking-widest text-text-secondary">
            Usulkan koreksi
          </p>
          <Field label="Teks asli di artikel" required>
            <Textarea
              id={`${formId}-asli`}
              value={original}
              onChange={(e) => setOriginal(e.target.value)}
              placeholder="Salin kalimat yang ingin dikoreksi"
              required
            />
          </Field>
          <Field label="Usulan perbaikan" required>
            <Textarea
              id={`${formId}-usulan`}
              value={corrected}
              onChange={(e) => setCorrected(e.target.value)}
              placeholder="Tulis versi yang benar"
              required
            />
          </Field>
          <Field label="Dasar atau sumber" hint="Opsional, tetapi membantu redaksi memeriksa.">
            <Textarea
              id={`${formId}-dasar`}
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="Tautan atau penjelasan singkat"
            />
          </Field>
          <Button type="submit" size="sm" disabled={!original.trim() || !corrected.trim() || sending} aria-busy={sending}>
            {sending ? 'Mengirim' : 'Kirim usulan'}
          </Button>
        </form>
      </Sheet>
    </>
  )
}
