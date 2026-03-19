import { Card } from '@/components/ui/card';
import { Images } from 'lucide-react';
import { getDokumentasi } from '@/lib/api';
import { getCurrentHijriYear } from '@/lib/supabase';
import { GalleryWithModal } from '@/components/dokumentasi/gallery-modal';

export const revalidate = 60; // Revalidate every 60 seconds

export default async function DokumentasiPage() {
  const tahunHijriah = getCurrentHijriYear();
  const dokumentasi = await getDokumentasi(tahunHijriah);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 sm:text-3xl">
          Dokumentasi Kegiatan
        </h1>
        <p className="mt-2 text-gray-500">
          Galeri foto kegiatan pengelolaan zakat Musholla Al-Hikmah - Ramadhan {tahunHijriah}H
        </p>
      </div>

      {/* Empty State */}
      {dokumentasi.length === 0 && (
        <Card className="p-12 text-center">
          <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Belum Ada Dokumentasi
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Dokumentasi foto kegiatan akan diupload setelah proses penerimaan dan penyaluran zakat berlangsung.
            Nantikan update dari kami!
          </p>
        </Card>
      )}

      {/* Grid Galeri dengan Modal */}
      {dokumentasi.length > 0 && (
        <GalleryWithModal dokumentasi={dokumentasi} />
      )}
    </div>
  );
}
