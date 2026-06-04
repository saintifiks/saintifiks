// Komponen Logo Berlian — diamond mark dengan huruf "S"
// Digunakan oleh FooterMobile dan FooterDesktop

interface DiamondLogoProps {
  size?: number;
  className?: string;
}

export default function DiamondLogo({ size = 72, className = '' }: DiamondLogoProps) {
  return (
    <div
      className={`flex items-center justify-center ${className}`}
      style={{ width: size, height: size }}
    >
      {/* Diamond shape — rotated square */}
      <div
        className="bg-paper flex items-center justify-center"
        style={{
          width: size,
          height: size,
          transform: 'rotate(45deg)',
          borderRadius: 0,
        }}
      >
        {/* Letter "S" — counter-rotated to stay upright */}
        <span
          className="font-display text-ink font-normal"
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
