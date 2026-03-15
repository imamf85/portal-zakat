import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileDown, FileText, Calendar } from 'lucide-react';

// Data dummy laporan tersedia
const laporanTersedia = [
  {
    tahunHijriah: '1447',
    tahunMasehi: '2026',
    status: 'ongoing',
    label: 'Tahun Ini (Sedang Berjalan)',
  },
  {
    tahunHijriah: '1446',
    tahunMasehi: '2025',
    status: 'completed',
    label: 'Laporan Lengkap',
  },
  {
    tahunHijriah: '1445',
    tahunMasehi: '2024',
    status: 'completed',
    label: 'Laporan Lengkap',
  },
];

export default function LaporanPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Download Laporan
        </h1>
        <p className="mt-2 text-gray-500">
          Unduh laporan pengelolaan zakat per tahun dalam format PDF
        </p>
      </div>

      {/* Info */}
      <Card className="mb-8 p-6 bg-[#599E6E]/5 border-[#599E6E]/20">
        <div className="flex items-start gap-4">
          <FileText className="w-8 h-8 text-[#599E6E] flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-[#4A8A5D]">Transparansi Laporan</h3>
            <p className="mt-1 text-sm text-[#599E6E]">
              Laporan berisi rekapitulasi lengkap penerimaan dan penyaluran zakat fitrah,
              termasuk daftar muzakki dan mustahik. Laporan dapat diunduh untuk keperluan
              dokumentasi atau pelaporan ke jamaah.
            </p>
          </div>
        </div>
      </Card>

      {/* Daftar Laporan */}
      <div className="space-y-4">
        {laporanTersedia.map((laporan) => (
          <Card key={laporan.tahunHijriah}>
            <CardContent className="p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-[#599E6E]/10 rounded-lg">
                    <Calendar className="w-6 h-6 text-[#599E6E]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Zakat Fitrah {laporan.tahunHijriah} H / {laporan.tahunMasehi} M
                    </h3>
                    <p className="text-sm text-gray-500">{laporan.label}</p>
                  </div>
                </div>

                <div className="flex gap-2">
                  {laporan.status === 'completed' ? (
                    <>
                      <Button variant="primary" className="gap-2">
                        <FileDown className="w-4 h-4" />
                        Download PDF
                      </Button>
                      <Button variant="outline" className="gap-2">
                        <FileDown className="w-4 h-4" />
                        Excel
                      </Button>
                    </>
                  ) : (
                    <Button variant="secondary" disabled className="gap-2">
                      <FileDown className="w-4 h-4" />
                      Belum Tersedia
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Catatan */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle className="text-base">Catatan</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-[#599E6E]">•</span>
              Laporan tahun berjalan akan tersedia setelah periode zakat fitrah berakhir
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#599E6E]">•</span>
              Format PDF berisi laporan lengkap dengan tanda tangan pengurus
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#599E6E]">•</span>
              Format Excel berisi data mentah untuk keperluan analisis lebih lanjut
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[#599E6E]">•</span>
              Nama muzakki dan mustahik dalam laporan tidak disensor untuk keperluan validasi
            </li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
