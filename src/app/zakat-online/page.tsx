'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, Loader2, CheckCircle, Upload, AlertCircle, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StepIndicator, ZAKAT_FORM_STEPS } from '@/components/zakat-online/step-indicator';
import { NameListInput } from '@/components/zakat-online/name-list-input';
import { PaymentInfo } from '@/components/zakat-online/payment-info';
import { createZakatOnline, uploadBuktiTransfer, getNextKodeUnik, getZakatOnlineById } from '@/lib/zakat-online-api';
import { notifyAdminNewUpload } from '@/app/actions/zakat-online';
import { formatRupiah, isValidWhatsApp } from '@/lib/utils';
import type { JenisZakat, MetodeBayar, ZakatFormData, ZakatOnline } from '@/types/zakat-online';
import { NOMINAL_FITRAH_PER_JIWA, NIAT_ZAKAT } from '@/types/zakat-online';

const initialFormData: ZakatFormData = {
  nama_muzakki: '',
  no_whatsapp: '',
  jenis_zakat: 'fitrah',
  jumlah_jiwa: 1,
  daftar_nama: [''],
  nominal_zakat: NOMINAL_FITRAH_PER_JIWA,
  nominal_infaq: 0,
  kode_unik: 0,
  total_bayar: 0,
  metode_bayar: 'transfer',
  setuju_niat: false,
};

