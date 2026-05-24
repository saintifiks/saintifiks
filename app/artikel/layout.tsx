// Layout khusus halaman artikel — memuat CSS yang hanya dibutuhkan di halaman artikel
// KaTeX (~60KB) dan highlight.js (~10KB) tidak perlu dimuat di halaman lain (beranda, akun, dll)
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'

export default function ArtikelLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
