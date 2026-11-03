// Jumlah pekerjaan yang menunggu admin, dipakai penanda angka di menu dan antrean di Beranda admin.
// Hanya hitungan (head: true), tanpa baris data. Galat apa pun menghasilkan 0 — menu tidak boleh gagal karena ini.

import { createAdminClient } from '@/lib/supabase/admin'

export type PendingCounts = Record<string, number>

export async function getPendingCounts(): Promise<PendingCounts> {
  try {
    const admin = createAdminClient()
    const count = (table: string) => admin.from(table).select('id', { count: 'exact', head: true }).eq('status', 'pending')
    const [articleCorrections, opinionCorrections, reports] = await Promise.all([
      count('article_corrections'),
      count('opinion_corrections'),
      count('article_reports'),
    ])
    return {
      '/dashboard/koreksi': (articleCorrections.count ?? 0) + (opinionCorrections.count ?? 0),
      '/dashboard/opinions': reports.count ?? 0,
    }
  } catch {
    return {}
  }
}
