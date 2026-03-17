'use client';

import { useState } from 'react';
import { Copy, Check, Building2, QrCode } from 'lucide-react';
import { BANK_INFO } from '@/types/zakat-online';
import { formatRupiah } from '@/lib/utils';
import Image from 'next/image';

interface PaymentInfoProps {
  totalBayar: number;
  kodeUnik: number;
  metodeBayar: 'transfer' | 'qris';
  onMethodChange: (method: 'transfer' | 'qris') => void;
}

export function PaymentInfo({
  totalBayar,
  kodeUnik,
  metodeBayar,
  onMethodChange,
}: PaymentInfoProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const handleCopy = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Method selector */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onMethodChange('transfer')}
          className={`p-4 rounded-lg border-2 transition-colors ${metodeBayar === 'transfer'
              ? 'border-[#599E6E] bg-[#599E6E]/5'
              : 'border-gray-200 hover:border-gray-300'
            }`}
        >
          <Building2
            className={`w-6 h-6 mx-auto mb-2 ${metodeBayar === 'transfer' ? 'text-[#599E6E]' : 'text-gray-400'
              }`}
          />
          <span
            className={`text-sm font-medium ${metodeBayar === 'transfer' ? 'text-[#599E6E]' : 'text-gray-600'
              }`}
          >
            Transfer Bank
          </span>
        </button>
        <button
          type="button"
          onClick={() => onMethodChange('qris')}
          className={`p-4 rounded-lg border-2 transition-colors ${metodeBayar === 'qris'
              ? 'border-[#599E6E] bg-[#599E6E]/5'
              : 'border-gray-200 hover:border-gray-300'
            }`}
        >
          <QrCode
            className={`w-6 h-6 mx-auto mb-2 ${metodeBayar === 'qris' ? 'text-[#599E6E]' : 'text-gray-400'
              }`}
          />
          <span
            className={`text-sm font-medium ${metodeBayar === 'qris' ? 'text-[#599E6E]' : 'text-gray-600'
              }`}
          >
            QRIS
          </span>
        </button>
      </div>

      {/* Total amount */}
      <div className="bg-[#599E6E]/10 rounded-xl p-4">
        <p className="text-sm text-gray-600 mb-1">Total yang harus dibayar:</p>
        <p className="text-2xl font-bold text-[#599E6E]">
          {formatRupiah(totalBayar)}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          Termasuk kode unik Rp {kodeUnik.toLocaleString('id-ID')} (dijadikan infaq)
        </p>
      </div>

      {/* Payment details */}
      {metodeBayar === 'transfer' ? (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Bank</span>
                <span className="font-medium">{BANK_INFO.nama_bank}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">No. Rekening</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-medium">
                    {BANK_INFO.nomor_rekening}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(BANK_INFO.nomor_rekening, 'rekening')}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {copied === 'rekening' ? (
                      <Check className="w-4 h-4 text-[#599E6E]" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Atas Nama</span>
                <span className="font-medium">{BANK_INFO.atas_nama}</span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm text-gray-500">Nominal Transfer</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-[#599E6E]">
                    {formatRupiah(totalBayar)}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleCopy(totalBayar.toString(), 'nominal')}
                    className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
                  >
                    {copied === 'nominal' ? (
                      <Check className="w-4 h-4 text-[#599E6E]" />
                    ) : (
                      <Copy className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Penting:</strong> Pastikan nominal transfer sesuai dengan total
              di atas (termasuk kode unik) agar pembayaran mudah diidentifikasi.
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col items-center">
            <p className="text-sm text-gray-500 mb-3">Scan QRIS untuk membayar:</p>
            <div className="relative w-64 h-64 bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src="/qris-dkm-alhikmah.png"
                alt="QRIS DKM Al-Hikmah"
                fill
                className="object-contain p-2"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            </div>
            <p className="text-sm font-medium text-gray-700 mt-3">
              MUSHOLLA AL HIKMAH - Niaga
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-sm text-amber-800">
              <strong>Penting:</strong> Masukkan nominal {formatRupiah(totalBayar)}{' '}
              saat pembayaran QRIS.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
