'use client'

import { useState, useEffect, useMemo } from 'react'
import { AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { submitCorrection } from '@/app/(admin)/dashboard/koreksi/actions'
import { Button, Input, Label, Badge } from '@/components/ui'

type SearchResultItem = {
  type: 'artikel' | 'argumen'
  id: string
  title: string
  slug: string
  excerpt: string
  authorUsername?: string
}

export default function KoreksiForm() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResultItem[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selected, setSelected] = useState<SearchResultItem | null>(null)
  
  const [originalText, setOriginalText] = useState('')
  const [correctedText, setCorrectedText] = useState('')
  const [explanation, setExplanation] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const supabase = useMemo(() => createClient(), [])

  // Manual debounce for search ~300ms
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([])
      setIsSearching(false)
      return
    }

    setIsSearching(true)
    const handler = setTimeout(async () => {
      try {
        const res = await fetch(`/api/koreksi/search?q=${encodeURIComponent(query)}`, {
          cache: 'no-store',
        })
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
        } else {
          console.error('[KoreksiForm] Search failed')
        }
      } catch (err) {
        console.error('[KoreksiForm] Search error:', err)
      } finally {
        setIsSearching(false)
      }
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [query])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    
    if (!selected) {
      setMessage({ type: 'error', text: 'Silakan pilih artikel atau argumen terlebih dahulu.' })
      return
    }
    
    if (!originalText.trim() || !correctedText.trim()) {
      setMessage({ type: 'error', text: 'Teks asli dan teks yang diusulkan wajib diisi.' })
      return
    }

    setIsSubmitting(true)
    setMessage(null)

    try {
      // Cek sesi login
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        // Redireksi ke OAuth login Google jika belum masuk
        await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            queryParams: { prompt: 'select_account' },
            redirectTo: `${window.location.origin}/koreksi`,
          },
        })
        return
      }

      if (selected.type === 'artikel') {
        // Panggil Server Action langsung untuk artikel editorial
        const result = await submitCorrection({
          article_id: selected.id,
          original_text: originalText,
          corrected_text: correctedText,
          explanation: explanation,
        })

        if ('error' in result && result.error) {
          setMessage({ type: 'error', text: result.error })
        } else {
          setMessage({
            type: 'success',
            text: 'Usulan koreksi untuk artikel berhasil dikirim. Terima kasih atas kontribusi Anda!',
          })
          setOriginalText('')
          setCorrectedText('')
          setExplanation('')
        }
      } else if (selected.type === 'argumen') {
        // Panggil API Route via fetch POST untuk opini/argumen
        const res = await fetch('/api/opinion-corrections', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            opinion_article_id: selected.id,
            original_text: originalText,
            corrected_text: correctedText,
            explanation: explanation,
          }),
        })

        const data = await res.json()

        if (!res.ok) {
          setMessage({ type: 'error', text: data.error || 'Gagal mengirim koreksi.' })
        } else {
          setMessage({
            type: 'success',
            text: 'Usulan koreksi untuk argumen berhasil dikirim. Terima kasih atas kontribusi Anda!',
          })
          setOriginalText('')
          setCorrectedText('')
          setExplanation('')
        }
      }
    } catch (err) {
      console.error('[KoreksiForm] Submit error:', err)
      setMessage({ type: 'error', text: 'Terjadi kesalahan sistem. Silakan coba lagi.' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full">
      {selected === null ? (
        <div className="space-y-6">
          <div className="mb-6">
            <Label htmlFor="search-input" className="mb-2">
              Cari Judul Artikel atau Argumen
            </Label>
            <Input
              id="search-input"
              type="text"
              placeholder="Ketik kata kunci minimal 2 karakter..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="bg-transparent"
            />
            {isSearching && (
              <div className="flex items-center gap-2 mt-3 text-sm text-text-secondary">
                <Loader2 className="w-4 h-4 animate-spin text-interactive-primary" />
                <span>Mencari artikel...</span>
              </div>
            )}
          </div>

          {results.length > 0 ? (
            <div className="border border-border-default/15 rounded divide-y divide-border-default/10 overflow-hidden bg-surface-sunken/10 mb-6">
              {results.map((item) => (
                <button
                  key={`${item.type}-${item.id}`}
                  type="button"
                  onClick={() => {
                    setSelected(item)
                    setMessage(null)
                  }}
                  className="w-full text-left p-4 hover:bg-surface-sunken/20 focus:bg-surface-sunken/20 transition-colors flex flex-col gap-1 focus:outline-none"
                >
                  <div className="flex items-center gap-2">
                    <Badge variant={item.type === 'artikel' ? 'success' : 'default'}>
                      {item.type === 'artikel' ? 'Artikel' : 'Argumen'}
                    </Badge>
                    {item.type === 'argumen' && item.authorUsername && (
                      <span className="text-xs text-text-secondary font-interface">
                        oleh @{item.authorUsername}
                      </span>
                    )}
                  </div>
                  <h4 className="font-libre text-sm font-bold text-text-primary line-clamp-1">
                    {item.title}
                  </h4>
                  {item.excerpt && (
                    <p className="font-interface text-xs text-text-secondary line-clamp-2 mt-0.5">
                      {item.excerpt}
                    </p>
                  )}
                </button>
              ))}
            </div>
          ) : (
            query.trim().length >= 2 && !isSearching && (
              <div className="py-8 text-center border border-border-default/15 rounded bg-surface-sunken/10">
                <p className="font-interface text-sm text-text-secondary">
                  Tidak ditemukan artikel atau argumen dengan judul &quot;{query}&quot;
                </p>
              </div>
            )
          )}
        </div>
      ) : (
        <div>
          {/* Selected Article Detail Card */}
          <div className="bg-surface-sunken/30 border border-border-default/15 rounded p-4 mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1.5">
                <Badge variant={selected.type === 'artikel' ? 'success' : 'default'}>
                  {selected.type === 'artikel' ? 'Artikel' : 'Argumen'}
                </Badge>
                {selected.type === 'argumen' && selected.authorUsername && (
                  <span className="text-xs text-text-secondary font-interface">
                    oleh @{selected.authorUsername}
                  </span>
                )}
              </div>
              <h3 className="font-libre text-base font-bold text-text-primary line-clamp-2 leading-snug">
                {selected.title}
              </h3>
              {selected.excerpt && (
                <p className="font-interface text-xs text-text-secondary mt-1.5 line-clamp-2 leading-relaxed">
                  {selected.excerpt}
                </p>
              )}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelected(null)
                setQuery('')
                setMessage(null)
              }}
              className="whitespace-nowrap shrink-0 self-start sm:self-center"
            >
              Ganti Pilihan
            </Button>
          </div>

          {/* Form usulan koreksi */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <Label htmlFor="original-text" required className="mb-1.5">
                Teks asli yang ingin dikoreksi
              </Label>
              <textarea
                id="original-text"
                value={originalText}
                onChange={(e) => setOriginalText(e.target.value)}
                className="w-full bg-surface-sunken/30 border border-border-default/25 focus:border-interactive-primary rounded px-3 py-2.5 font-interface text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none resize-y min-h-[90px] transition-colors"
                placeholder="Salin teks asli dari artikel..."
                required
              />
            </div>

            <div>
              <Label htmlFor="corrected-text" required className="mb-1.5">
                Teks yang diusulkan
              </Label>
              <textarea
                id="corrected-text"
                value={correctedText}
                onChange={(e) => setCorrectedText(e.target.value)}
                className="w-full bg-surface-sunken/30 border border-border-default/25 focus:border-interactive-primary rounded px-3 py-2.5 font-interface text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none resize-y min-h-[90px] transition-colors"
                placeholder="Tulis versi yang benar..."
                required
              />
            </div>

            <div>
              <Label htmlFor="explanation" className="mb-1.5">
                Penjelasan (opsional)
              </Label>
              <textarea
                id="explanation"
                value={explanation}
                onChange={(e) => setExplanation(e.target.value)}
                className="w-full bg-surface-sunken/30 border border-border-default/25 focus:border-interactive-primary rounded px-3 py-2.5 font-interface text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none resize-y min-h-[90px] transition-colors"
                placeholder="Mengapa ini perlu dikoreksi?"
              />
            </div>

            {message && (
              <div
                className={[
                  'p-4 rounded border text-sm font-interface flex items-start gap-3 transition-all',
                  message.type === 'success'
                    ? 'border-signal-success/40 bg-signal-success-surface text-text-primary'
                    : 'border-signal-danger/40 bg-signal-danger-surface text-text-primary',
                ].join(' ')}
              >
                <div className="shrink-0 mt-0.5">
                  {message.type === 'success' ? (
                    <CheckCircle className="w-5 h-5 text-signal-success" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-signal-danger" />
                  )}
                </div>
                <div>
                  <p className="font-bold font-interface">
                    {message.type === 'success' ? 'Sukses' : 'Gagal'}
                  </p>
                  <p className="text-text-secondary mt-1 leading-relaxed">
                    {message.text}
                  </p>
                </div>
              </div>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Mengirim...</span>
                </>
              ) : (
                'Kirim untuk Ditinjau'
              )}
            </Button>
          </form>
        </div>
      )}
    </div>
  )
}
