import { Card } from '@/components/ui/card';
import { Images, Calendar } from 'lucide-react';

// Data dummy dokumentasi - nanti diganti dengan data dari Supabase
const demoDokumentasi = [
  {
    id: '1',
    judul: 'Penerimaan Zakat Hari Pertama',
    deskripsi: 'Kegiatan penerimaan zakat fitrah pada hari pertama Ramadhan 1447 H',
    tanggal: '2026-03-01',
    placeholder: true,
  },
  {
    id: '2',
    judul: 'Penimbangan Beras Zakat',
    deskripsi: 'Proses penimbangan beras zakat fitrah yang diterima dari muzakki',
    tanggal: '2026-03-10',
    placeholder: true,
  },
  {
    id: '3',
    judul: 'Penyaluran Zakat ke Fakir Miskin',
    deskripsi: 'Dokumentasi penyaluran zakat kepada warga kurang mampu',
    tanggal: '2026-03-28',
    placeholder: true,
  },
  {
    id: '4',
    judul: 'Rapat Koordinasi Amil',
    deskripsi: 'Rapat koordinasi panitia zakat untuk persiapan penyaluran',
    tanggal: '2026-03-20',
    placeholder: true,
  },
];

export default function DokumentasiPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Dokumentasi Kegiatan
        </h1>
        <p className="mt-2 text-gray-500">
          Galeri foto kegiatan pengelolaan zakat Musholla Al-Hikmah
        </p>
      </div>

      {/* Info */}
      <Card className="mb-8 p-6 bg-amber-50 border-amber-200">
        <div className="flex items-start gap-4">
          <Images className="w-8 h-8 text-amber-600 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-amber-800">Segera Hadir</h3>
            <p className="mt-1 text-sm text-amber-700">
              Dokumentasi foto kegiatan akan diupload setelah proses penyaluran zakat selesai.
              Nantikan update dari kami!
            </p>
          </div>
        </div>
      </Card>

      {/* Grid Galeri */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {demoDokumentasi.map((doc) => (
          <Card key={doc.id} className="overflow-hidden group cursor-pointer hover:shadow-md transition-shadow">
            {/* Placeholder Image */}
            <div className="aspect-video bg-gray-100 flex items-center justify-center">
              <div className="text-center">
                <Images className="w-12 h-12 text-gray-300 mx-auto" />
                <p className="mt-2 text-sm text-gray-400">Foto akan ditambahkan</p>
              </div>
            </div>

            {/* Caption */}
            <div className="p-4">
              <h3 className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                {doc.judul}
              </h3>
              <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                {doc.deskripsi}
              </p>
              <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                <Calendar className="w-4 h-4" />
                <span>{new Date(doc.tanggal).toLocaleDateString('id-ID', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric'
                })}</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
