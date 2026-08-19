import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Badge, Divider } from '@/components/ui'
import Link from '@/components/ui/Link'
import BookDetailActions from '@/components/bookstore/BookDetailActions'

export const dynamic = 'force-dynamic'

type VariantData = {
  id: string
  sku: string
  format: string
  price_amount: number
  list_price: number | null
  stock_qty: number
  is_active: boolean
}

export async function generateMetadata(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient()
  const { data: book } = await supabase.from('books').select('title, description').eq('slug', params.slug).maybeSingle()
  if (!book) return { title: 'Buku Tidak Ditemukan' }
  return { title: `${book.title} — Saintifiks Bookstore`, description: book.description }
}

export default async function BookDetailPage(props: { params: Promise<{ slug: string }> }) {
  const params = await props.params;
  const supabase = await createClient()

  const { data: book, error } = await supabase
    .from('books')
    .select(`
      id, title, description, cover_image_url,
      authors ( name ),
      book_variants ( id, sku, format, price_amount, list_price, stock_qty, is_active )
    `)
    .eq('slug', params.slug)
    .eq('status', 'active')
    .maybeSingle()

  if (error || !book) notFound()

  // Ekstraksi data author dengan aman menggunakan "unknown" untuk memuaskan TypeScript
  const rawAuthor = Array.isArray(book.authors) ? book.authors[0] : book.authors
  const authorName = (rawAuthor as unknown as { name: string } | null)?.name ?? 'Penulis Tidak Diketahui'

  // Ekstraksi varian dengan aman
  const variants = (book.book_variants as unknown as VariantData[] | null)?.filter((v) => v.is_active) || []

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="max-w-4xl mx-auto px-5 py-12 md:py-16">
        <Link href="/bookstore" variant="muted" className="inline-flex mb-8 font-interface text-sm font-medium">
          ← Kembali ke Katalog
        </Link>

        <div className="grid md:grid-cols-[300px_1fr] gap-8 md:gap-12 items-start">
          <div className="rounded-md border border-border-default/20 overflow-hidden bg-surface-elevated w-full aspect-[3/4] relative">
            {book.cover_image_url ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img src={book.cover_image_url} alt={book.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-interface text-text-tertiary">Tanpa Cover</div>
            )}
          </div>

          <div>
            <Badge variant="kicker" className="mb-4">Buku Fisik & Digital</Badge>
            <h1 className="font-display text-3xl md:text-4xl font-bold text-text-primary leading-tight mb-2">
              {book.title}
            </h1>
            <p className="font-interface text-lg text-text-secondary mb-6">
              Oleh <span className="font-semibold text-text-primary">{authorName}</span>
            </p>

            <BookDetailActions 
              bookId={book.id} 
              title={book.title} 
              author={authorName} 
              coverImageUrl={book.cover_image_url ?? ''} 
              variants={variants} 
            />

            <Divider spacing="lg" />

            <div>
              <h3 className="font-interface font-bold text-text-primary mb-3">Deskripsi Buku</h3>
              <div className="font-interface text-text-secondary leading-relaxed space-y-4 whitespace-pre-wrap">
                {book.description || 'Tidak ada deskripsi rinci untuk buku ini.'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}