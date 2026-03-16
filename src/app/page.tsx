import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { getStatistikDashboard } from '@/lib/api';
import { getCurrentHijriYear } from '@/lib/supabase';
import { RealtimeDashboard } from '@/components/dashboard/realtime-dashboard';

export const revalidate = 60;

export default async function Home() {
  const stats = await getStatistikDashboard();
  const tahunHijriah = getCurrentHijriYear();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Hero Section */}
      <div className="text-center mb-10">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <Image
            src="/logo_alhikmah.png"
            alt="Logo Musholla Al-Hikmah"
            width={250}
            height={250}
            className="rounded-lg"
            priority
          />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
          Portal Zakat Musholla Al-Hikmah
        </h1>
        <p className="mt-2 text-sm text-[#599E6E] font-medium">
          Menebar Kebaikan, Membangun Ummat
        </p>
        <p className="mt-3 text-lg text-gray-500">
          Transparansi Pengelolaan Zakat Fitrah {tahunHijriah} H / 2026 M
        </p>
        <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-[#599E6E]/10 text-[#599E6E] rounded-full text-sm">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#599E6E] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#599E6E]"></span>
          </span>
          Data Real-time
        </div>
      </div>

      {/* Realtime Dashboard Stats */}
      <RealtimeDashboard initialStats={stats} />

      {/* CTA Buttons */}
      <section className="flex flex-wrap justify-center gap-4">
        <Link href="/penerimaan">
          <Button variant="primary" size="lg">
            Lihat Daftar Muzakki
          </Button>
        </Link>
        <Link href="/penyaluran">
          <Button variant="outline" size="lg">
            Lihat Penyaluran
          </Button>
        </Link>
        <Link href="/laporan">
          <Button variant="secondary" size="lg">
            Download Laporan
          </Button>
        </Link>
      </section>
    </div>
  );
}
