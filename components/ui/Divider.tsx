type DividerProps = {
  className?: string
  /** Ketebalan garis dalam px */
  thickness?: 1 | 2
  /** Jarak vertikal */
  spacing?: 'sm' | 'md' | 'lg'
}

const spacingClasses = {
  sm: 'my-2',
  md: 'my-4',
  lg: 'my-8',
}

export default function Divider({
  className = '',
  thickness = 2,
  spacing = 'md',
}: DividerProps) {
  return (
    <hr
      role="separator"
      aria-hidden="true"
      className={[
        'border-0 w-full bg-warm-gray',
        thickness === 1 ? 'h-px' : 'h-0.5',
        spacingClasses[spacing],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
