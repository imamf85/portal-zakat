import { Banknote, Scale, Heart, Users, HandHeart, TrendingUp } from 'lucide-react';
import { StatCard } from '@/components/ui/stat-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { formatRupiah, formatKg } from '@/lib/utils';
import { getStatistikDashboard } from '@/lib/api';
import { getCurrentHijriYear } from '@/lib/supabase';

// Hitung persentase perubahan
const hitungTrend = (lama: number, baru: number) => {
  if (lama === 0) return baru > 0 ? 100 : 0;
  return Math.round(((baru - lama) / lama) * 100);
};

export const revalidate = 60; // Revalidate setiap 60 detik

export default async function Home() {
  const stats = await getStatistikDashboard();
  const tahunHijriah = getCurrentHijriYear();

  const { penerimaan, penyaluran, tahunLalu } = stats;

  const persentaseSerapanUang = penerimaan.zakatUang > 0
    ? Math.round((penyaluran.uang / penerimaan.zakatUang) * 100)
    : 0;

  const persentaseSerapanBeras = penerimaan.zakatBeras > 0
    ? Math.round((penyaluran.beras / penerimaan.zakatBeras) * 100)
    : 0;

  // Hitung jiwa dari beras (2.5 kg per jiwa)
  const jiwaUang = penerimaan.zakatUang > 0 ? Math.round(penerimaan.zakatUang / 50000) : 0;
  const jiwaBeras = penerimaan.zakatBeras > 0 ? Math.round(penerimaan.zakatBeras / 2.5) : 0;

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

      {/* Statistik Penerimaan */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Penerimaan Zakat</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Zakat Fitrah (Uang)"
            value={formatRupiah(penerimaan.zakatUang)}
            subtitle={`${jiwaUang} jiwa`}
            icon={<Banknote className="w-6 h-6 text-[#599E6E]" />}
            trend={tahunLalu ? hitungTrend(tahunLalu.total_zakat_uang, penerimaan.zakatUang) : undefined}
          />
          <StatCard
            title="Zakat Fitrah (Beras)"
            value={formatKg(penerimaan.zakatBeras)}
            subtitle={`${jiwaBeras} jiwa`}
            icon={<Scale className="w-6 h-6 text-[#599E6E]" />}
            trend={tahunLalu ? hitungTrend(tahunLalu.total_zakat_beras_kg, penerimaan.zakatBeras) : undefined}
          />
          <StatCard
            title="Zakat Maal"
            value={formatRupiah(penerimaan.zakatMaal)}
            icon={<Banknote className="w-6 h-6 text-[#599E6E]" />}
            trend={tahunLalu ? hitungTrend(tahunLalu.total_zakat_maal, penerimaan.zakatMaal) : undefined}
          />
          <StatCard
            title="Infaq"
            value={formatRupiah(penerimaan.infaq)}
            icon={<Heart className="w-6 h-6 text-[#599E6E]" />}
            trend={tahunLalu ? hitungTrend(tahunLalu.total_infaq, penerimaan.infaq) : undefined}
          />
        </div>
      </section>

      {/* Statistik Muzakki */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Data Muzakki</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <StatCard
            title="Total Muzakki"
            value={`${penerimaan.totalMuzakki} orang`}
            subtitle="Pemberi zakat"
            icon={<Users className="w-6 h-6 text-[#599E6E]" />}
            trend={tahunLalu ? hitungTrend(tahunLalu.total_muzakki, penerimaan.totalMuzakki) : undefined}
          />
          <StatCard
            title="Total Jiwa Dizakatkan"
            value={`${penerimaan.totalJiwa} jiwa`}
            subtitle="Fitrah uang + beras"
            icon={<Users className="w-6 h-6 text-[#599E6E]" />}
            trend={tahunLalu ? hitungTrend(tahunLalu.total_jiwa, penerimaan.totalJiwa) : undefined}
          />
        </div>
      </section>

      {/* Penyaluran */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Penyaluran Zakat</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <HandHeart className="w-5 h-5 text-[#599E6E]" />
                Uang Tersalurkan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {formatRupiah(penyaluran.uang)}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Serapan</span>
                  <span>{persentaseSerapanUang}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#599E6E] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(persentaseSerapanUang, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Scale className="w-5 h-5 text-[#599E6E]" />
                Beras Tersalurkan
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {formatKg(penyaluran.beras)}
              </p>
              <div className="mt-3">
                <div className="flex justify-between text-sm text-gray-500 mb-1">
                  <span>Serapan</span>
                  <span>{persentaseSerapanBeras}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-[#599E6E] h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(persentaseSerapanBeras, 100)}%` }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5 text-[#599E6E]" />
                Total Mustahik
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold text-gray-900">
                {penyaluran.totalMustahik} orang
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Penerima manfaat zakat
              </p>
              <div className="mt-3 flex gap-2 flex-wrap">
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded text-xs">
                  Fakir/Miskin
                </span>
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">
                  Amil
                </span>
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs">
                  Fisabilillah
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Perbandingan Tahun Lalu */}
      {tahunLalu && (
        <section className="mb-10">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#599E6E]" />
                Perbandingan dengan Tahun Lalu ({tahunLalu.tahun_hijriah} H)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-[#599E6E]/5 rounded-lg">
                  <p className="text-sm text-gray-500">Zakat Uang</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatRupiah(tahunLalu.total_zakat_uang)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Tahun lalu</p>
                </div>
                <div className="text-center p-4 bg-[#599E6E]/5 rounded-lg">
                  <p className="text-sm text-gray-500">Zakat Beras</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {formatKg(tahunLalu.total_zakat_beras_kg)}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Tahun lalu</p>
                </div>
                <div className="text-center p-4 bg-[#599E6E]/5 rounded-lg">
                  <p className="text-sm text-gray-500">Total Muzakki</p>
                  <p className="text-lg font-semibold text-gray-900 mt-1">
                    {tahunLalu.total_muzakki} orang
                  </p>
                  <p className="text-xs text-gray-400 mt-1">Tahun lalu</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      )}

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
