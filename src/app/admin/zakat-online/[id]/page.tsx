'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
  Clock,
  Upload,
  MessageCircle,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { getZakatOnlineById, verifyZakatOnline, rejectZakatOnline } from '@/lib/zakat-online-api';
import { sendWhatsApp, getVerificationMessage, getRejectionMessage } from '@/lib/waha';
import { formatRupiah, formatWaktuJakarta, formatWhatsAppNumber } from '@/lib/utils';
import type { ZakatOnline, StatusZakat } from '@/types/zakat-online';

const statusConfig: Record<StatusZakat, { label: string; color: string; bgColor: string }> = {
  pending: { label: 'Menunggu Pembayaran', color: 'text-amber-600', bgColor: 'bg-amber-50' },
  uploaded: { label: 'Menunggu Verifikasi', color: 'text-blue-600', bgColor: 'bg-blue-50' },
  verified: { label: 'Terverifikasi', color: 'text-green-600', bgColor: 'bg-green-50' },
  rejected: { label: 'Ditolak', color: 'text-red-600', bgColor: 'bg-red-50' },
};

interface AdminZakatDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function AdminZakatDetailPage({ params }: AdminZakatDetailPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { user } = useAuth();

  const [transaction, setTransaction] = useState<ZakatOnline | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchTransaction();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchTransaction = async () => {
    setIsLoading(true);
    try {
      const data = await getZakatOnlineById(id);
      setTransaction(data);
    } catch (error) {
      console.error('Error fetching transaction:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!transaction || !user) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await verifyZakatOnline(transaction.id, user.id);

      if (result) {
        // Send WhatsApp notification
        const invoiceUrl = `${window.location.origin}/zakat-online/invoice/${result.invoice_token}`;
        const waMessage = getVerificationMessage(result, invoiceUrl);
        const phone = formatWhatsAppNumber(result.no_whatsapp);

        await sendWhatsApp(phone, waMessage);

        setMessage({ type: 'success', text: 'Transaksi berhasil diverifikasi dan notifikasi WhatsApp terkirim!' });
        setTransaction(result);
      }
    } catch (error) {
      console.error('Error verifying:', error);
      setMessage({ type: 'error', text: 'Gagal memverifikasi transaksi' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!transaction || !user || !rejectReason.trim()) return;

    setIsProcessing(true);
    setMessage(null);

    try {
      const result = await rejectZakatOnline(transaction.id, user.id, rejectReason);

      if (result) {
        // Send WhatsApp notification
        const waMessage = getRejectionMessage(result, rejectReason);
        const phone = formatWhatsAppNumber(result.no_whatsapp);

        await sendWhatsApp(phone, waMessage);

        setMessage({ type: 'success', text: 'Transaksi ditolak dan notifikasi WhatsApp terkirim!' });
        setTransaction(result);
        setShowRejectModal(false);
        setRejectReason('');
      }
    } catch (error) {
      console.error('Error rejecting:', error);
      setMessage({ type: 'error', text: 'Gagal menolak transaksi' });
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-[#599E6E]" />
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Transaksi tidak ditemukan</p>
        <Link href="/admin/zakat-online">
          <Button variant="outline" className="mt-4">
            Kembali
          </Button>
        </Link>
      </div>
    );
  }

  const status = statusConfig[transaction.status];
  const jenisZakat =
    transaction.jenis_zakat === 'fitrah'
      ? 'Zakat Fitrah'
      : transaction.jenis_zakat === 'maal'
      ? 'Zakat Maal'
      : 'Infaq';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/admin/zakat-online">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-gray-900">{transaction.kode_transaksi}</h1>
          <p className="text-gray-500 text-sm">{transaction.nama_muzakki}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${status.bgColor} ${status.color}`}>
          {status.label}
        </span>
      </div>

      {/* Message */}
      {message && (
        <div
          className={`p-4 rounded-lg flex items-center gap-2 ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border border-green-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          {message.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0" />
          ) : (
            <XCircle className="w-5 h-5 flex-shrink-0" />
          )}
          <span className="text-sm">{message.text}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Transaction Details */}
        <div className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Detail Transaksi</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
                  <span className="text-gray-500">No. WhatsApp</span>
                  <p className="font-medium">{transaction.no_whatsapp}</p>
                </div>
                <div>
                  <span className="text-gray-500">Jenis</span>
                  <p className="font-medium">{jenisZakat}</p>
                </div>
                <div>
                  <span className="text-gray-500">Metode Bayar</span>
                  <p className="font-medium capitalize">{transaction.metode_bayar || '-'}</p>
                </div>
              </div>

              {transaction.jenis_zakat === 'fitrah' && (
                <div className="border-t pt-4">
                  <span className="text-sm text-gray-500">Daftar Nama ({transaction.jumlah_jiwa} jiwa):</span>
                  <ol className="mt-2 ml-4 list-decimal text-sm">
                    {transaction.daftar_nama?.map((nama, i) => (
                      <li key={i}>{nama}</li>
                    ))}
                  </ol>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Rincian Pembayaran</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">{jenisZakat}</span>
                  <span>{formatRupiah(transaction.nominal_zakat)}</span>
                </div>
                {transaction.nominal_infaq > 0 && transaction.jenis_zakat !== 'infaq' && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Infaq Tambahan</span>
                    <span>{formatRupiah(transaction.nominal_infaq)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-500">Kode Unik (Infaq)</span>
                  <span>{formatRupiah(transaction.kode_unik)}</span>
                </div>
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total</span>
                  <span className="text-[#599E6E]">{formatRupiah(transaction.total_bayar)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Admin Notes */}
          {transaction.catatan_admin && (
            <Card>
              <CardHeader>
                <CardTitle>Catatan Admin</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700">{transaction.catatan_admin}</p>
              </CardContent>
            </Card>
          )}

          {/* Verification Info */}
          {transaction.confirmed_at && (
            <Card>
              <CardHeader>
                <CardTitle>Info Verifikasi</CardTitle>
              </CardHeader>
              <CardContent className="text-sm">
                <p>
                  <span className="text-gray-500">Waktu:</span>{' '}
                  {formatWaktuJakarta(transaction.confirmed_at)}
                </p>
                {transaction.invoice_token && (
                  <p className="mt-2">
                    <span className="text-gray-500">Invoice:</span>{' '}
                    <Link
                      href={`/zakat-online/invoice/${transaction.invoice_token}`}
                      target="_blank"
                      className="text-[#599E6E] hover:underline inline-flex items-center gap-1"
                    >
                      Lihat Invoice <ExternalLink className="w-3 h-3" />
                    </Link>
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: Bukti Transfer & Actions */}
        <div className="space-y-6">
          {/* Bukti Transfer */}
          <Card>
            <CardHeader>
              <CardTitle>Bukti Transfer</CardTitle>
            </CardHeader>
            <CardContent>
              {transaction.bukti_transfer_url ? (
                <div className="space-y-3">
                  <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                    <Image
                      src={transaction.bukti_transfer_url}
                      alt="Bukti Transfer"
                      fill
                      className="object-contain"
                    />
                  </div>
                  <a
                    href={transaction.bukti_transfer_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-[#599E6E] hover:underline inline-flex items-center gap-1"
                  >
                    Buka gambar asli <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : (
                <div className="aspect-video bg-gray-100 rounded-lg flex flex-col items-center justify-center">
                  <Upload className="w-8 h-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">Belum ada bukti transfer</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {transaction.status === 'uploaded' && (
            <Card>
              <CardHeader>
                <CardTitle>Tindakan</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleVerify}
                  disabled={isProcessing}
                  className="w-full"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4 mr-2" />
                  )}
                  Verifikasi Pembayaran
                </Button>
                <Button
                  onClick={() => setShowRejectModal(true)}
                  variant="outline"
                  disabled={isProcessing}
                  className="w-full text-red-600 border-red-200 hover:bg-red-50"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Tolak Pembayaran
                </Button>
                <p className="text-xs text-gray-500 text-center">
                  <MessageCircle className="w-3 h-3 inline mr-1" />
                  Notifikasi WhatsApp akan otomatis terkirim
                </p>
              </CardContent>
            </Card>
          )}

          {/* Status Info */}
          {transaction.status === 'pending' && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-800">Menunggu Pembayaran</p>
                    <p className="text-sm text-amber-600 mt-1">
                      User belum mengupload bukti transfer.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {transaction.status === 'verified' && (
            <Card>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-green-800">Terverifikasi</p>
                    <p className="text-sm text-green-600 mt-1">
                      Pembayaran sudah diverifikasi dan invoice sudah dikirim.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Tolak Pembayaran</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alasan Penolakan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  placeholder="Contoh: Bukti transfer tidak jelas, nominal tidak sesuai, dll."
                  rows={3}
                  className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#599E6E]"
                />
              </div>
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowRejectModal(false);
                    setRejectReason('');
                  }}
                  disabled={isProcessing}
                  className="flex-1"
                >
                  Batal
                </Button>
                <Button
                  onClick={handleReject}
                  disabled={isProcessing || !rejectReason.trim()}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  {isProcessing ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    'Tolak'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
