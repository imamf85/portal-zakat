'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, HandHeart, Images, FileDown } from 'lucide-react';

const navigation = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'Penerimaan', href: '/penerimaan', icon: Users },
  { name: 'Penyaluran', href: '/penyaluran', icon: HandHeart },
  { name: 'Dokumentasi', href: '/dokumentasi', icon: Images },
  { name: 'Laporan', href: '/laporan', icon: FileDown },
];

export function MobileNav() {
  const pathname = usePathname();

  // Jangan tampilkan di halaman admin atau login
  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around items-center h-16">
        {navigation.map((item) => {
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
