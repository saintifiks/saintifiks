'use client'

// ReportSection — laporkan tulisan Argumen yang melanggar pedoman. Panel berisi satu kolom alasan.
// Belum masuk: notifikasi menawarkan masuk (tulisan yang dilaporkan harus punya pelapor yang dapat dihubungi).

import { useId, useState } from 'react'
import { usePathname } from 'next/navigation'
import { Button, Field, IconButton, Sheet, Textarea, useToast } from '@/components/ui'
import { useAuth } from '@/components/auth/AuthProvider'
import { reportApi } from '@/lib/engagement/kinds'

const MIN_LENGTH = 10

export default function ReportSection({ articleId }: { articleId: string }) {
  const { userId } = useAuth()
  const toast = useToast()
  const pathname = usePathname()
  const fieldId = useId()
  const [open, setOpen] = useState(false)
  const [reason, setReason] = useState('')
  const [sending, setSending] = useState(false)

  function openPanel() {
    if (!userId) {
      toast({
        message: 'Masuk dengan Google untuk melaporkan tulisan ini.',
        label: 'Perlu masuk',
        duration: 9000,
        action: { label: 'Masuk', href: `/masuk?next=${encodeURIComponent(pathname)}` },
      })
      return
    }
    setOpen(true)
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    const text = reason.trim()
    if (text.length < MIN_LENGTH || sending) return
    setSending(true)
    try {
      const res = await fetch(reportApi.url(articleId), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: text }),
      })
      const data = (await res.json().catch(() => null)) as { error?: string } | null
      if (!res.ok) {
        toast({ message: data?.error ?? 'Laporan belum terkirim. Coba lagi sebentar lagi.', tone: 'danger' })
        return
      }
      setReason('')
      setOpen(false)
      toast({ message: 'Laporan Anda akan ditinjau moderator. Terima kasih.', tone: 'success', label: 'Terkirim' })
    } catch {
      toast({ message: 'Laporan belum terkirim. Coba lagi sebentar lagi.', tone: 'danger' })
    } finally {
      setSending(false)
    }
  }

  return (
    <>
      <IconButton icon="flag" label="Laporkan tulisan" onClick={openPanel} />

      <Sheet open={open} onClose={() => setOpen(false)} title="Laporkan tulisan">
        <p className="font-display text-body-sm leading-relaxed text-text-secondary">
          Argumen adalah pendapat pribadi penulis dan tidak ditinjau redaksi sebelum terbit. Laporkan bila tulisan ini
          menyesatkan, menyerang pribadi, atau melanggar pedoman. Moderator akan meninjaunya.
        </p>
        <form onSubmit={submit} className="mt-8 space-y-7">
          <Field label="Alasan laporan" hint={`Minimal ${MIN_LENGTH} karakter.`} required>
            <Textarea
              id={fieldId}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Jelaskan apa yang perlu ditinjau"
              maxLength={500}
              required
            />
          </Field>
          <Button type="submit" size="sm" disabled={reason.trim().length < MIN_LENGTH || sending} aria-busy={sending}>
            {sending ? 'Mengirim' : 'Kirim laporan'}
          </Button>
        </form>
      </Sheet>
    </>
  )
}
