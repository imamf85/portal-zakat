'use client';

import Image from 'next/image';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Jangan tampilkan footer di halaman admin
  if (pathname?.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-[#599E6E] text-white mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="text-center">

          <h3 className="text-xl font-bold">
            Musholla Al-Hikmah
          </h3>
          <p className="mt-1 text-white/80 text-sm">
            Menebar Kebaikan, Membangun Ummat
          </p>

          <div className="mt-6 py-6 border-t border-white/20">
            <p className="text-sm text-white/70 italic">
              &quot;Dan dirikanlah shalat, tunaikanlah zakat dan ruku&apos;lah beserta orang-orang yang ruku&apos;&quot;
            </p>
            <p className="mt-1 text-xs text-white/50">
              QS. Al-Baqarah: 43
            </p>
          </div>

          <div className="pt-6 border-t border-white/20">
            <p className="text-xs text-white/60">
              &copy; {new Date().getFullYear()} Musholla Al-Hikmah. Portal Zakat.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
