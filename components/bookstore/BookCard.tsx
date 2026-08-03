'use client'

import Link from 'next/link'
import { formatIdr } from '@/lib/indices/format'
import { Button } from '@/components/ui'
import { useCart } from './CartProvider'

type Book = {
  id: string
  slug: string
  title: string
  author: string
  price: number
  cover_image_url: string | null
  stock: number
}

export default function BookCard({ book }: { book: Book }) {
  const { addToCart } = useCart()

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    addToCart({
      book_id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover_image_url: book.cover_image_url ?? '',
      quantity: 1,
    })
    alert('Buku berhasil ditambahkan ke keranjang!')
  }

  return (
    <Link
      href={`/bookstore/${book.slug}`}
      className="group flex flex-col border border-border-default/20 rounded-md overflow-hidden hover:border-interactive-primary/40 transition-colors duration-fast bg-surface-elevated"
    >
      <div className="relative aspect-[3/4] w-full bg-surface-sunken overflow-hidden">
        {book.cover_image_url ? (
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
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display text-lg font-bold text-text-primary leading-snug line-clamp-2 mb-1 group-hover:text-text-link transition-colors">
          {book.title}
        </h3>
        <p className="font-interface text-sm text-text-secondary mb-3">
          {book.author}
        </p>
        <div className="mt-auto pt-4 flex items-center justify-between">
          <span className="font-interface font-semibold text-interactive-primary">
            {formatIdr(book.price)}
          </span>
        </div>
        <Button
          size="sm"
          variant={book.stock > 0 ? 'primary' : 'secondary'}
          className="w-full mt-4"
          disabled={book.stock <= 0}
          onClick={handleAddToCart}
        >
          {book.stock > 0 ? 'Tambah ke Keranjang' : 'Stok Habis'}
        </Button>
      </div>
    </Link>
  )
}