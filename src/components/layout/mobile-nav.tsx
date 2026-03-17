'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, HandHeart, Images, HandCoins } from 'lucide-react';

// Navigation items (excluding center button)
const leftNav = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'Penerimaan', href: '/penerimaan', icon: Users },
];

const rightNav = [
  { name: 'Penyaluran', href: '/penyaluran', icon: HandHeart },
  { name: 'Dokumentasi', href: '/dokumentasi', icon: Images },
];

export function MobileNav() {
  const pathname = usePathname();

  // Jangan tampilkan di halaman admin atau login
  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  const isZakatActive = pathname === '/zakat-online' || pathname?.startsWith('/zakat-online');

  return (
    <>
      {/* Floating Zakat Button - separate from nav */}
      <Link
        href="/zakat-online"
        className="md:hidden fixed bottom-2 left-1/2 -translate-x-1/2 z-[60] flex flex-col items-center"
      >
        <div
          className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all ${isZakatActive
            ? 'bg-[#355e41]'
            : 'bg-gradient-to-br from-[#355e41] to-[#4A8A5D] hover:scale-105'
            }`}
          style={{
            boxShadow: '0 4px 20px rgba(89, 158, 110, 0.4)',
          }}
        >
          <HandCoins className="w-8 h-8 text-white" />
        </div>
        <span
          className={`text-xs mt-1 font-semibold ${isZakatActive ? 'text-[#599E6E]' : 'text-gray-700'
            }`}
        >
          Zakat
        </span>
      </Link>

      {/* Bottom Navigation Bar */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
        <div className="flex justify-around items-center h-16">
          {/* Left navigation items */}
          {leftNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-colors ${isActive
                  ? 'text-[#599E6E]'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}

          {/* Empty space for floating button */}
          <div className="flex-1" />

          {/* Right navigation items */}
          {rightNav.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-colors ${isActive
                  ? 'text-[#599E6E]'
                  : 'text-gray-500 hover:text-gray-700'
                  }`}
              >
                <Icon className={`w-6 h-6 ${isActive ? 'stroke-[2.5]' : ''}`} />
                <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>
                  {item.name}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
