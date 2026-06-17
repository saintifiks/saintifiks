type SkeletonProps = {
  className?: string
  /** Bentuk skeleton */
  variant?: 'text' | 'rect' | 'circle'
}

const variantClasses = {
  text: 'h-4 w-full rounded-sm',
  rect: 'h-32 w-full rounded-md',
  circle: 'h-10 w-10 rounded-full',
}

export default function Skeleton({ className = '', variant = 'text' }: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={[
        'animate-pulse bg-border-default/20',
        variantClasses[variant],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    />
  )
}
