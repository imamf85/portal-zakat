import { Card } from '@/components/ui/card';
import { FileText, Clock } from 'lucide-react';

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

      {/* Coming Soon */}
      <Card className="p-12 text-center">
        <div className="w-20 h-20 bg-[#599E6E]/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <FileText className="w-10 h-10 text-[#599E6E]" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3">
          Segera Hadir
        </h2>
        <p className="text-gray-500 max-w-md mx-auto mb-6">
          Fitur download laporan sedang dalam pengembangan.
          Laporan lengkap akan tersedia setelah periode zakat fitrah Ramadhan 1447H berakhir.
        </p>
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 text-amber-700 rounded-full text-sm">
          <Clock className="w-4 h-4" />
          <span>Perkiraan: Setelah Idul Fitri 1447H</span>
        </div>
      </Card>
    </div>
  );
}
