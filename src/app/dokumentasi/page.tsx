import Image from 'next/image';
import { Card } from '@/components/ui/card';
import { Images, Calendar } from 'lucide-react';
import { getDokumentasi } from '@/lib/api';
import { getCurrentHijriYear } from '@/lib/supabase';
import { formatTanggal } from '@/lib/utils';

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

      {/* Grid Galeri */}
      {dokumentasi.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {dokumentasi.map((doc) => (
            <Card key={doc.id} className="overflow-hidden group hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="aspect-video relative bg-gray-100">
                <Image
                  src={doc.url_foto}
                  alt={doc.judul}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
              </div>

              {/* Caption */}
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 group-hover:text-[#599E6E] transition-colors">
                  {doc.judul}
                </h3>
                {doc.deskripsi && (
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {doc.deskripsi}
                  </p>
                )}
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <Calendar className="w-4 h-4" />
                  <span>{formatTanggal(doc.created_at)}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
