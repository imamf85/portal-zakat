'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Images, Upload, Save, Trash2, Loader2, RefreshCw, Plus, X, ImagePlus } from 'lucide-react';
import { getDokumentasi, createDokumentasi, deleteDokumentasi, uploadDokumentasiImage, addFotosToDokumentasi, removeFotoFromDokumentasi } from '@/lib/api';
import { getCurrentHijriYear, getCurrentMasehiYear, Dokumentasi } from '@/lib/supabase';
import { formatTanggalSingkat } from '@/lib/utils';

interface FormData {
  judul: string;
  deskripsi: string;
  files: File[];
}

const initialFormData: FormData = {
  judul: '',
  deskripsi: '',
  files: [],
};

export default function UploadDokumentasiPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [dokumentasiList, setDokumentasiList] = useState<Dokumentasi[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [uploadingToId, setUploadingToId] = useState<string | null>(null);
  const [removingFoto, setRemovingFoto] = useState<string | null>(null);

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

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);

    // Validate each file
    const validFiles: File[] = [];
    for (const file of newFiles) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: `File ${file.name} melebihi 5MB` });
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length === 0) return;

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles],
    }));

    // Create previews
    validFiles.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviews(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleRemoveFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
    }));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.files.length === 0 || !formData.judul.trim()) {
      setMessage({ type: 'error', text: 'Minimal 1 foto dan judul harus diisi' });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      // 1. Upload all images
      const uploadPromises = formData.files.map(file => uploadDokumentasiImage(file));
      const imageUrls = await Promise.all(uploadPromises);

      const validUrls = imageUrls.filter((url): url is string => url !== null);

      if (validUrls.length === 0) {
        throw new Error('Gagal upload semua gambar');
      }

      // 2. Create dokumentasi record with multiple fotos
      await createDokumentasi({
        judul: formData.judul.trim(),
        deskripsi: formData.deskripsi.trim() || null,
        url_foto: validUrls[0],
        foto_urls: validUrls,
        tahun_hijriah: getCurrentHijriYear(),
        tahun_masehi: getCurrentMasehiYear(),
      });

      setMessage({ type: 'success', text: `${validUrls.length} foto berhasil diupload!` });
      setFormData(initialFormData);
      setPreviews([]);

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
    if (!confirm('Yakin ingin menghapus dokumentasi ini beserta semua fotonya?')) return;

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

  const handleAddFotos = async (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);
    if (newFiles.length === 0) return;

    setUploadingToId(docId);
    try {
      const uploadPromises = newFiles.map(file => uploadDokumentasiImage(file));
      const imageUrls = await Promise.all(uploadPromises);
      const validUrls = imageUrls.filter((url): url is string => url !== null);

      if (validUrls.length > 0) {
        await addFotosToDokumentasi(docId, validUrls);
        setMessage({ type: 'success', text: `${validUrls.length} foto ditambahkan` });
        fetchDokumentasi();
      }
    } catch (error) {
      console.error('Error adding fotos:', error);
      setMessage({ type: 'error', text: 'Gagal menambah foto' });
    } finally {
      setUploadingToId(null);
    }
  };

  const handleRemoveFoto = async (docId: string, fotoUrl: string) => {
    if (!confirm('Hapus foto ini?')) return;

    setRemovingFoto(fotoUrl);
    try {
      await removeFotoFromDokumentasi(docId, fotoUrl);
      fetchDokumentasi();
    } catch (error) {
      console.error('Error removing foto:', error);
    } finally {
      setRemovingFoto(null);
    }
  };

  // Get foto urls with fallback
  const getFotoUrls = (doc: Dokumentasi): string[] => {
    if (doc.foto_urls && doc.foto_urls.length > 0) {
      return doc.foto_urls;
    }
    return doc.url_foto ? [doc.url_foto] : [];
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
            Upload foto kegiatan pengelolaan zakat (bisa multiple foto per album)
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
          <CardTitle>Buat Album Dokumentasi Baru</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Judul */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Judul Album <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="judul"
                value={formData.judul}
                onChange={handleChange}
                required
                placeholder="Contoh: Penyaluran Zakat Fitrah 1447H"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
              />
            </div>

            {/* Deskripsi */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Deskripsi (opsional)
              </label>
              <textarea
                name="deskripsi"
                value={formData.deskripsi}
                onChange={handleChange}
                rows={2}
                placeholder="Deskripsi singkat tentang album ini"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
              />
            </div>

            {/* Upload Area */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Foto <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-2">(bisa pilih banyak sekaligus)</span>
              </label>

              {/* Preview Grid */}
              {previews.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mb-4">
                  {previews.map((preview, index) => (
                    <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={preview}
                        alt={`Preview ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveFile(index)}
                        className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}

                  {/* Add more button */}
                  <label className="aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#599E6E] flex items-center justify-center">
                    <div className="text-center">
                      <Plus className="w-6 h-6 mx-auto text-gray-400" />
                      <span className="text-xs text-gray-500">Tambah</span>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/*"
                      multiple
                      onChange={handleFilesChange}
                    />
                  </label>
                </div>
              )}

              {/* Upload area when empty */}
              {previews.length === 0 && (
                <label className="flex flex-col items-center justify-center w-full h-48 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 mb-3 text-gray-400" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Klik untuk upload</span> atau drag & drop
                    </p>
                    <p className="text-xs text-gray-500">Bisa pilih banyak foto sekaligus (maks. 5MB/foto)</p>
                  </div>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    multiple
                    onChange={handleFilesChange}
                  />
                </label>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <Button type="submit" disabled={isSubmitting || formData.files.length === 0}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Mengupload {formData.files.length} foto...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Upload {formData.files.length > 0 ? `(${formData.files.length} foto)` : ''}
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
          <CardTitle>Album Dokumentasi ({dokumentasiList.length})</CardTitle>
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
            <div className="space-y-4">
              {dokumentasiList.map((doc) => {
                const fotos = getFotoUrls(doc);
                const isExpanded = expandedId === doc.id;

                return (
                  <div key={doc.id} className="border rounded-lg overflow-hidden">
                    {/* Header */}
                    <div
                      className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                      onClick={() => setExpandedId(isExpanded ? null : doc.id)}
                    >
                      <div className="flex items-center gap-3">
                        {/* Thumbnail */}
                        <div className="w-16 h-12 relative rounded overflow-hidden bg-gray-200">
                          {fotos[0] && (
                            <Image
                              src={fotos[0]}
                              alt={doc.judul}
                              fill
                              className="object-cover"
                              sizes="64px"
                            />
                          )}
                        </div>
                        <div>
                          <h4 className="font-medium text-gray-900">{doc.judul}</h4>
                          <p className="text-sm text-gray-500">
                            {fotos.length} foto • {formatTanggalSingkat(doc.created_at)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(doc.id);
                          }}
                          disabled={deletingId === doc.id}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          {deletingId === doc.id ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Trash2 className="w-4 h-4" />
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="p-4 border-t">
                        {doc.deskripsi && (
                          <p className="text-sm text-gray-600 mb-4">{doc.deskripsi}</p>
                        )}

                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                          {fotos.map((foto, index) => (
                            <div key={index} className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden group">
                              <Image
                                src={foto}
                                alt={`${doc.judul} - ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 50vw, 20vw"
                              />
                              {/* Delete button */}
                              {fotos.length > 1 && (
                                <button
                                  onClick={() => handleRemoveFoto(doc.id, foto)}
                                  disabled={removingFoto === foto}
                                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 disabled:opacity-50"
                                >
                                  {removingFoto === foto ? (
                                    <Loader2 className="w-3 h-3 animate-spin" />
                                  ) : (
                                    <X className="w-3 h-3" />
                                  )}
                                </button>
                              )}
                            </div>
                          ))}

                          {/* Add more photos button */}
                          <label className="aspect-video border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#599E6E] flex items-center justify-center">
                            {uploadingToId === doc.id ? (
                              <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                            ) : (
                              <div className="text-center">
                                <ImagePlus className="w-6 h-6 mx-auto text-gray-400" />
                                <span className="text-xs text-gray-500">Tambah Foto</span>
                              </div>
                            )}
                            <input
                              type="file"
                              className="hidden"
                              accept="image/*"
                              multiple
                              onChange={(e) => handleAddFotos(doc.id, e)}
                              disabled={uploadingToId === doc.id}
                            />
                          </label>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
