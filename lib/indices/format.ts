const idCurrency = new Intl.NumberFormat('id-ID', {
  style: 'currency',
  currency: 'IDR',
  maximumFractionDigits: 0,
})

export function formatNumber(value: number, decimals = 2): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value)
}

export function formatIdr(value: number): string {
  return idCurrency.format(value)
}

export function formatPercent(value: number): string {
  return `${formatNumber(value, 2)}%`
}
