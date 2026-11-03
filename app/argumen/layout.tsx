// Layout khusus halaman opinions — memuat CSS yang hanya dibutuhkan di halaman artikel opinions
// KaTeX dan highlight.js sama-sama dipakai di OpinionContentRenderer
import 'katex/dist/katex.min.css'
import 'highlight.js/styles/github.css'

export default function OpinionsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
