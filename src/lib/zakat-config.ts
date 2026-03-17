// Konfigurasi Zakat Fitrah 1447H / 2026M

// Deadline penutupan zakat: 19 Maret 2026 pukul 14:00 WIB
// WIB = UTC+7, jadi kita set ke UTC
export const ZAKAT_DEADLINE = new Date('2026-03-19T07:00:00.000Z'); // 14:00 WIB

export const ZAKAT_YEAR_HIJRI = '1447';
export const ZAKAT_YEAR_MASEHI = 2026;

export function isZakatOpen(): boolean {
  return new Date() < ZAKAT_DEADLINE;
}

export function getTimeRemaining(): {
  total: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
} {
  const now = new Date();
  const total = ZAKAT_DEADLINE.getTime() - now.getTime();

  if (total <= 0) {
    return { total: 0, days: 0, hours: 0, minutes: 0, seconds: 0 };
  }

  const seconds = Math.floor((total / 1000) % 60);
  const minutes = Math.floor((total / 1000 / 60) % 60);
  const hours = Math.floor((total / (1000 * 60 * 60)) % 24);
  const days = Math.floor(total / (1000 * 60 * 60 * 24));

  return { total, days, hours, minutes, seconds };
}

export function formatDeadline(): string {
  return '19 Maret 2026, 14:00 WIB';
}