export default function ZakatOnlinePage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<ZakatFormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [createdTransaction, setCreatedTransaction] = useState<ZakatOnline | null>(null);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [buktiPreview, setBuktiPreview] = useState<string | null>(null);

  // Load kode unik on mount
  useEffect(() => {
    async function loadKodeUnik() {
      try {
        const kode = await getNextKodeUnik();
        setFormData((prev) => ({
          ...prev,
          kode_unik: kode,
          total_bayar: prev.nominal_zakat + prev.nominal_infaq + kode,
        }));
      } catch (error) {
        console.error('Error loading kode unik:', error);
      }
    }
    loadKodeUnik();
  }, []);

  // Calculate total whenever relevant fields change
  useEffect(() => {
    const nominal = formData.jenis_zakat === 'fitrah'
      ? formData.jumlah_jiwa * NOMINAL_FITRAH_PER_JIWA
      : formData.nominal_zakat;

    setFormData((prev) => ({
      ...prev,
      nominal_zakat: nominal,
      total_bayar: nominal + prev.nominal_infaq + prev.kode_unik,
    }));
  }, [formData.jenis_zakat, formData.jumlah_jiwa]);

  const updateFormData = (updates: Partial<ZakatFormData>) => {
    setFormData((prev) => {
      const newData = { ...prev, ...updates };
      // Recalculate total
      newData.total_bayar = newData.nominal_zakat + newData.nominal_infaq + newData.kode_unik;
      return newData;
    });
  };

  const handleJumlahJiwaChange = (value: number) => {
    const jumlah = Math.max(1, Math.min(50, value));
    const currentNames = formData.daftar_nama;

    // Adjust names array
    let newNames = [...currentNames];
    if (jumlah > currentNames.length) {
      // Add empty slots
      for (let i = currentNames.length; i < jumlah; i++) {
        newNames.push('');
      }
    } else if (jumlah < currentNames.length) {
      // Remove excess
      newNames = newNames.slice(0, jumlah);
    }

    updateFormData({
      jumlah_jiwa: jumlah,
      daftar_nama: newNames,
    });
  };

  const validateStep = (step: number): boolean => {
    switch (step) {
      case 1:
        if (!formData.nama_muzakki.trim()) {
          setMessage({ type: 'error', text: 'Nama muzakki harus diisi' });
          return false;
        }
        if (!isValidWhatsApp(formData.no_whatsapp)) {
          setMessage({ type: 'error', text: 'Nomor WhatsApp tidak valid (format: 08xxx)' });
          return false;
        }
        break;
      case 2:
        if (formData.jenis_zakat === 'fitrah') {
          if (formData.jumlah_jiwa < 1) {
            setMessage({ type: 'error', text: 'Jumlah jiwa minimal 1' });
            return false;
          }
          // Check if all names are filled
          const emptyNames = formData.daftar_nama.filter((n) => !n.trim()).length;
          if (emptyNames > 0) {
            setMessage({ type: 'error', text: 'Semua nama jiwa harus diisi' });
            return false;
          }
        } else {
          if (formData.nominal_zakat < 1000) {
            setMessage({ type: 'error', text: 'Nominal minimal Rp 1.000' });
            return false;
          }
        }
        break;
      case 3:
        if (!formData.setuju_niat) {
          setMessage({ type: 'error', text: 'Anda harus menyetujui niat dan persetujuan' });
          return false;
        }
        break;
    }
    setMessage(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep === 3) {
        handleSubmitTransaction();
      } else {
        setCurrentStep((prev) => prev + 1);
      }
    }
  };

  const handleBack = () => {
    setMessage(null);
    setCurrentStep((prev) => prev - 1);
  };

  const handleSubmitTransaction = async () => {
    setIsSubmitting(true);
    setMessage(null);

    try {
      const result = await createZakatOnline({
        nama_muzakki: formData.nama_muzakki.trim(),
        no_whatsapp: formData.no_whatsapp,
        jenis_zakat: formData.jenis_zakat,
        jumlah_jiwa: formData.jenis_zakat === 'fitrah' ? formData.jumlah_jiwa : 0,
        daftar_nama: formData.jenis_zakat === 'fitrah' ? formData.daftar_nama : [],
        nominal_per_jiwa: formData.jenis_zakat === 'fitrah' ? NOMINAL_FITRAH_PER_JIWA : null,
        nominal_zakat: formData.nominal_zakat,
        nominal_infaq: formData.nominal_infaq,
        total_bayar: formData.total_bayar,
        metode_bayar: formData.metode_bayar,
      });

      if (result) {
        setCreatedTransaction(result);
        setCurrentStep(4);
        setMessage({ type: 'success', text: 'Transaksi berhasil dibuat!' });
      }
    } catch (error) {
      console.error('Error creating transaction:', error);
      setMessage({ type: 'error', text: 'Gagal membuat transaksi. Silakan coba lagi.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setMessage({ type: 'error', text: 'File harus berupa gambar' });
        return;
      }
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Ukuran file maksimal 5MB' });
        return;
      }

      setBuktiFile(file);
      setBuktiPreview(URL.createObjectURL(file));
      setMessage(null);
    }
  };

  const handleUploadBukti = async () => {
    if (!buktiFile || !createdTransaction) return;

    setIsUploading(true);
    setMessage(null);

    try {
      await uploadBuktiTransfer(createdTransaction.id, buktiFile);

      // Get updated transaction data and notify admin
      const updatedData = await getZakatOnlineById(createdTransaction.id);
      if (updatedData) {
        await notifyAdminNewUpload(updatedData);
      }

      setMessage({ type: 'success', text: 'Bukti transfer berhasil diupload! Admin akan segera memverifikasi.' });
      // Redirect to status page after 2 seconds
      setTimeout(() => {
        router.push(`/zakat-online/status?kode=${createdTransaction.kode_transaksi}`);
      }, 2000);
    } catch (error) {
      console.error('Error uploading bukti:', error);
      setMessage({ type: 'error', text: 'Gagal upload bukti. Silakan coba lagi.' });
    } finally {
      setIsUploading(false);
    }
  };

  const getNiatContent = () => {
    if (formData.jenis_zakat === 'fitrah') {
      return formData.jumlah_jiwa > 1 ? NIAT_ZAKAT.fitrah_keluarga : NIAT_ZAKAT.fitrah_satu;
    } else if (formData.jenis_zakat === 'maal') {
      return NIAT_ZAKAT.maal;
    }
    return NIAT_ZAKAT.infaq;
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Zakat Online
        </h1>
        <p className="text-gray-500">
          Musholla Al-Hikmah - Ramadhan 1447H / 2026M
        </p>
        <Link
          href="/zakat-online/status"
          className="inline-flex items-center gap-1.5 mt-3 text-sm text-[#599E6E] hover:underline"
        >
          <Search className="w-3.5 h-3.5" />
          Cek status transaksi
        </Link>
      </div>

      {/* Step Indicator */}
      <StepIndicator steps={ZAKAT_FORM_STEPS} currentStep={currentStep} />

      {/* Message */}
      {message && (
        <div
          className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      {/* Form Card */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>
            {currentStep === 1 && 'Data Muzakki'}
            {currentStep === 2 && 'Detail Zakat'}
            {currentStep === 3 && 'Niat & Review'}
            {currentStep === 4 && 'Pembayaran'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {/* Step 1: Data Muzakki */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nama Perwakilan Muzakki <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.nama_muzakki}
                  onChange={(e) => updateFormData({ nama_muzakki: e.target.value })}
                  placeholder="Masukkan nama lengkap"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#599E6E] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  No. WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={formData.no_whatsapp}
                  onChange={(e) => updateFormData({ no_whatsapp: e.target.value })}
                  placeholder="Contoh: 08123456789"
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#599E6E] focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Invoice akan dikirim ke nomor ini setelah verifikasi
                </p>
              </div>
            </div>
          )}

          {/* Step 2: Detail Zakat */}
          {currentStep === 2 && (
            <div className="space-y-6">
              {/* Jenis Zakat */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Jenis Zakat <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(['fitrah', 'maal', 'infaq'] as JenisZakat[]).map((jenis) => (
                    <button
                      key={jenis}
                      type="button"
                      onClick={() => updateFormData({ jenis_zakat: jenis })}
                      className={`p-3 rounded-lg border-2 text-center transition-colors ${
                        formData.jenis_zakat === jenis
                          ? 'border-[#599E6E] bg-[#599E6E]/5 text-[#599E6E]'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className="text-sm font-medium capitalize">{jenis}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Fitrah: Jumlah Jiwa & Daftar Nama */}
              {formData.jenis_zakat === 'fitrah' && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Jumlah Jiwa <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => handleJumlahJiwaChange(formData.jumlah_jiwa - 1)}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-medium hover:bg-gray-50"
                        disabled={formData.jumlah_jiwa <= 1}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={formData.jumlah_jiwa}
                        onChange={(e) => handleJumlahJiwaChange(parseInt(e.target.value) || 1)}
                        min={1}
                        max={50}
                        className="w-20 text-center rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#599E6E]"
                      />
                      <button
                        type="button"
                        onClick={() => handleJumlahJiwaChange(formData.jumlah_jiwa + 1)}
                        className="w-10 h-10 rounded-lg border border-gray-300 flex items-center justify-center text-lg font-medium hover:bg-gray-50"
                        disabled={formData.jumlah_jiwa >= 50}
                      >
                        +
                      </button>
                      <span className="text-sm text-gray-500">
                        × {formatRupiah(NOMINAL_FITRAH_PER_JIWA)}
                      </span>
                    </div>
                  </div>

                  <NameListInput
                    names={formData.daftar_nama}
                    onChange={(names) => updateFormData({ daftar_nama: names })}
                    maxNames={formData.jumlah_jiwa}
                  />

                  <div className="bg-[#599E6E]/10 rounded-lg p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total Zakat Fitrah:</span>
                      <span className="text-lg font-bold text-[#599E6E]">
                        {formatRupiah(formData.nominal_zakat)}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Maal/Infaq: Custom Nominal */}
              {formData.jenis_zakat !== 'fitrah' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nominal {formData.jenis_zakat === 'maal' ? 'Zakat Maal' : 'Infaq'}{' '}
                    <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={formData.nominal_zakat || ''}
                      onChange={(e) =>
                        updateFormData({ nominal_zakat: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                      min={1000}
                      className="w-full rounded-lg border border-gray-300 pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#599E6E]"
                    />
                  </div>
                </div>
              )}

              {/* Tambahan Infaq (optional) */}
              {formData.jenis_zakat !== 'infaq' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tambahan Infaq (opsional)
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
                      Rp
                    </span>
                    <input
                      type="number"
                      value={formData.nominal_infaq || ''}
                      onChange={(e) =>
                        updateFormData({ nominal_infaq: parseInt(e.target.value) || 0 })
                      }
                      placeholder="0"
                      min={0}
                      className="w-full rounded-lg border border-gray-300 pl-12 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#599E6E]"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Niat & Review */}
          {currentStep === 3 && (
            <div className="space-y-6">
              {/* Niat */}
              <div className="bg-gray-50 rounded-xl p-4">
                <h3 className="font-semibold text-gray-900 mb-3">Niat Zakat</h3>
                <div className="space-y-3">
                  <p className="text-xl text-right font-arabic leading-loose" dir="rtl">
                    {getNiatContent().arab}
                  </p>
                  <p className="text-sm text-gray-600 italic">{getNiatContent().latin}</p>
                  <p className="text-sm text-gray-800">{getNiatContent().indonesia}</p>
                </div>
              </div>

              {/* Review Summary */}
              <div className="border border-gray-200 rounded-xl overflow-hidden">
                <div className="bg-gray-50 px-4 py-3 border-b">
                  <h3 className="font-semibold text-gray-900">Ringkasan</h3>
                </div>
                <div className="p-4 space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Nama Muzakki</span>
                    <span className="font-medium">{formData.nama_muzakki}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">No. WhatsApp</span>
                    <span className="font-medium">{formData.no_whatsapp}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Jenis Zakat</span>
                    <span className="font-medium capitalize">{formData.jenis_zakat}</span>
                  </div>
                  {formData.jenis_zakat === 'fitrah' && (
                    <>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Jumlah Jiwa</span>
                        <span className="font-medium">{formData.jumlah_jiwa} jiwa</span>
                      </div>
                      <div className="text-sm">
                        <span className="text-gray-500">Daftar Nama:</span>
                        <ul className="mt-1 ml-4 list-disc text-gray-700">
                          {formData.daftar_nama.map((nama, i) => (
                            <li key={i}>{nama}</li>
                          ))}
                        </ul>
                      </div>
                    </>
                  )}
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">
                        {formData.jenis_zakat === 'infaq' ? 'Infaq' : 'Zakat'}
                      </span>
                      <span>{formatRupiah(formData.nominal_zakat)}</span>
                    </div>
                    {formData.nominal_infaq > 0 && formData.jenis_zakat !== 'infaq' && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Tambahan Infaq</span>
                        <span>{formatRupiah(formData.nominal_infaq)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Kode Unik (infaq)</span>
                      <span>{formatRupiah(formData.kode_unik)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-[#599E6E] pt-2 border-t">
                      <span>Total Bayar</span>
                      <span>{formatRupiah(formData.total_bayar)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Checkbox Persetujuan */}
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.setuju_niat}
                  onChange={(e) => updateFormData({ setuju_niat: e.target.checked })}
                  className="mt-1 w-4 h-4 text-[#599E6E] rounded border-gray-300 focus:ring-[#599E6E]"
                />
                <span className="text-sm text-gray-700">
                  Saya telah membaca niat zakat dan menyetujui bahwa data yang saya isi adalah benar.
                  Saya juga memahami bahwa kode unik akan dijadikan infaq.
                </span>
              </label>
            </div>
          )}

          {/* Step 4: Pembayaran */}
          {currentStep === 4 && createdTransaction && (
            <div className="space-y-6">
              {/* Transaction Info */}
              <div className="bg-[#599E6E]/10 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Kode Transaksi:</span>
                  <span className="font-mono font-bold text-lg text-[#599E6E]">
                    {createdTransaction.kode_transaksi}
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Simpan kode ini untuk mengecek status transaksi
                </p>
              </div>

              {/* Payment Info */}
              <PaymentInfo
                totalBayar={createdTransaction.total_bayar}
                kodeUnik={createdTransaction.kode_unik}
                metodeBayar={formData.metode_bayar}
                onMethodChange={(method) => updateFormData({ metode_bayar: method })}
              />

              {/* Upload Bukti */}
              <div className="border-t pt-6">
                <h3 className="font-semibold text-gray-900 mb-3">Upload Bukti Transfer</h3>

                {buktiPreview ? (
                  <div className="space-y-3">
                    <div className="relative w-full aspect-video bg-gray-100 rounded-lg overflow-hidden">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={buktiPreview}
                        alt="Preview bukti transfer"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setBuktiFile(null);
                          setBuktiPreview(null);
                        }}
                        className="flex-1"
                      >
                        Ganti Foto
                      </Button>
                      <Button
                        onClick={handleUploadBukti}
                        disabled={isUploading}
                        className="flex-1"
                      >
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Mengupload...
                          </>
                        ) : (
                          <>
                            <Upload className="w-4 h-4 mr-2" />
                            Konfirmasi Upload
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#599E6E] transition-colors">
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">Klik untuk upload bukti transfer</span>
                    <span className="text-xs text-gray-400 mt-1">JPG, PNG (maks. 5MB)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          {currentStep < 4 && (
            <div className="flex gap-3 mt-8">
              {currentStep > 1 && (
                <Button variant="outline" onClick={handleBack} className="flex-1">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Kembali
                </Button>
              )}
              <Button
                onClick={handleNext}
                disabled={isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Memproses...
                  </>
                ) : currentStep === 3 ? (
                  <>
                    Buat Transaksi
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Lanjut
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Link to check status */}
      <div className="mt-6 text-center">
        <p className="text-sm text-gray-500 mb-2">Sudah pernah membuat transaksi?</p>
        <Link
          href="/zakat-online/status"
          className="inline-flex items-center gap-2 text-[#599E6E] hover:underline font-medium"
        >
          <Search className="w-4 h-4" />
          Cek Status Transaksi
        </Link>
      </div>
    </div>
  );
}
