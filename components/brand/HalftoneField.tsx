// HalftoneField — bidang berlian bergaya halftone/dither, dibuat dengan kode (tanpa berkas gambar).
// Setiap sel menggambar satu berlian (bentuk logo) dengan ukuran bertingkat; tekstur "dither" muncul dari
// matriks Bayer 4×4. Bentuk dasarnya gelombang data yang berlapis, memudar ke tepi — selaras dengan
// "Mereka punya narasi, kami punya angka." Server Component, deterministik (hasil sama di tiap render).

const BAYER_4 = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
]

const LEVELS = 5 // ukuran berlian: 0 (kosong) … 4 (penuh)

function fieldValue(x: number, y: number, cols: number, rows: number): number {
  const nx = x / cols
  const ny = y / rows
  // beberapa gelombang bertumpuk — kesan lapisan data/medan
  const w1 = Math.sin(nx * 9 + ny * 3.2) * 0.5 + 0.5
  const w2 = Math.sin(nx * 4.5 - ny * 7.5 + 1.3) * 0.5 + 0.5
  const w3 = Math.sin((nx + ny) * 14) * 0.5 + 0.5
  const base = w1 * 0.5 + w2 * 0.35 + w3 * 0.15
  // pemudaran ke tepi kiri-bawah agar teks di atasnya tetap terbaca, dan terang di kanan-atas
  const light = 0.35 + 0.65 * (0.55 * nx + 0.45 * (1 - ny))
  return Math.min(1, Math.max(0, base * light * 1.25))
}

export default function HalftoneField({
  cols = 44,
  rows = 44,
  className = '',
}: {
  cols?: number
  rows?: number
  className?: string
}) {
  const cell = 10
  let d = ''
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      const v = fieldValue(x, y, cols, rows)
      const threshold = BAYER_4[y % 4][x % 4] / 16 - 0.5
      const level = Math.max(0, Math.min(LEVELS - 1, Math.floor(v * LEVELS + threshold + 0.5)))
      if (level === 0) continue
      const half = (cell * 0.5 * level) / (LEVELS - 1)
      const cx = x * cell + cell / 2
      const cy = y * cell + cell / 2
      // berlian: empat titik di atas/kanan/bawah/kiri pusat
      d += `M${cx} ${cy - half}L${cx + half} ${cy}L${cx} ${cy + half}L${cx - half} ${cy}Z`
    }
  }

  return (
    <svg
      viewBox={`0 0 ${cols * cell} ${rows * cell}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={className}
      fill="currentColor"
    >
      <path d={d} />
    </svg>
  )
}
