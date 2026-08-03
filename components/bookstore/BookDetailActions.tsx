'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { useCart } from './CartProvider'

type BookDetailActionsProps = {
  book: {
    id: string
    title: string
    author: string
    price: number
    cover_image_url: string | null
    stock: number
  }
}

export default function BookDetailActions({ book }: BookDetailActionsProps) {
  const { addToCart } = useCart()
  const [quantity, setQuantity] = useState(1)

  const handleIncrease = () => {
    if (quantity < book.stock) setQuantity((q) => q + 1)
  }

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((q) => q - 1)
  }

  const handleAdd = () => {
    addToCart({
      book_id: book.id,
      title: book.title,
      author: book.author,
      price: book.price,
      cover_image_url: book.cover_image_url ?? '',
      quantity,
    })
    alert(`${quantity} eksemplar ditambahkan ke keranjang!`)
  }

  if (book.stock <= 0) {
    return (
      <div className="mt-8">
        <Button variant="secondary" className="w-full" disabled>
          Stok Habis
        </Button>
      </div>
    )
  }

  return (
    <div className="mt-8 space-y-4">
      <div className="flex items-center gap-4">
        <span className="font-interface text-sm text-text-secondary">
          Kuantitas:
        </span>
        <div className="flex items-center border border-border-default/30 rounded-md bg-surface-sunken">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1}
            className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-border-default/20 disabled:opacity-30"
          >
            -
          </button>
          <span className="w-10 font-interface text-center text-sm font-semibold">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= book.stock}
            className="w-10 h-10 flex items-center justify-center text-text-primary hover:bg-border-default/20 disabled:opacity-30"
          >
            +
          </button>
        </div>
        <span className="font-interface text-xs text-text-tertiary">
          Tersisa {book.stock} stok
        </span>
      </div>

      <Button size="lg" className="w-full" onClick={handleAdd}>
        Tambah ke Keranjang
      </Button>
    </div>
  )
}