'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UserPlus, Save, RotateCcw } from 'lucide-react';
import { supabase, getCurrentHijriYear, getCurrentMasehiYear } from '@/lib/supabase';
import { CountdownTimer } from '@/components/zakat-online/countdown-timer';
import { isZakatOpen } from '@/lib/zakat-config';

type JenisFitrah = 'uang' | 'beras' | '';

interface FormData {
  tanggal_transaksi: string;
  nama_muzakki: string;
  no_hp: string;
  metode_bayar: string;
  jenis_fitrah: JenisFitrah;
  jumlah_jiwa: number;
  nominal_fitrah: number;
  nominal_maal: number;
  nominal_infaq: number;
  petugas: string;
}

const initialFormData: FormData = {
  tanggal_transaksi: new Date().toISOString().split('T')[0],
  nama_muzakki: '',
  no_hp: '',
  metode_bayar: 'Cash',
  jenis_fitrah: '',
  jumlah_jiwa: 1,
  nominal_fitrah: 0,
  nominal_maal: 0,
  nominal_infaq: 0,
  petugas: '',
};

export default function InputPenerimaanPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [zakatOpen, setZakatOpen] = useState(isZakatOpen());

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value,
    }));
  };

  const handleJiwaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const jumlah_jiwa = parseInt(e.target.value) || 0;
    let nominal_fitrah = 0;

    if (formData.jenis_fitrah === 'uang') {
      nominal_fitrah = jumlah_jiwa * 50000;
    } else if (formData.jenis_fitrah === 'beras') {
      nominal_fitrah = jumlah_jiwa * 2.5;
    }

    setFormData(prev => ({
      ...prev,
      jumlah_jiwa,
      nominal_fitrah,
    }));
  };

  const handleJenisChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const jenis_fitrah = e.target.value as JenisFitrah;
    let nominal_fitrah = 0;

    if (jenis_fitrah === 'uang') {
      nominal_fitrah = formData.jumlah_jiwa * 50000;
    } else if (jenis_fitrah === 'beras') {
      nominal_fitrah = formData.jumlah_jiwa * 2.5;
    }

    setFormData(prev => ({
      ...prev,
      jenis_fitrah,
      nominal_fitrah,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    try {
      const { error } = await supabase.from('penerimaan').insert({
        tanggal_transaksi: formData.tanggal_transaksi,
        nama_muzakki: formData.nama_muzakki,
        no_hp: formData.no_hp || null,
        metode_bayar: formData.metode_bayar,
        jenis_fitrah: formData.jenis_fitrah || null,
        jumlah_jiwa: formData.jumlah_jiwa,
        nominal_fitrah: formData.nominal_fitrah || null,
        nominal_maal: formData.nominal_maal || null,
        nominal_infaq: formData.nominal_infaq || null,
        petugas: formData.petugas || null,
        tahun_hijriah: getCurrentHijriYear(),
        tahun_masehi: getCurrentMasehiYear(),
      });

      if (error) throw error;

      setMessage({ type: 'success', text: `Data ${formData.nama_muzakki} berhasil disimpan!` });
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
          <UserPlus className="w-7 h-7 text-[#599E6E]" />
          Input Penerimaan Zakat
        </h1>
        <p className="mt-1 text-gray-500">
          Tambah data penerimaan zakat dari muzakki
        </p>
      </div>

      {/* Countdown Timer */}
      <div className="mb-6">
        <CountdownTimer variant="compact" onExpired={() => setZakatOpen(false)} />
        {!zakatOpen && (
          <p className="mt-2 text-sm text-amber-600">
            Periode penerimaan telah ditutup. Form masih dapat digunakan untuk input data terlambat.
          </p>
        )}
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
          <CardTitle>Form Penerimaan Zakat</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Row 1 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tanggal Transaksi *
                </label>
                <input
                  type="date"
                  name="tanggal_transaksi"
                  value={formData.tanggal_transaksi}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Muzakki *
                </label>
                <input
                  type="text"
                  name="nama_muzakki"
                  value={formData.nama_muzakki}
                  onChange={handleChange}
                  required
                  placeholder="Contoh: Pak H. Gunawan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                />
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Metode Pembayaran
                </label>
                <select
                  name="metode_bayar"
                  value={formData.metode_bayar}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                >
                  <option value="Cash">Cash</option>
                  <option value="Transfer">Transfer</option>
                </select>
              </div>
            </div>

            {/* Zakat Fitrah Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Zakat Fitrah</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jenis Fitrah
                  </label>
                  <select
                    name="jenis_fitrah"
                    value={formData.jenis_fitrah}
                    onChange={handleJenisChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                  >
                    <option value="">-- Pilih --</option>
                    <option value="uang">Uang (Rp 50.000/jiwa)</option>
                    <option value="beras">Beras (2,5 Kg/jiwa)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Jumlah Jiwa
                  </label>
                  <input
                    type="number"
                    name="jumlah_jiwa"
                    value={formData.jumlah_jiwa}
                    onChange={handleJiwaChange}
                    min="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.jenis_fitrah === 'beras' ? 'Total Beras (Kg)' : 'Total Nominal (Rp)'}
                  </label>
                  <input
                    type="number"
                    name="nominal_fitrah"
                    value={formData.nominal_fitrah}
                    onChange={handleChange}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50"
                    readOnly
                  />
                </div>
              </div>
            </div>

            {/* Zakat Maal & Infaq Section */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Zakat Maal & Infaq (Opsional)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Zakat Maal (Rp)
                  </label>
                  <input
                    type="number"
                    name="nominal_maal"
                    value={formData.nominal_maal || ''}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Infaq (Rp)
                  </label>
                  <input
                    type="number"
                    name="nominal_infaq"
                    value={formData.nominal_infaq || ''}
                    onChange={handleChange}
                    min="0"
                    placeholder="0"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                  />
                </div>
              </div>
            </div>

            {/* Petugas */}
            <div className="border-t pt-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Petugas
                </label>
                <input
                  type="text"
                  name="petugas"
                  value={formData.petugas}
                  onChange={handleChange}
                  placeholder="Contoh: Pak Yayat"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#599E6E] focus:border-[#599E6E]"
                />
              </div>
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
