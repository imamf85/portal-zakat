'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  Clock,
  Upload,
  CheckCircle,
  XCircle,
  Loader2,
  ArrowRight,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getZakatOnlineByKode, uploadBuktiTransfer, getZakatOnlineById } from '@/lib/zakat-online-api';
import { notifyAdminNewUpload } from '@/app/actions/zakat-online';
import { formatRupiah, formatWaktuJakarta } from '@/lib/utils';
import type { ZakatOnline, StatusZakat } from '@/types/zakat-online';

const statusConfig: Record<
  StatusZakat,
  { label: string; color: string; bgColor: string; icon: React.ElementType }
> = {
  pending: {
    label: 'Menunggu Pembayaran',
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    icon: Clock,
  },
  uploaded: {
    label: 'Menunggu Verifikasi',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    icon: Upload,
  },
  verified: {
    label: 'Terverifikasi',
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    icon: CheckCircle,
  },
  rejected: {
    label: 'Ditolak',
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    icon: XCircle,
  },
};

function StatusPageContent() {
  const searchParams = useSearchParams();
  const kodeFromUrl = searchParams.get('kode') || '';

  const [kode, setKode] = useState(kodeFromUrl);
  const [transaction, setTransaction] = useState<ZakatOnline | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buktiFile, setBuktiFile] = useState<File | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  // Auto-search if kode from URL
  useEffect(() => {
    if (kodeFromUrl) {
      handleSearch(kodeFromUrl);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [kodeFromUrl]);

  const handleSearch = async (searchKode?: string) => {
    const kodeToSearch = searchKode || kode;
    if (!kodeToSearch.trim()) {
      setError('Masukkan kode transaksi');
      return;
    }

    setIsLoading(true);
    setError(null);
    setTransaction(null);

    try {
      const result = await getZakatOnlineByKode(kodeToSearch.trim());
      if (result) {
        setTransaction(result);
      } else {
        setError('Transaksi tidak ditemukan');
      }
    } catch (err) {
      console.error('Error searching:', err);
      setError('Gagal mencari transaksi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('File harus berupa gambar');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('Ukuran file maksimal 5MB');
        return;
      }
      setBuktiFile(file);
      setError(null);
    }
  };

  const handleUpload = async () => {
    if (!buktiFile || !transaction) return;

    setIsUploading(true);
    setError(null);

    try {
      await uploadBuktiTransfer(transaction.id, buktiFile);

      // Get updated transaction data and notify admin
      const updatedData = await getZakatOnlineById(transaction.id);
      if (updatedData) {
        await notifyAdminNewUpload(updatedData);
      }

      setUploadSuccess(true);
      // Refresh transaction data
      await handleSearch(transaction.kode_transaksi);
    } catch (err) {
      console.error('Error uploading:', err);
      setError('Gagal upload bukti');
    } finally {
      setIsUploading(false);
    }
  };

  const status = transaction ? statusConfig[transaction.status] : null;
  const StatusIcon = status?.icon;

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
          Cek Status Transaksi
        </h1>
        <p className="text-gray-500">
          Masukkan kode transaksi untuk melihat status pembayaran zakat
        </p>
      </div>

      {/* Search Box */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={kode}
              onChange={(e) => setKode(e.target.value.toUpperCase())}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Contoh: ZKT-20260316-A7X2"
              className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#599E6E] focus:border-transparent"
            />
            <Button onClick={() => handleSearch()} disabled={isLoading}>
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Search className="w-5 h-5" />
              )}
            </Button>
          </div>
          {error && !transaction && (
            <p className="text-sm text-red-600 mt-2">{error}</p>
          )}
        </CardContent>
      </Card>

      {/* Transaction Details */}
      {transaction && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Detail Transaksi</CardTitle>
              {status && StatusIcon && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}
                >
                  <StatusIcon className="w-4 h-4" />
                  {status.label}
                </span>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Kode Transaksi</span>
                <p className="font-mono font-bold">{transaction.kode_transaksi}</p>
              </div>
              <div>
                <span className="text-gray-500">Tanggal</span>
                <p className="font-medium">{formatWaktuJakarta(transaction.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-500">Nama Muzakki</span>
                <p className="font-medium">{transaction.nama_muzakki}</p>
              </div>
              <div>
                <span className="text-gray-500">Jenis Zakat</span>
                <p className="font-medium capitalize">{transaction.jenis_zakat}</p>
              </div>
              {transaction.jenis_zakat === 'fitrah' && (
                <div className="col-span-2">
                  <span className="text-gray-500">Jumlah Jiwa</span>
                  <p className="font-medium">{transaction.jumlah_jiwa} jiwa</p>
                  {transaction.daftar_nama && transaction.daftar_nama.length > 0 && (
                    <ul className="mt-1 ml-4 list-disc text-gray-600 text-xs">
                      {transaction.daftar_nama.map((nama, i) => (
                        <li key={i}>{nama}</li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>

            {/* Payment Info */}
            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">
                    {transaction.jenis_zakat === 'infaq' ? 'Infaq' : 'Zakat'}
                  </span>
                  <span>{formatRupiah(transaction.nominal_zakat)}</span>
                </div>
                {transaction.nominal_infaq > 0 && transaction.jenis_zakat !== 'infaq' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Tambahan Infaq</span>
                    <span>{formatRupiah(transaction.nominal_infaq)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Kode Unik (infaq)</span>
                  <span>{formatRupiah(transaction.kode_unik)}</span>
                </div>
                <div className="flex justify-between font-bold text-[#599E6E] pt-2 border-t">
                  <span>Total Bayar</span>
                  <span>{formatRupiah(transaction.total_bayar)}</span>
                </div>
              </div>
            </div>

            {/* Status-specific content */}
            {transaction.status === 'pending' && (
              <div className="border-t pt-4">
                <h3 className="font-semibold text-gray-900 mb-3">Upload Bukti Transfer</h3>
                <div className="space-y-3">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#599E6E] transition-colors">
                    <Upload className="w-6 h-6 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-500">
                      {buktiFile ? buktiFile.name : 'Klik untuk upload'}
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                  {buktiFile && (
                    <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                      {isUploading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Mengupload...
                        </>
                      ) : (
                        'Upload Bukti'
                      )}
                    </Button>
                  )}
                  {error && <p className="text-sm text-red-600">{error}</p>}
                </div>
              </div>
            )}

            {transaction.status === 'uploaded' && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Upload className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-800">Bukti transfer sudah diupload</p>
                    <p className="text-sm text-blue-600 mt-1">
                      Tim kami sedang memverifikasi pembayaran Anda. Anda akan menerima
                      notifikasi WhatsApp setelah verifikasi selesai.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {transaction.status === 'verified' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-green-800">Pembayaran Terverifikasi</p>
                      <p className="text-sm text-green-600 mt-1">
                        Terima kasih. Semoga Allah SWT menerima zakat dan amal ibadah Anda.
                      </p>
                      {transaction.confirmed_at && (
                        <p className="text-xs text-green-500 mt-2">
                          Diverifikasi pada: {formatWaktuJakarta(transaction.confirmed_at)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {transaction.invoice_token && (
                  <Link href={`/zakat-online/invoice/${transaction.invoice_token}`}>
                    <Button variant="outline" className="w-full">
                      <FileText className="w-4 h-4 mr-2" />
                      Lihat Invoice
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {transaction.status === 'rejected' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="font-medium text-red-800">Pembayaran Ditolak</p>
                      {transaction.catatan_admin && (
                        <p className="text-sm text-red-600 mt-1">
                          Alasan: {transaction.catatan_admin}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-gray-900 mb-3">Upload Ulang Bukti</h3>
                  <div className="space-y-3">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#599E6E] transition-colors">
                      <Upload className="w-6 h-6 text-gray-400 mb-2" />
                      <span className="text-sm text-gray-500">
                        {buktiFile ? buktiFile.name : 'Klik untuk upload'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                    {buktiFile && (
                      <Button onClick={handleUpload} disabled={isUploading} className="w-full">
                        {isUploading ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Mengupload...
                          </>
                        ) : (
                          'Upload Bukti'
                        )}
                      </Button>
                    )}
                    {error && <p className="text-sm text-red-600">{error}</p>}
                  </div>
                </div>
              </div>
            )}

            {uploadSuccess && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <p className="text-sm text-green-800">
                  Bukti transfer berhasil diupload! Mohon tunggu verifikasi admin.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Back link */}
      <div className="mt-6 text-center">
        <Link href="/zakat-online" className="text-sm text-[#599E6E] hover:underline">
          Buat transaksi zakat baru
        </Link>
      </div>
    </div>
  );
}

export default function StatusPage() {
  return (
    <Suspense fallback={
      <div className="max-w-2xl mx-auto px-4 py-8 text-center">
        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#599E6E]" />
      </div>
    }>
      <StatusPageContent />
    </Suspense>
  );
}
