import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Banknote, Scale, Heart } from 'lucide-react';
import { formatRupiah, formatKg, sensorNama, formatTanggalSingkat } from '@/lib/utils';
import { getPenerimaan } from '@/lib/api';
import { getCurrentHijriYear } from '@/lib/supabase';

export const revalidate = 60;

export default async function PenerimaanPage() {
  const tahunHijriah = getCurrentHijriYear();
  const dataMuzakki = await getPenerimaan(tahunHijriah);

  // Hitung statistik
  const totalMuzakki = dataMuzakki.length;
  const totalJiwa = dataMuzakki.reduce((acc, m) => acc + (m.jumlah_jiwa || 0), 0);
  const totalUang = dataMuzakki
    .filter(m => m.jenis_fitrah === 'uang')
    .reduce((acc, m) => acc + (m.nominal_fitrah || 0), 0);
  const totalBeras = dataMuzakki
    .filter(m => m.jenis_fitrah === 'beras')
    .reduce((acc, m) => acc + (m.nominal_fitrah || 0), 0);
  const totalMaal = dataMuzakki.reduce((acc, m) => acc + (m.nominal_maal || 0), 0);
  const totalInfaq = dataMuzakki.reduce((acc, m) => acc + (m.nominal_infaq || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Daftar Penerimaan Zakat
        </h1>
        <p className="mt-2 text-gray-500">
          Zakat Fitrah {tahunHijriah} H / 2026 M - Musholla Al-Hikmah
        </p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#599E6E]" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalMuzakki}</p>
              <p className="text-xs text-gray-500">Muzakki</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="w-8 h-8 text-[#599E6E]" />
            <div>
              <p className="text-2xl font-bold text-gray-900">{totalJiwa}</p>
              <p className="text-xs text-gray-500">Jiwa</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Banknote className="w-8 h-8 text-[#599E6E]" />
            <div>
              <p className="text-lg font-bold text-gray-900">{formatRupiah(totalUang)}</p>
              <p className="text-xs text-gray-500">Fitrah Uang</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Scale className="w-8 h-8 text-amber-600" />
            <div>
              <p className="text-lg font-bold text-gray-900">{formatKg(totalBeras)}</p>
              <p className="text-xs text-gray-500">Fitrah Beras</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Banknote className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-lg font-bold text-gray-900">{formatRupiah(totalMaal)}</p>
              <p className="text-xs text-gray-500">Zakat Maal</p>
            </div>
          </div>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Heart className="w-8 h-8 text-pink-600" />
            <div>
              <p className="text-lg font-bold text-gray-900">{formatRupiah(totalInfaq)}</p>
              <p className="text-xs text-gray-500">Infaq</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabel */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Muzakki</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dataMuzakki.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada data penerimaan zakat</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nama
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tanggal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jenis
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Jiwa
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Zakat Fitrah
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Maal/Infaq
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataMuzakki.map((muzakki, index) => (
                    <tr key={muzakki.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {sensorNama(muzakki.nama_muzakki)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatTanggalSingkat(muzakki.tanggal_transaksi)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          muzakki.jenis_fitrah === 'uang'
                            ? 'bg-[#599E6E]/10 text-[#599E6E]'
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {muzakki.jenis_fitrah === 'uang' ? 'Uang' : 'Beras'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {muzakki.jumlah_jiwa}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {muzakki.jenis_fitrah === 'uang'
                          ? formatRupiah(muzakki.nominal_fitrah || 0)
                          : formatKg(muzakki.nominal_fitrah || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {muzakki.nominal_maal ? (
                          <span className="text-blue-600">Maal: {formatRupiah(muzakki.nominal_maal)}</span>
                        ) : null}
                        {muzakki.nominal_infaq ? (
                          <span className="text-pink-600">Infaq: {formatRupiah(muzakki.nominal_infaq)}</span>
                        ) : null}
                        {!muzakki.nominal_maal && !muzakki.nominal_infaq && '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
