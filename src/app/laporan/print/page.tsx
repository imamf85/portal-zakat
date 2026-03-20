import Image from 'next/image';
import { getPenerimaan, getPenyaluran, getStatistikDashboard } from '@/lib/api';
import { getCurrentHijriYear, getCurrentMasehiYear } from '@/lib/supabase';
import { formatRupiah, formatKg, formatTanggal } from '@/lib/utils';
import { PrintButton } from './print-button';

export default async function PrintLaporanPage() {
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

  // Sort penerimaan by tanggal
  const penerimaanSorted = [...penerimaan].sort(
    (a, b) => new Date(a.tanggal_transaksi).getTime() - new Date(b.tanggal_transaksi).getTime()
  );

  // Sort penyaluran by tanggal
  const penyaluranSorted = [...penyaluran].sort(
    (a, b) => new Date(a.tanggal_penyaluran).getTime() - new Date(b.tanggal_penyaluran).getTime()
  );

  return (
    <div className="min-h-screen bg-white">
      {/* Print Button - hidden when printing */}
      <div className="print:hidden fixed top-4 right-4 z-50">
        <PrintButton />
      </div>

      {/* Print Content */}
      <div className="max-w-4xl mx-auto p-8 print:p-4">
        {/* Header */}
        <div className="text-center border-b-2 border-gray-800 pb-6 mb-6">
          <div className="flex justify-center mb-4">
            <Image
              src="/logo_alhikmah.png"
              alt="Logo Musholla Al-Hikmah"
              width={80}
              height={80}
              className="print:w-16 print:h-16"
            />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 print:text-xl">
            LAPORAN PENGELOLAAN ZAKAT FITRAH
          </h1>
          <h2 className="text-lg font-semibold text-gray-700 mt-1 print:text-base">
            MUSHOLLA AL-HIKMAH
          </h2>
          <p className="text-gray-600 mt-2">
            Ramadhan {tahunHijriah}H / {tahunMasehi}M
          </p>
        </div>

        {/* Ringkasan */}
        <section className="mb-8 print:mb-6">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 print:text-base">
            I. RINGKASAN
          </h3>

          <div className="grid grid-cols-2 gap-6 print:gap-4">
            {/* Penerimaan */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Penerimaan</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1">Total Muzakki</td>
                    <td className="py-1 text-right font-medium">{stats.penerimaan.totalMuzakki} orang</td>
                  </tr>
                  <tr>
                    <td className="py-1">Total Jiwa</td>
                    <td className="py-1 text-right font-medium">{stats.penerimaan.totalJiwa} jiwa</td>
                  </tr>
                  <tr>
                    <td className="py-1">Zakat Fitrah (Uang)</td>
                    <td className="py-1 text-right font-medium">{formatRupiah(totalZakatUang)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Zakat Fitrah (Beras)</td>
                    <td className="py-1 text-right font-medium">{formatKg(totalZakatBeras)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Zakat Maal</td>
                    <td className="py-1 text-right font-medium">{formatRupiah(totalZakatMaal)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Infaq</td>
                    <td className="py-1 text-right font-medium">{formatRupiah(totalInfaq)}</td>
                  </tr>
                  <tr className="border-t font-semibold">
                    <td className="py-1">Total Uang</td>
                    <td className="py-1 text-right">{formatRupiah(totalPenerimaan)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Penyaluran */}
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Penyaluran</h4>
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-1">Total Mustahik</td>
                    <td className="py-1 text-right font-medium">{stats.penyaluran.totalMustahik} orang</td>
                  </tr>
                  {Object.entries(mustahikByKategori).map(([kategori, jumlah]) => (
                    <tr key={kategori}>
                      <td className="py-1 pl-4">- {kategori}</td>
                      <td className="py-1 text-right">{jumlah} orang</td>
                    </tr>
                  ))}
                  <tr>
                    <td className="py-1">Penyaluran Uang</td>
                    <td className="py-1 text-right font-medium">{formatRupiah(totalPenyaluranUang)}</td>
                  </tr>
                  <tr>
                    <td className="py-1">Penyaluran Beras</td>
                    <td className="py-1 text-right font-medium">{formatKg(totalPenyaluranBeras)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Sisa */}
          <div className="mt-4 p-3 bg-gray-100 rounded print:bg-gray-50">
            <h4 className="font-semibold text-gray-800 mb-2">Sisa Saldo</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span>Sisa Uang: </span>
                <span className="font-bold">{formatRupiah(sisaUang)}</span>
              </div>
              <div>
                <span>Sisa Beras: </span>
                <span className="font-bold">{formatKg(sisaBeras)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* Daftar Muzakki */}
        <section className="mb-8 print:mb-6 print:break-before-page">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 print:text-base">
            II. DAFTAR MUZAKKI ({penerimaan.length} orang)
          </h3>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left">No</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Tanggal</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Nama Muzakki</th>
                <th className="border border-gray-300 px-2 py-1 text-center">Jenis</th>
                <th className="border border-gray-300 px-2 py-1 text-center">Jiwa</th>
                <th className="border border-gray-300 px-2 py-1 text-right">Nominal</th>
              </tr>
            </thead>
            <tbody>
              {penerimaanSorted.map((p, idx) => (
                <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-2 py-1">{idx + 1}</td>
                  <td className="border border-gray-300 px-2 py-1">{formatTanggal(p.tanggal_transaksi)}</td>
                  <td className="border border-gray-300 px-2 py-1">{p.nama_muzakki}</td>
                  <td className="border border-gray-300 px-2 py-1 text-center">
                    {p.jenis_fitrah === 'uang' && 'Uang'}
                    {p.jenis_fitrah === 'beras' && 'Beras'}
                    {!p.jenis_fitrah && p.nominal_maal && 'Maal'}
                    {!p.jenis_fitrah && !p.nominal_maal && 'Infaq'}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-center">{p.jumlah_jiwa || '-'}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {p.jenis_fitrah === 'uang' && formatRupiah(p.nominal_fitrah || 0)}
                    {p.jenis_fitrah === 'beras' && formatKg(p.nominal_fitrah || 0)}
                    {!p.jenis_fitrah && p.nominal_maal && formatRupiah(p.nominal_maal)}
                    {!p.jenis_fitrah && !p.nominal_maal && formatRupiah(p.nominal_infaq || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Daftar Mustahik */}
        <section className="mb-8 print:mb-6 print:break-before-page">
          <h3 className="text-lg font-bold text-gray-900 border-b pb-2 mb-4 print:text-base">
            III. DAFTAR MUSTAHIK ({penyaluran.length} orang)
          </h3>

          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-2 py-1 text-left">No</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Tanggal</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Nama Mustahik</th>
                <th className="border border-gray-300 px-2 py-1 text-left">Kategori</th>
                <th className="border border-gray-300 px-2 py-1 text-right">Uang</th>
                <th className="border border-gray-300 px-2 py-1 text-right">Beras</th>
              </tr>
            </thead>
            <tbody>
              {penyaluranSorted.map((p, idx) => (
                <tr key={p.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                  <td className="border border-gray-300 px-2 py-1">{idx + 1}</td>
                  <td className="border border-gray-300 px-2 py-1">{formatTanggal(p.tanggal_penyaluran)}</td>
                  <td className="border border-gray-300 px-2 py-1">{p.nama_mustahik}</td>
                  <td className="border border-gray-300 px-2 py-1">{p.kategori}</td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {p.nominal_uang ? formatRupiah(p.nominal_uang) : '-'}
                  </td>
                  <td className="border border-gray-300 px-2 py-1 text-right">
                    {p.jumlah_beras_kg ? formatKg(p.jumlah_beras_kg) : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Tanda Tangan */}
        <section className="mt-12 print:mt-8">
          <div className="grid grid-cols-2 gap-8">
            <div className="text-center">
              <p className="text-sm">Mengetahui,</p>
              <p className="text-sm font-semibold">Ketua Takmir</p>
              <div className="h-20 print:h-16"></div>
              <p className="text-sm border-t border-gray-400 pt-1 inline-block px-8">
                (_________________)
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm">Depok, ______ Maret {tahunMasehi}</p>
              <p className="text-sm font-semibold">Koordinator Zakat</p>
              <div className="h-20 print:h-16"></div>
              <p className="text-sm border-t border-gray-400 pt-1 inline-block px-8">
                (_________________)
              </p>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="mt-8 pt-4 border-t text-center text-xs text-gray-500 print:mt-4">
          <p>Laporan ini digenerate secara otomatis dari Portal Zakat Musholla Al-Hikmah</p>
          <p>https://zakat.musholla-alhikmah.com</p>
        </footer>
      </div>
    </div>
  );
}
