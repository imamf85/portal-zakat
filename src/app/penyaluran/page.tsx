import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { HandHeart, Users, Banknote, Scale } from 'lucide-react';
import { formatRupiah, formatKg, sensorNama } from '@/lib/utils';
import { getPenyaluran, getStatistikKategori } from '@/lib/api';
import { getCurrentHijriYear } from '@/lib/supabase';

export const revalidate = 60;

export default async function PenyaluranPage() {
  const tahunHijriah = getCurrentHijriYear();
  const dataMustahik = await getPenyaluran(tahunHijriah);
  const kategoriStats = await getStatistikKategori(tahunHijriah);

  const totalPenyaluran = dataMustahik.reduce((acc, m) => acc + (m.nominal_uang || 0), 0);
  const totalBeras = dataMustahik.reduce((acc, m) => acc + (m.jumlah_beras_kg || 0), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Penyaluran Zakat
        </h1>
        <p className="mt-2 text-gray-500">
          Distribusi Zakat Fitrah {tahunHijriah} H / 2026 M ke Mustahik
        </p>
      </div>

      {/* Ringkasan */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#599E6E]/10 rounded-lg">
              <Users className="w-6 h-6 text-[#599E6E]" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{dataMustahik.length}</p>
              <p className="text-sm text-gray-500">Total Mustahik</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-[#599E6E]/10 rounded-lg">
              <Banknote className="w-6 h-6 text-[#599E6E]" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatRupiah(totalPenyaluran)}</p>
              <p className="text-sm text-gray-500">Uang Tersalurkan</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-amber-100 rounded-lg">
              <Scale className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <p className="text-xl font-bold text-gray-900">{formatKg(totalBeras)}</p>
              <p className="text-sm text-gray-500">Beras Tersalurkan</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <HandHeart className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">3</p>
              <p className="text-sm text-gray-500">Kategori Asnaf</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Per Kategori */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {kategoriStats.map((kat) => (
          <Card key={kat.nama}>
            <CardHeader>
              <CardTitle className="text-lg">{kat.nama}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-3xl font-bold text-gray-900">{kat.jumlah}</p>
                  <p className="text-sm text-gray-500">Penerima</p>
                </div>
                <div className="text-right">
                  <p className="text-xl font-semibold text-[#599E6E]">
                    {formatRupiah(kat.totalUang)}
                  </p>
                  {kat.totalBeras > 0 && (
                    <p className="text-sm text-amber-600">{formatKg(kat.totalBeras)}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabel Mustahik */}
      <Card>
        <CardHeader>
          <CardTitle>Daftar Penerima Zakat (Mustahik)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dataMustahik.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <HandHeart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Belum ada data penyaluran zakat</p>
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
                      Alamat
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Kategori
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uang
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Beras
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {dataMustahik.map((mustahik, index) => (
                    <tr key={mustahik.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-medium text-gray-900">
                          {sensorNama(mustahik.nama_mustahik)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                        {mustahik.alamat ? sensorNama(mustahik.alamat) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          mustahik.kategori === 'Fakir/Miskin'
                            ? 'bg-red-100 text-red-800'
                            : mustahik.kategori === 'Amil'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {mustahik.kategori}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatRupiah(mustahik.nominal_uang || 0)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {mustahik.jumlah_beras_kg ? formatKg(mustahik.jumlah_beras_kg) : '-'}
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
