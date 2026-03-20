import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  FileText,
  Printer,
  Users,
  HandHeart,
  Banknote,
  Scale,
  TrendingUp,
  TrendingDown,
  CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import { getPenerimaan, getPenyaluran, getStatistikDashboard } from '@/lib/api';
import { getCurrentHijriYear, getCurrentMasehiYear } from '@/lib/supabase';
import { formatRupiah, formatKg } from '@/lib/utils';

export const revalidate = 60;

export default async function LaporanPage() {
  const tahunHijriah = getCurrentHijriYear();
  const tahunMasehi = getCurrentMasehiYear();

  const [penerimaan, penyaluran, stats] = await Promise.all([
    getPenerimaan(tahunHijriah),
    getPenyaluran(tahunHijriah),
    getStatistikDashboard(),
  ]);

  // Hitung statistik
  const totalZakatUang = stats.penerimaan.zakatUang;
  const totalZakatBeras = stats.penerimaan.zakatBeras;
  const totalZakatMaal = stats.penerimaan.zakatMaal;
  const totalInfaq = stats.penerimaan.infaq;
  const totalPenerimaan = totalZakatUang + totalZakatMaal + totalInfaq;

  const totalPenyaluranUang = stats.penyaluran.uang;
  const totalPenyaluranBeras = stats.penyaluran.beras;

  const sisaUang = totalZakatUang + totalZakatMaal + totalInfaq - totalPenyaluranUang;
  const sisaBeras = totalZakatBeras - totalPenyaluranBeras;

  // Group mustahik by kategori
  const mustahikByKategori = penyaluran.reduce((acc, p) => {
    acc[p.kategori] = (acc[p.kategori] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl flex items-center gap-3">
            <FileText className="w-8 h-8 text-[#599E6E]" />
            Laporan Zakat
          </h1>
          <p className="mt-2 text-gray-500">
            Laporan Pengelolaan Zakat Fitrah Ramadhan {tahunHijriah}H / {tahunMasehi}M
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/laporan/print" target="_blank">
            <Button variant="outline" className="gap-2">
              <Printer className="w-4 h-4" />
              Cetak Laporan
            </Button>
          </Link>
        </div>
      </div>

      {/* Ringkasan Statistik */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Ringkasan</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Muzakki */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Muzakki</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.penerimaan.totalMuzakki}</p>
                  <p className="text-sm text-gray-500">{stats.penerimaan.totalJiwa} jiwa</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-lg">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Mustahik */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Mustahik</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.penyaluran.totalMustahik}</p>
                  <p className="text-sm text-gray-500">penerima manfaat</p>
                </div>
                <div className="p-3 bg-green-100 rounded-lg">
                  <HandHeart className="w-6 h-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Total Penerimaan Uang */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Penerimaan</p>
                  <p className="text-2xl font-bold text-gray-900">{formatRupiah(totalPenerimaan)}</p>
                  <p className="text-sm text-gray-500">uang (zakat + infaq)</p>
                </div>
                <div className="p-3 bg-emerald-100 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Penerimaan Beras */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Total Beras Diterima</p>
                  <p className="text-2xl font-bold text-gray-900">{formatKg(totalZakatBeras)}</p>
                  <p className="text-sm text-gray-500">zakat fitrah beras</p>
                </div>
                <div className="p-3 bg-amber-100 rounded-lg">
                  <Scale className="w-6 h-6 text-amber-600" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Detail Penerimaan & Penyaluran */}
      <section className="mb-10 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Rincian Penerimaan */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="w-5 h-5 text-green-600" />
              Rincian Penerimaan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Zakat Fitrah (Uang)</span>
                <span className="font-medium">{formatRupiah(totalZakatUang)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Zakat Fitrah (Beras)</span>
                <span className="font-medium">{formatKg(totalZakatBeras)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Zakat Maal</span>
                <span className="font-medium">{formatRupiah(totalZakatMaal)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Infaq</span>
                <span className="font-medium">{formatRupiah(totalInfaq)}</span>
              </div>
              <div className="flex justify-between py-2 font-semibold text-[#599E6E]">
                <span>Total Uang</span>
                <span>{formatRupiah(totalPenerimaan)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Rincian Penyaluran */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingDown className="w-5 h-5 text-red-600" />
              Rincian Penyaluran
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Penyaluran Uang</span>
                <span className="font-medium">{formatRupiah(totalPenyaluranUang)}</span>
              </div>
              <div className="flex justify-between py-2 border-b">
                <span className="text-gray-600">Penyaluran Beras</span>
                <span className="font-medium">{formatKg(totalPenyaluranBeras)}</span>
              </div>
              <div className="pt-3 border-t">
                <p className="text-sm text-gray-500 mb-2">Distribusi Mustahik:</p>
                {Object.entries(mustahikByKategori).map(([kategori, jumlah]) => (
                  <div key={kategori} className="flex justify-between py-1">
                    <span className="text-gray-600">{kategori}</span>
                    <span className="font-medium">{jumlah} orang</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Sisa/Saldo */}
      <section className="mb-10">
        <Card className="bg-gradient-to-r from-[#599E6E]/10 to-[#599E6E]/5 border-[#599E6E]/20">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 mb-4">
              <CheckCircle className="w-6 h-6 text-[#599E6E]" />
              <h3 className="text-lg font-semibold text-gray-900">Sisa Saldo</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-500">Sisa Uang</p>
                <p className={`text-xl font-bold ${sisaUang >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatRupiah(sisaUang)}
                </p>
              </div>
              <div className="bg-white rounded-lg p-4">
                <p className="text-sm text-gray-500">Sisa Beras</p>
                <p className={`text-xl font-bold ${sisaBeras >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatKg(sisaBeras)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tabel Penerimaan */}
      <section className="mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#599E6E]" />
              Daftar Muzakki ({penerimaan.length})
            </CardTitle>
            <Link href="/penerimaan">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium">No</th>
                    <th className="text-left py-3 px-4 font-medium">Nama</th>
                    <th className="text-left py-3 px-4 font-medium">Jenis</th>
                    <th className="text-right py-3 px-4 font-medium">Jiwa</th>
                    <th className="text-right py-3 px-4 font-medium">Nominal</th>
                  </tr>
                </thead>
                <tbody>
                  {penerimaan.slice(0, 10).map((p, idx) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium">{p.nama_muzakki}</td>
                      <td className="py-3 px-4">
                        {p.jenis_fitrah === 'uang' && 'Fitrah Uang'}
                        {p.jenis_fitrah === 'beras' && 'Fitrah Beras'}
                        {!p.jenis_fitrah && p.nominal_maal && 'Zakat Maal'}
                        {!p.jenis_fitrah && !p.nominal_maal && p.nominal_infaq && 'Infaq'}
                      </td>
                      <td className="py-3 px-4 text-right">{p.jumlah_jiwa || '-'}</td>
                      <td className="py-3 px-4 text-right font-medium">
                        {p.jenis_fitrah === 'uang' && formatRupiah(p.nominal_fitrah || 0)}
                        {p.jenis_fitrah === 'beras' && formatKg(p.nominal_fitrah || 0)}
                        {!p.jenis_fitrah && p.nominal_maal && formatRupiah(p.nominal_maal)}
                        {!p.jenis_fitrah && !p.nominal_maal && p.nominal_infaq && formatRupiah(p.nominal_infaq)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {penerimaan.length > 10 && (
                <p className="text-center text-sm text-gray-500 py-3">
                  ... dan {penerimaan.length - 10} muzakki lainnya
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Tabel Penyaluran */}
      <section className="mb-10">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <HandHeart className="w-5 h-5 text-[#599E6E]" />
              Daftar Mustahik ({penyaluran.length})
            </CardTitle>
            <Link href="/penyaluran">
              <Button variant="ghost" size="sm">Lihat Semua</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50">
                    <th className="text-left py-3 px-4 font-medium">No</th>
                    <th className="text-left py-3 px-4 font-medium">Nama</th>
                    <th className="text-left py-3 px-4 font-medium">Kategori</th>
                    <th className="text-right py-3 px-4 font-medium">Uang</th>
                    <th className="text-right py-3 px-4 font-medium">Beras</th>
                  </tr>
                </thead>
                <tbody>
                  {penyaluran.slice(0, 10).map((p, idx) => (
                    <tr key={p.id} className="border-b hover:bg-gray-50">
                      <td className="py-3 px-4 text-gray-500">{idx + 1}</td>
                      <td className="py-3 px-4 font-medium">{p.nama_mustahik}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          p.kategori === 'Fakir/Miskin' ? 'bg-red-100 text-red-700' :
                          p.kategori === 'Amil' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {p.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.nominal_uang ? formatRupiah(p.nominal_uang) : '-'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {p.jumlah_beras_kg ? formatKg(p.jumlah_beras_kg) : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {penyaluran.length > 10 && (
                <p className="text-center text-sm text-gray-500 py-3">
                  ... dan {penyaluran.length - 10} mustahik lainnya
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
