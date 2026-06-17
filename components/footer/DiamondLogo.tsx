// Komponen Logo Berlian — diamond mark dengan huruf "S"
// Digunakan oleh FooterMobile dan FooterDesktop

interface DiamondLogoProps {
  size?: number;
  className?: string;
  variant?: 'default' | 'dark';
}

export default function DiamondLogo({ size = 72, className = '', variant = 'default' }: DiamondLogoProps) {
  const isDark = variant === 'dark';

  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Diamond shape — rotated square */}
      <div
        className={isDark ? 'bg-[#E8E4DC] flex items-center justify-center' : 'bg-paper flex items-center justify-center'}
        style={{
          width: size,
          height: size,
          transform: 'rotate(45deg)',
          borderRadius: 0,
        }}
      >
        {/* Letter "S" — counter-rotated to stay upright */}
        <span
          className={isDark ? 'font-display text-[#1A1917] font-normal' : 'font-display text-ink font-normal'}
          style={{
            fontSize: Math.floor(size * 0.44), // ~32px for 72px diamond
            transform: 'rotate(-45deg)',
            lineHeight: 1,
          }}
        >
          S
        </span>
      </div>
    </div>
  );
}
