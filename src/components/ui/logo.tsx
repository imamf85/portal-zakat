'use client';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon';
  className?: string;
}

export function Logo({ size = 'md', variant = 'full', className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 32, text: 'text-sm' },
    md: { icon: 40, text: 'text-base' },
    lg: { icon: 56, text: 'text-xl' },
  };

  const { icon: iconSize, text: textSize } = sizes[size];

  // SVG Logo - Bulan sabit dengan kubah masjid
  const LogoIcon = () => (
    <svg
      width={iconSize}
      height={iconSize}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="flex-shrink-0"
    >
      {/* Lingkaran putih */}
      <circle cx="50" cy="50" r="45" fill="white" />

      {/* Bulan sabit */}
      <path
        d="M35 20C25 30 20 45 25 60C30 75 45 85 65 80C55 85 40 82 30 70C20 58 22 40 35 20Z"
        fill="#599E6E"
      />

      {/* Kubah masjid */}
      <ellipse cx="60" cy="45" rx="12" ry="10" fill="#599E6E" />

      {/* Badan masjid */}
      <rect x="50" y="52" width="20" height="18" fill="#599E6E" />

      {/* Pintu */}
      <path
        d="M56 70V60C56 57 58 55 60 55C62 55 64 57 64 60V70H56Z"
        fill="white"
      />

      {/* Puncak dengan bulan */}
      <path
        d="M60 35C60 33 61 32 62 32C63 32 64 33 64 35L62 38L60 35Z"
        fill="#599E6E"
      />
      <circle cx="62" cy="30" r="3" fill="#599E6E" />
    </svg>
  );

  if (variant === 'icon') {
    return (
      <div className={`bg-[#599E6E] p-1 rounded-lg ${className}`}>
        <LogoIcon />
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="bg-[#599E6E] p-1.5 rounded-xl">
        <LogoIcon />
      </div>
      <div>
        <h1 className={`font-bold text-gray-900 ${textSize}`}>
          Musholla Al Hikmah
        </h1>
        <p className="text-xs text-gray-500">
          Menebar Kebaikan, Membangun Ummat
        </p>
      </div>
    </div>
  );
}

// Komponen logo sederhana untuk header
export function LogoSimple({ className = '' }: { className?: string }) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <div className="w-10 h-10 bg-[#599E6E] rounded-lg flex items-center justify-center">
        <svg
          width="28"
          height="28"
          viewBox="0 0 100 100"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle cx="50" cy="50" r="45" fill="white" />
          <path
            d="M35 20C25 30 20 45 25 60C30 75 45 85 65 80C55 85 40 82 30 70C20 58 22 40 35 20Z"
            fill="#599E6E"
          />
          <ellipse cx="60" cy="45" rx="12" ry="10" fill="#599E6E" />
          <rect x="50" y="52" width="20" height="18" fill="#599E6E" />
          <path
            d="M56 70V60C56 57 58 55 60 55C62 55 64 57 64 60V70H56Z"
            fill="white"
          />
        </svg>
      </div>
      <div className="hidden sm:block">
        <h1 className="text-lg font-bold text-gray-900">Portal Zakat</h1>
        <p className="text-xs text-gray-500">Musholla Al-Hikmah</p>
      </div>
    </div>
  );
}
