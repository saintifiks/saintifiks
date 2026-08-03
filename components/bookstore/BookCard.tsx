'use client'

import Link from 'next/link'
import { formatIdr } from '@/lib/indices/format'

type BookVariant = {
  id: string
  format: string
  price_amount: number
  stock_qty: number
  is_active: boolean
}

type Book = {
  id: string
  slug: string
  title: string
  cover_image_url: string | null
  authors: { name: string } | null
  book_variants: BookVariant[]
}

export default function BookCard({ book }: { book: Book }) {
  const authorName = book.authors?.name ?? 'Penulis Tidak Diketahui'
  
  // Filter varian yang aktif
  const activeVariants = book.book_variants?.filter(v => v.is_active) || []
  
  // Hitung total stok dari semua varian
  const totalStock = activeVariants.reduce((sum, v) => sum + v.stock_qty, 0)
  
  // Cari harga termurah untuk label "Mulai dari"
  const lowestPrice = activeVariants.length > 0 
    ? Math.min(...activeVariants.map(v => v.price_amount)) 
    : 0

  return (
    <Link
      href={`/bookstore/${book.slug}`}
      className="group flex flex-col border border-border-default/20 rounded-md overflow-hidden hover:border-interactive-primary/40 transition-colors duration-fast bg-surface-elevated"
    >
      <div className="relative aspect-[3/4] w-full bg-surface-sunken overflow-hidden">
        {book.cover_image_url ? (
        /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={book.cover_image_url}
            alt={book.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-moderate"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center font-interface text-xs text-text-tertiary">
            Tanpa Cover
          </div>
        )}
        
        {totalStock <= 0 && activeVariants.length > 0 && (
          <div className="absolute top-2 right-2 bg-signal-danger text-white text-[10px] uppercase tracking-widest px-2 py-1 rounded-sm font-bold">
            Habis
          </div>
        )}
      </div>
      
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg font-bold text-text-primary leading-snug line-clamp-2 mb-1 group-hover:text-text-link transition-colors">
          {book.title}
        </h3>
        <p className="font-interface text-sm text-text-secondary mb-3">
          {authorName}
        </p>
        <div className="mt-auto pt-4 flex flex-col">
          {activeVariants.length > 0 ? (
            <>
              {activeVariants.length > 1 && (
                <span className="font-interface text-[11px] text-text-tertiary uppercase tracking-wider mb-0.5">Mulai dari</span>
              )}
              <span className="font-interface font-semibold text-interactive-primary">
                {formatIdr(lowestPrice)}
              </span>
            </>
          ) : (
            <span className="font-interface text-sm text-signal-danger">Tidak tersedia</span>
          )}
        </div>
      </div>
    </Link>
  )
}