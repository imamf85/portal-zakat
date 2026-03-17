import { notFound } from 'next/navigation';
import Image from 'next/image';
import { getZakatOnlineByToken } from '@/lib/zakat-online-api';
import { formatRupiah, formatTanggal, formatWaktuJakarta } from '@/lib/utils';
import { BANK_INFO } from '@/types/zakat-online';
import { PrintButton } from './print-button';

interface InvoicePageProps {
  params: Promise<{
    token: string;
  }>;
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { token } = await params;
  const transaction = await getZakatOnlineByToken(token);

  if (!transaction || transaction.status !== 'verified') {
    notFound();
  }

  const jenisZakat =
    transaction.jenis_zakat === 'fitrah'
      ? 'Zakat Fitrah'
      : transaction.jenis_zakat === 'maal'
      ? 'Zakat Maal'
      : 'Infaq';

  return (
    <div className="min-h-screen bg-gray-100 py-8 print:bg-white print:py-0">
      <div className="max-w-2xl mx-auto px-4">
        {/* Print Button */}
        <div className="mb-4 print:hidden">
          <PrintButton />
        </div>

        {/* Invoice Card */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden print:shadow-none print:rounded-none">
          {/* Header */}
          <div className="bg-[#599E6E] text-white p-6 print:bg-white print:text-black print:border-b-2 print:border-[#599E6E]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center print:border print:border-gray-300">
                  <Image
                    src="/logo_alhikmah.png"
                    alt="Logo Al-Hikmah"
                    width={48}
                    height={48}
                    className="object-contain"
                  />
                </div>
                <div>
                  <h1 className="text-xl font-bold">Musholla Al-Hikmah</h1>
                  <p className="text-white/80 text-sm print:text-gray-600">
                    Portal Zakat Online
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-white/80 text-sm print:text-gray-600">Invoice</p>
                <p className="font-mono font-bold">{transaction.kode_transaksi}</p>
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div className="px-6 py-3 bg-green-50 border-b flex items-center justify-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full"></span>
            <span className="text-green-700 font-medium text-sm">TERVERIFIKASI</span>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Transaction Info */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Tanggal Transaksi</span>
                <p className="font-medium">{formatTanggal(transaction.created_at)}</p>
              </div>
              <div>
                <span className="text-gray-500">Tanggal Verifikasi</span>
                <p className="font-medium">
                  {transaction.confirmed_at
                    ? formatTanggal(transaction.confirmed_at)
                    : '-'}
                </p>
              </div>
              <div>
                <span className="text-gray-500">Tahun Hijriah</span>
                <p className="font-medium">{transaction.tahun_hijriah} H</p>
              </div>
              <div>
                <span className="text-gray-500">Tahun Masehi</span>
                <p className="font-medium">{transaction.tahun_masehi} M</p>
              </div>
            </div>

            {/* Muzakki Info */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Data Muzakki</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Nama</span>
                  <p className="font-medium">{transaction.nama_muzakki}</p>
                </div>
                <div>
                  <span className="text-gray-500">No. WhatsApp</span>
                  <p className="font-medium">{transaction.no_whatsapp}</p>
                </div>
              </div>
            </div>

            {/* Zakat Details */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Detail {jenisZakat}</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Jenis</span>
                  <span className="font-medium">{jenisZakat}</span>
                </div>
                {transaction.jenis_zakat === 'fitrah' && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Jumlah Jiwa</span>
                      <span className="font-medium">{transaction.jumlah_jiwa} jiwa</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Nominal per Jiwa</span>
                      <span className="font-medium">
                        {formatRupiah(transaction.nominal_per_jiwa || 0)}
                      </span>
                    </div>
                    {transaction.daftar_nama && transaction.daftar_nama.length > 0 && (
                      <div className="pt-2">
                        <span className="text-gray-500">Daftar Nama:</span>
                        <ol className="mt-1 ml-4 list-decimal text-gray-700">
                          {transaction.daftar_nama.map((nama, i) => (
                            <li key={i}>{nama}</li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Rincian Pembayaran</h3>
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
                <div className="flex justify-between font-bold text-lg pt-2 border-t border-dashed">
                  <span>Total</span>
                  <span className="text-[#599E6E]">{formatRupiah(transaction.total_bayar)}</span>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="border-t pt-4">
              <h3 className="font-semibold text-gray-900 mb-3">Metode Pembayaran</h3>
              <div className="text-sm space-y-1">
                <p>
                  <span className="text-gray-500">Via:</span>{' '}
                  <span className="font-medium capitalize">{transaction.metode_bayar}</span>
                </p>
                {transaction.metode_bayar === 'transfer' && (
                  <p>
                    <span className="text-gray-500">Bank:</span>{' '}
                    <span className="font-medium">
                      {BANK_INFO.nama_bank} - {BANK_INFO.nomor_rekening} a.n. {BANK_INFO.atas_nama}
                    </span>
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 px-6 py-4 text-center text-sm text-gray-500 border-t">
            <p className="mb-1">
              Jazakumullahu khairan. Semoga Allah SWT menerima zakat dan amal ibadah Anda.
            </p>
            <p className="text-xs">
              Invoice ini dibuat secara otomatis pada {formatWaktuJakarta(transaction.invoice_generated_at)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
