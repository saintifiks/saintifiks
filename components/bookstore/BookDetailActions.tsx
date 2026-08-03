'use client'

import { useState } from 'react'
import { Button } from '@/components/ui'
import { useCart } from './CartProvider'
import { formatIdr } from '@/lib/indices/format'

type Variant = {
  id: string
  sku: string
  format: string
  price_amount: number
  list_price: number | null
  stock_qty: number
}

type BookDetailActionsProps = {
  bookId: string
  title: string
  author: string
  coverImageUrl: string
  variants: Variant[]
}

export default function BookDetailActions({ bookId, title, author, coverImageUrl, variants }: BookDetailActionsProps) {
  const { addToCart } = useCart()
  const [selectedVariantId, setSelectedVariantId] = useState<string>(variants[0]?.id || '')
  const [quantity, setQuantity] = useState(1)

  const selectedVariant = variants.find(v => v.id === selectedVariantId)

  const handleIncrease = () => {
    if (selectedVariant && quantity < selectedVariant.stock_qty) setQuantity((q) => q + 1)
  }

  const handleDecrease = () => {
    if (quantity > 1) setQuantity((q) => q - 1)
  }

  const handleAdd = () => {
    if (!selectedVariant) return
    addToCart({
      variant_id: selectedVariant.id,
      book_id: bookId,
      title,
      author,
      format: selectedVariant.format,
      price: selectedVariant.price_amount,
      cover_image_url: coverImageUrl,
      quantity,
    })
    alert(`${quantity} ${selectedVariant.format} ditambahkan ke keranjang!`)
  }

  if (variants.length === 0) {
    return <div className="mt-8"><Button variant="secondary" className="w-full" disabled>Tidak Tersedia</Button></div>
  }

  return (
    <div className="mt-6 space-y-6">
      
      {/* Varian Harga & Format */}
      <div className="space-y-3">
        <p className="font-interface text-sm font-semibold text-text-primary">Pilih Format:</p>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {variants.map((v) => (
            <button
              key={v.id}
              onClick={() => { setSelectedVariantId(v.id); setQuantity(1); }}
              className={`flex flex-col text-left p-3 border rounded-md transition-all duration-150 ${
                selectedVariantId === v.id 
                  ? 'border-interactive-primary bg-interactive-primary/5 ring-1 ring-interactive-primary' 
                  : 'border-border-default/30 hover:border-interactive-primary/50'
              }`}
            >
              <span className="font-interface text-sm font-bold capitalize mb-1">{v.format}</span>
              <span className="font-interface text-sm text-text-secondary">{formatIdr(v.price_amount)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Kontrol Kuantitas & Tombol Tambah */}
      {selectedVariant && (
        <div className="p-4 bg-surface-sunken border border-border-default/20 rounded-md">
          <div className="flex items-end justify-between mb-4">
            <div>
              {selectedVariant.list_price && selectedVariant.list_price > selectedVariant.price_amount && (
                <span className="font-interface text-sm text-text-tertiary line-through mr-2">
                  {formatIdr(selectedVariant.list_price)}
                </span>
              )}
              <span className="font-interface text-3xl font-bold text-interactive-primary">
                {formatIdr(selectedVariant.price_amount)}
              </span>
            </div>
          </div>

          {selectedVariant.stock_qty <= 0 ? (
            <Button variant="secondary" className="w-full" disabled>Stok Habis</Button>
          ) : (
            <div className="flex gap-4">
              <div className="flex items-center border border-border-default/50 rounded-md bg-white">
                <button type="button" onClick={handleDecrease} disabled={quantity <= 1} className="w-11 h-11 flex items-center justify-center text-text-primary hover:bg-border-default/20 disabled:opacity-30">-</button>
                <span className="w-10 font-interface text-center text-sm font-semibold">{quantity}</span>
                <button type="button" onClick={handleIncrease} disabled={quantity >= selectedVariant.stock_qty} className="w-11 h-11 flex items-center justify-center text-text-primary hover:bg-border-default/20 disabled:opacity-30">+</button>
              </div>
              <Button size="lg" className="flex-1" onClick={handleAdd}>Tambah ke Keranjang</Button>
            </div>
          )}
          
          <p className="font-interface text-xs text-text-tertiary mt-3">
            Tersisa {selectedVariant.stock_qty} stok untuk format {selectedVariant.format}.
          </p>
        </div>
      )}
    </div>
  )
}