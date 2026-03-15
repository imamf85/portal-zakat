'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { HandHeart, Save, RotateCcw } from 'lucide-react';
import { supabase, getCurrentHijriYear, getCurrentMasehiYear } from '@/lib/supabase';

type KategoriMustahik = 'Fakir/Miskin' | 'Amil' | 'Fisabilillah' | '';

interface FormData {
  tanggal_penyaluran: string;
  nama_mustahik: string;
  alamat: string;
  no_hp: string;
  kategori: KategoriMustahik;
  nominal_uang: number;
  jumlah_beras_kg: number;
  keterangan: string;
}

const initialFormData: FormData = {
  tanggal_penyaluran: new Date().toISOString().split('T')[0],
  nama_mustahik: '',
  alamat: '',
  no_hp: '',
  kategori: '',
  nominal_uang: 0,
  jumlah_beras_kg: 0,
  keterangan: '',
};

export default function InputPenyaluranPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('penyaluran').insert({
        tanggal_penyaluran: formData.tanggal_penyaluran,
        nama_mustahik: formData.nama_mustahik,
        alamat: formData.alamat || null,
        no_hp: formData.no_hp || null,
        kategori: formData.kategori,
        nominal_uang: formData.nominal_uang || null,
        jumlah_beras_kg: formData.jumlah_beras_kg || null,
        keterangan: formData.keterangan || null,
        tahun_hijriah: getCurrentHijriYear(),
        tahun_masehi: getCurrentMasehiYear(),
      });

      if (error) throw error;

      setMessage({ type: 'success', text: `Data ${formData.nama_mustahik} berhasil disimpan!` });
      setFormData(initialFormData);
    } catch (err) {
      console.error('Error:', err);
      setMessage({ type: 'error', text: 'Gagal menyimpan data. Silakan coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setMessage(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
          <HandHeart className="w-7 h-7 text-blue-600" />
          Input Penyaluran Zakat
        </h1>
        <p className="mt-1 text-gray-500">
          Catat distribusi zakat kepada mustahik
        </p>
      </div>

      {/* Message */}
      {message && (
        <div className={`mb-6 p-4 rounded-lg ${
          message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle>Form Penyaluran Zakat</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Penyaluran *
                </label>
                <input
                  type="date"
                  name="tanggal_penyaluran"
                  value={formData.tanggal_penyaluran}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kategori Mustahik *
                </label>
                <select
                  name="kategori"
                  value={formData.kategori}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                >
                  <option value="">-- Pilih Kategori --</option>
                  <option value="Fakir/Miskin">Fakir/Miskin</option>
                  <option value="Amil">Amil</option>
                  <option value="Fisabilillah">Fisabilillah</option>
                </select>
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Mustahik *
                </label>
                <input
                  type="text"
                  name="nama_mustahik"
                  value={formData.nama_mustahik}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Ibu Srimulyawati"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. HP
                </label>
                <input
                  type="tel"
                  name="no_hp"
                  value={formData.no_hp}
                  onChange={handleChange}
                  placeholder="Contoh: 08123456789"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                />
              </div>
            </div>

            {/* Alamat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alamat
              </label>
              <input
                type="text"
                name="alamat"
                value={formData.alamat}
                onChange={handleChange}
                placeholder="Contoh: Jl. Bakti I No. 70 Rt 07/09"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
              />
            </div>

            {/* Nominal */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Jumlah yang Disalurkan</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Uang (Rp)
                  </label>
                  <input
                    type="number"
                    name="nominal_uang"
                    value={formData.nominal_uang || ''}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Beras (Kg)
                  </label>
                  <input
                    type="number"
                    name="jumlah_beras_kg"
                    value={formData.jumlah_beras_kg || ''}
                    onChange={handleChange}
                    min="0"
                    step="0.5"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                  />
                </div>
              </div>
            </div>

            {/* Keterangan */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keterangan
              </label>
              <textarea
                name="keterangan"
                value={formData.keterangan}
                onChange={handleChange}
                rows={3}
                placeholder="Catatan tambahan (opsional)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button type="button" variant="outline" onClick={handleReset}>
                <RotateCcw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                <Save className="w-4 h-4 mr-2" />
                {isSubmitting ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
