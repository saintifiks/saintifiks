// Format tanggal bahasa Indonesia untuk metadata artikel. Zona waktu tetap WIB agar server dan klien selalu sama
// (menghindari beda tampilan/hydration mismatch di sekitar tengah malam UTC).

const TZ = 'Asia/Jakarta'

export function formatTanggalPendek(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ })
}

export function formatTanggalPanjang(date: Date = new Date()): string {
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: TZ,
  })
}
