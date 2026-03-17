'use client';

import { useState, useEffect } from 'react';
import { Clock, AlertTriangle, XCircle } from 'lucide-react';
import { getTimeRemaining, isZakatOpen, formatDeadline } from '@/lib/zakat-config';

interface CountdownTimerProps {
  onExpired?: () => void;
  variant?: 'default' | 'compact';
}

export function CountdownTimer({ onExpired, variant = 'default' }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState(getTimeRemaining());
  const [isOpen, setIsOpen] = useState(isZakatOpen());

  useEffect(() => {
    const timer = setInterval(() => {
      const remaining = getTimeRemaining();
      setTimeLeft(remaining);

      if (remaining.total <= 0) {
        setIsOpen(false);
        onExpired?.();
        clearInterval(timer);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [onExpired]);

  // Jika sudah tutup
  if (!isOpen) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <div className="flex justify-center mb-3">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>
        <h3 className="text-lg font-bold text-red-800 mb-1">
          Penerimaan Zakat Telah Ditutup
        </h3>
        <p className="text-sm text-red-600">
          Periode zakat fitrah Ramadhan 1447H telah berakhir pada {formatDeadline()}
        </p>
      </div>
    );
  }

  // Warning jika tersisa < 24 jam
  const isUrgent = timeLeft.days === 0 && timeLeft.hours < 24;
  const isVeryUrgent = timeLeft.days === 0 && timeLeft.hours < 6;

  if (variant === 'compact') {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
        isVeryUrgent
          ? 'bg-red-100 text-red-700'
          : isUrgent
            ? 'bg-amber-100 text-amber-700'
            : 'bg-[#599E6E]/10 text-[#599E6E]'
      }`}>
        <Clock className="w-4 h-4" />
        <span className="font-medium">
          {timeLeft.days > 0 && `${timeLeft.days}h `}
          {String(timeLeft.hours).padStart(2, '0')}:
          {String(timeLeft.minutes).padStart(2, '0')}:
          {String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div className={`rounded-xl p-6 ${
      isVeryUrgent
        ? 'bg-red-50 border border-red-200'
        : isUrgent
          ? 'bg-amber-50 border border-amber-200'
          : 'bg-gradient-to-r from-[#599E6E]/10 to-[#599E6E]/5 border border-[#599E6E]/20'
    }`}>
      <div className="flex items-center justify-center gap-2 mb-4">
        {isUrgent ? (
          <AlertTriangle className={`w-5 h-5 ${isVeryUrgent ? 'text-red-600' : 'text-amber-600'}`} />
        ) : (
          <Clock className="w-5 h-5 text-[#599E6E]" />
        )}
        <span className={`text-sm font-medium ${
          isVeryUrgent ? 'text-red-700' : isUrgent ? 'text-amber-700' : 'text-[#599E6E]'
        }`}>
          {isVeryUrgent
            ? 'Segera Ditutup!'
            : isUrgent
              ? 'Sisa Waktu Terbatas'
              : 'Waktu Tersisa'}
        </span>
      </div>

      <div className="flex justify-center gap-3">
        {/* Days */}
        {timeLeft.days > 0 && (
          <div className="text-center">
            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${
              isVeryUrgent
                ? 'bg-red-100 text-red-700'
                : isUrgent
                  ? 'bg-amber-100 text-amber-700'
                  : 'bg-white text-gray-900 shadow-sm'
            }`}>
              {timeLeft.days}
            </div>
            <p className="text-xs text-gray-500 mt-1">Hari</p>
          </div>
        )}

        {/* Hours */}
        <div className="text-center">
          <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${
            isVeryUrgent
              ? 'bg-red-100 text-red-700'
              : isUrgent
                ? 'bg-amber-100 text-amber-700'
                : 'bg-white text-gray-900 shadow-sm'
          }`}>
            {String(timeLeft.hours).padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-500 mt-1">Jam</p>
        </div>

        <div className={`flex items-center text-2xl font-bold ${
          isVeryUrgent ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-gray-300'
        }`}>:</div>

        {/* Minutes */}
        <div className="text-center">
          <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${
            isVeryUrgent
              ? 'bg-red-100 text-red-700'
              : isUrgent
                ? 'bg-amber-100 text-amber-700'
                : 'bg-white text-gray-900 shadow-sm'
          }`}>
            {String(timeLeft.minutes).padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-500 mt-1">Menit</p>
        </div>

        <div className={`flex items-center text-2xl font-bold ${
          isVeryUrgent ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-gray-300'
        }`}>:</div>

        {/* Seconds */}
        <div className="text-center">
          <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-2xl font-bold ${
            isVeryUrgent
              ? 'bg-red-100 text-red-700 animate-pulse'
              : isUrgent
                ? 'bg-amber-100 text-amber-700'
                : 'bg-white text-gray-900 shadow-sm'
          }`}>
            {String(timeLeft.seconds).padStart(2, '0')}
          </div>
          <p className="text-xs text-gray-500 mt-1">Detik</p>
        </div>
      </div>

      <p className="text-center text-xs text-gray-500 mt-4">
        Ditutup pada {formatDeadline()}
      </p>
    </div>
  );
}

// Komponen untuk menampilkan status tutup saja
export function ZakatClosedBanner() {
  if (isZakatOpen()) return null;

  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
      <div className="flex items-center gap-3">
        <div className="flex-shrink-0">
          <XCircle className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-red-800">Penerimaan Zakat Ditutup</h3>
          <p className="text-sm text-red-600">
            Periode penerimaan zakat fitrah telah berakhir pada {formatDeadline()}
          </p>
        </div>
      </div>
    </div>
  );
}
