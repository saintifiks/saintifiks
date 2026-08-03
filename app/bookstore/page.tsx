import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import BookCard from '@/components/bookstore/BookCard'
import { Badge } from '@/components/ui'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Katalog Buku — Saintifiks Bookstore',
  description: 'Temukan buku-buku fisik pilihan dengan analisis struktural.',
}

export default async function BookstorePage() {
  const supabase = await createClient()

  // Ambil buku yang aktif
  const { data: books, error } = await supabase
    .from('books')
    .select('*')
    .eq('is_active', true)
    .order('created_at', { ascending: false })

  const items = books ?? []

  return (
    <main className="min-h-screen bg-surface-page">
      <div className="max-w-5xl mx-auto px-5 py-12 md:py-16">
        <header className="mb-10 text-center">
          <Badge variant="kicker" className="mb-3">
            Bookstore
          </Badge>
          <h1 className="font-display text-4xl font-bold text-text-primary leading-tight">
            Katalog Buku
          </h1>
          <p className="font-interface text-base text-text-secondary mt-4 max-w-xl mx-auto">
            Buku fisik hasil kurasi redaksi. Temukan perspektif struktural dan angka yang tak sekadar narasi.
          </p>
        </header>

        {error && (
          <div className="p-4 mb-8 bg-signal-danger-surface border border-signal-danger/20 rounded-md text-signal-danger text-sm">
            Gagal memuat katalog buku: {error.message}
          </div>
        )}

        {items.length === 0 && !error ? (
          <div className="py-20 text-center border border-border-default/20 rounded-md bg-surface-elevated">
            <p className="font-interface text-text-secondary">
              Katalog buku sedang kosong. Kami akan segera memperbaruinya.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {items.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}