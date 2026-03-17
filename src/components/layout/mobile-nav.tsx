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
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-area-bottom">
      {/* Background */}
      <div className="absolute inset-0 bg-white border-t border-gray-200" />

      <div className="relative flex justify-around items-end h-16 px-2">
        {/* Left navigation items */}
        {leftNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-colors ${
                isActive
                  ? 'text-[#599E6E]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* Center floating button - Zakat Online */}
        <div className="flex flex-col items-center justify-end flex-1 relative">
          <Link
            href="/zakat-online"
            className="absolute -top-6 flex flex-col items-center"
          >
            {/* Floating button */}
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                isZakatActive
                  ? 'bg-[#599E6E] shadow-[#599E6E]/40'
                  : 'bg-gradient-to-br from-[#599E6E] to-[#4A8A5D] shadow-[#599E6E]/30 hover:shadow-[#599E6E]/50 hover:scale-105'
              }`}
              style={{
                boxShadow: isZakatActive
                  ? '0 8px 24px rgba(89, 158, 110, 0.5)'
                  : '0 8px 20px rgba(89, 158, 110, 0.35)',
              }}
            >
              <HandCoins className="w-7 h-7 text-white" />
            </div>
            <span
              className={`text-[10px] mt-1.5 font-medium ${
                isZakatActive ? 'text-[#599E6E]' : 'text-gray-600'
              }`}
            >
              Zakat
            </span>
          </Link>
        </div>

        {/* Right navigation items */}
        {rightNav.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 h-full px-1 transition-colors ${
                isActive
                  ? 'text-[#599E6E]'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
              <span className={`text-[10px] mt-1 ${isActive ? 'font-medium' : ''}`}>
                {item.name}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
