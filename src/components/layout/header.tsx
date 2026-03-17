'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Home, Users, HandHeart, Images, FileDown, Menu, X, Settings, HandCoins } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/providers/auth-provider';

const navigation = [
  { name: 'Beranda', href: '/', icon: Home },
  { name: 'Penerimaan', href: '/penerimaan', icon: Users },
  { name: 'Penyaluran', href: '/penyaluran', icon: HandHeart },
  { name: 'Dokumentasi', href: '/dokumentasi', icon: Images },
  { name: 'Laporan', href: '/laporan', icon: FileDown },
];

export function Header() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user } = useAuth();

  // Jangan tampilkan header di halaman admin atau login
  if (pathname?.startsWith('/admin') || pathname === '/login') {
    return null;
  }

  const isZakatActive = pathname === '/zakat-online' || pathname?.startsWith('/zakat-online');

  return (
    <header className="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-3">
              <Image
                src="/logo_alhikmah.png"
                alt="Logo Musholla Al-Hikmah"
                width={75}
                height={75}
                className="rounded-lg"
              />
              <div className="hidden sm:block">
                <h1 className="text-lg font-bold text-gray-900">Portal Zakat</h1>
                <p className="text-xs text-gray-500">Musholla Al-Hikmah</p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {/* Zakat Online - Prominent CTA Button */}
            <Link
              href="/zakat-online"
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all mr-2 ${
                isZakatActive
                  ? 'bg-[#599E6E] text-white shadow-md'
                  : 'bg-gradient-to-r from-[#599E6E] to-[#4A8A5D] text-white shadow-md hover:shadow-lg hover:scale-[1.02]'
              }`}
            >
              <HandCoins className="w-4 h-4" />
              Zakat Online
            </Link>

            <div className="w-px h-6 bg-gray-200 mx-2" />

            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive
                    ? 'bg-[#599E6E]/10 text-[#599E6E]'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                  <Icon className="w-4 h-4" />
                  {item.name}
                </Link>
              );
            })}
            {user && (
              <Link
                href="/admin"
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 ml-2 border-l border-gray-200 pl-4"
              >
                <Settings className="w-4 h-4" />
                Admin
              </Link>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <nav className="md:hidden py-4 border-t border-gray-100">
            {/* Zakat Online - Prominent in mobile menu too */}
            <Link
              href="/zakat-online"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-semibold mb-2 ${
                isZakatActive
                  ? 'bg-[#599E6E] text-white'
                  : 'bg-gradient-to-r from-[#599E6E] to-[#4A8A5D] text-white'
              }`}
            >
              <HandCoins className="w-5 h-5" />
              Zakat Online
            </Link>

            {navigation.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium ${isActive
                    ? 'bg-[#599E6E]/10 text-[#599E6E]'
                    : 'text-gray-600 hover:bg-gray-50'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              );
            })}
            {user && (
              <Link
                href="/admin"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 mt-2 border-t border-gray-100 pt-4"
              >
                <Settings className="w-5 h-5" />
                Admin Panel
              </Link>
            )}
          </nav>
        )}
      </div>
    </header>
  );
}
