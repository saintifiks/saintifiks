// Plugin remark kustom untuk callout box (> [!NOTE], > [!WARNING], dll.)
//
// CARA KERJA:
// 1. Plugin ini berjalan di AST (pohon sintaks abstrak) Markdown, SEBELUM dirender
// 2. Mencari node 'blockquote' yang teks pertamanya adalah [!TIPE]
// 3. Menambahkan properti 'data-callout-type' ke node tersebut
// 4. ArticleRenderer.tsx membaca properti ini dan menampilkan callout box berwarna
//
// TIDAK MEMBUTUHKAN library baru — semua ditulis dari nol.

type MdastNode = {
  type: string
  value?: string
  children?: MdastNode[]
  data?: {
    hProperties?: Record<string, string>
    [key: string]: unknown
  }
}

// Tipe callout yang didukung
const CALLOUT_TYPES = ['NOTE', 'WARNING', 'IMPORTANT', 'TIP'] as const

export default function remarkCallout() {
  return (tree: MdastNode) => {
    // Fungsi rekursif untuk menelusuri seluruh AST
    function walk(node: MdastNode) {
      if (node.type === 'blockquote') {
        processCallout(node)
      }
      if (node.children) {
        node.children.forEach(walk)
      }
    }

    walk(tree)
  }
}

function processCallout(node: MdastNode) {
  // Cek apakah anak pertama adalah paragraf
  const firstChild = node.children?.[0]
  if (!firstChild || firstChild.type !== 'paragraph') return

  // Cek apakah teks pertama di paragraf itu dimulai dengan [!TIPE]
  const firstText = firstChild.children?.[0]
  if (!firstText || firstText.type !== 'text' || !firstText.value) return

  // Cari pola [!NOTE], [!WARNING], [!IMPORTANT], atau [!TIP]
  const pattern = new RegExp(
    '^\\[!(' + CALLOUT_TYPES.join('|') + ')\\][ \\t]?'
  )
  const match = firstText.value.match(pattern)
  if (!match) return

  const calloutType = match[1]

  // Hapus prefix [!TIPE] dari teks agar tidak muncul di UI
  firstText.value = firstText.value.slice(match[0].length)

  // Jika teks setelah prefix kosong dan tidak ada teks lain di paragraf,
  // hapus paragraf kosong itu agar tidak ada baris kosong di atas konten
  if (firstText.value === '' && firstChild.children?.length === 1) {
    node.children = node.children?.slice(1)
  }

  // Tandai node dengan properti yang akan diteruskan ke HTML/React
  // (via mekanisme data.hProperties milik ekosistem remark/rehype)
  node.data = node.data ?? {}
  node.data.hProperties = {
    ...(node.data.hProperties ?? {}),
    'data-callout-type': calloutType.toLowerCase(),
  }
}