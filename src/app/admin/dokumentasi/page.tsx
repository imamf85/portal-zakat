'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Images, Upload, Save, Trash2, Loader2, RefreshCw } from 'lucide-react';
import { getDokumentasi, createDokumentasi, deleteDokumentasi, uploadDokumentasiImage } from '@/lib/api';
import { getCurrentHijriYear, getCurrentMasehiYear, Dokumentasi } from '@/lib/supabase';
import { formatTanggalSingkat } from '@/lib/utils';

interface FormData {
  judul: string;
  deskripsi: string;
  file: File | null;
}

const initialFormData: FormData = {
  judul: '',
  deskripsi: '',
  file: null,
};

export default function UploadDokumentasiPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [preview, setPreview] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dokumentasiList, setDokumentasiList] = useState<Dokumentasi[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDokumentasi = async () => {
    setIsLoading(true);
    try {
      const data = await getDokumentasi(getCurrentHijriYear());
      setDokumentasiList(data);
    } catch (error) {
      console.error('Error fetching dokumentasi:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDokumentasi();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
        return;
      }

      setFormData(prev => ({ ...prev, file }));

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, file: null }));
    setPreview(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.file || !formData.judul.trim()) {
      setMessage({ type: 'error', text: 'Foto dan judul harus diisi' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // 1. Upload image to storage
      const imageUrl = await uploadDokumentasiImage(formData.file);

      if (!imageUrl) {
        throw new Error('Gagal upload gambar');
      }

      // 2. Create dokumentasi record
      await createDokumentasi({
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim() || null,
        url_foto: imageUrl,
        tahun_hijriah: getCurrentHijriYear(),
        tahun_masehi: getCurrentMasehiYear(),
      });

      setMessage({ type: 'success', text: 'Dokumentasi berhasil diupload!' });
      setFormData(initialFormData);
      setPreview(null);

      // Refresh list
      fetchDokumentasi();
    } catch (error) {
      console.error('Error uploading dokumentasi:', error);
      setMessage({ type: 'error', text: 'Gagal mengupload. Silakan coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Yakin ingin menghapus dokumentasi ini?')) return;

    setDeletingId(id);
    try {
      const success = await deleteDokumentasi(id);
      if (success) {
        setDokumentasiList(prev => prev.filter(d => d.id !== id));
        setMessage({ type: 'success', text: 'Dokumentasi berhasil dihapus' });
      } else {
        setMessage({ type: 'error', text: 'Gagal menghapus dokumentasi' });
      }
    } catch (error) {
      console.error('Error deleting:', error);
      setMessage({ type: 'error', text: 'Gagal menghapus dokumentasi' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
            <Images className="w-7 h-7 text-purple-600" />
            Upload Dokumentasi
          </h1>
          <p className="mt-1 text-gray-500">
            Upload foto kegiatan pengelolaan zakat
          </p>
        </div>
        <Button onClick={fetchDokumentasi} variant="outline" disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Message */}
      {message && (
        <div className={`p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Upload Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Upload Dokumentasi</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto <span className="text-red-500">*</span>
              </label>
              {!preview ? (
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">PNG, JPG, atau JPEG (MAX. 5MB)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />
                </label>
              ) : (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={preview}
                    alt="Preview"
                    className="w-full h-64 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveFile}
                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>

            {/* Judul */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleChange}
                required
                placeholder="Contoh: Penyaluran Zakat ke Fakir Miskin"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={3}
                placeholder="Deskripsi singkat tentang foto ini"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="submit" disabled={isSubmitting || !formData.file}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengupload...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Existing Dokumentasi */}
      <Card>
        <CardHeader>
          <CardTitle>Dokumentasi Terupload ({dokumentasiList.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-12 text-center">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#599E6E]" />
              <p className="text-gray-500 mt-2">Memuat data...</p>
            </div>
          ) : dokumentasiList.length === 0 ? (
            <div className="py-12 text-center">
              <Images className="w-12 h-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-500">Belum ada dokumentasi</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dokumentasiList.map((doc) => (
                <div key={doc.id} className="relative group rounded-lg overflow-hidden border">
                  <div className="aspect-video relative">
                    <Image
                      src={doc.url_foto}
                      alt={doc.judul}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="p-3">
                    <h4 className="font-medium text-sm text-gray-900 line-clamp-1">
                      {doc.judul}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">
                      {formatTanggalSingkat(doc.created_at)}
                    </p>
                  </div>
                  {/* Delete button */}
                  <button
                    onClick={() => handleDelete(doc.id)}
                    disabled={deletingId === doc.id}
                    className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                  >
                    {deletingId === doc.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
