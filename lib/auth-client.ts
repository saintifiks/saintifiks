// Helper login sisi klien: satu cara memulai Google OAuth dan satu cara mengingat "apa yang sedang ingin
// dilakukan pengguna" agar tindakan itu dilanjutkan otomatis setelah kembali dari Google
// (login bukan lagi tembok yang membuang aksi pengguna).

import { createClient } from '@/lib/supabase/client'

export async function signInWithGoogle(next: string): Promise<void> {
  const supabase = createClient()
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      queryParams: { prompt: 'select_account' },
      redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
    },
  })
}

const INTENT_KEY = 'saintifiks-pending-intent'

export type PendingIntent = { type: 'like' | 'comment' | 'save'; articleId: string }

export function saveIntent(intent: PendingIntent): void {
  try {
    sessionStorage.setItem(INTENT_KEY, JSON.stringify(intent))
  } catch {
    // penyimpanan tidak tersedia (mode privat) — tindakan tidak dilanjutkan otomatis, tidak fatal
  }
}

// Mengembalikan true (sekali saja) bila ada niat yang cocok; menghapusnya agar tidak berulang.
export function takeIntent(type: PendingIntent['type'], articleId: string): boolean {
  try {
    const raw = sessionStorage.getItem(INTENT_KEY)
    if (!raw) return false
    const intent = JSON.parse(raw) as PendingIntent
    if (intent.type === type && intent.articleId === articleId) {
      sessionStorage.removeItem(INTENT_KEY)
      return true
    }
  } catch {
    // abaikan
  }
  return false
}
