// Utility functions untuk Portal Zakat

/**
 * Format angka ke format Rupiah
 */
export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format angka ke format Kg
 */
export function formatKg(amount: number): string {
  return `${amount.toLocaleString('id-ID')} Kg`;
}

/**
 * Sensor nama untuk tampilan publik
 * "Ucup Nurin" -> "Uc** Nu***"
 */
export function sensorNama(nama: string): string {
  const parts = nama.split(' ');
  return parts.map(part => {
    if (part.length <= 2) return part;
    const visible = part.substring(0, 2);
    const hidden = '*'.repeat(part.length - 2);
    return visible + hidden;
  }).join(' ');
}

/**
 * Format tanggal ke format Indonesia
 */
export function formatTanggal(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * Format tanggal singkat
 */
export function formatTanggalSingkat(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Hitung persentase perubahan
 */
export function hitungPersentase(nilaiLama: number, nilaiBaru: number): number {
  if (nilaiLama === 0) return nilaiBaru > 0 ? 100 : 0;
  return Math.round(((nilaiBaru - nilaiLama) / nilaiLama) * 100);
}

/**
 * Generate invoice number
 * Format: INV-{seq}-{date}
 */
export function generateInvoiceNumber(sequence: number, date: Date): string {
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  return `INV-${String(sequence).padStart(2, '0')}-${dateStr}`;
}

/**
 * Parse nominal dari string (handle format dengan koma)
 */
export function parseNominal(value: string): number {
  // Remove currency symbols, spaces, and handle both . and , as decimal/thousand separator
  const cleaned = value.replace(/[Rp\s]/g, '').replace(/,/g, '');
  return parseFloat(cleaned) || 0;
}

/**
 * Validasi nomor HP Indonesia
 */
export function formatNoHp(noHp: string | number | null): string {
  if (!noHp) return '-';
  const str = String(noHp).replace(/\D/g, '');
  if (str.startsWith('62')) {
    return '+' + str;
  }
  if (str.startsWith('0')) {
    return '+62' + str.substring(1);
  }
  return str;
}

/**
 * Format tanggal dan waktu ke timezone Asia/Jakarta
 */
export function formatWaktuJakarta(dateString: string | null): string {
  if (!dateString) return '-';

  const date = new Date(dateString);

  return date.toLocaleString('id-ID', {
    timeZone: 'Asia/Jakarta',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }) + ' WIB';
}

/**
 * Generate kode transaksi untuk zakat online
 * Format: ZKT-YYYYMMDD-XXXX (4 karakter random alphanumeric)
 */
export function generateKodeTransaksi(): string {
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0].replace(/-/g, '');
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars: 0, O, I, 1
  let random = '';
  for (let i = 0; i < 4; i++) {
    random += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `ZKT-${dateStr}-${random}`;
}

/**
 * Generate invoice token (32 karakter alphanumeric)
 */
export function generateInvoiceToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Format nomor WhatsApp ke format internasional (628xxx)
 */
export function formatWhatsAppNumber(phone: string): string {
  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, '');

  // Convert 08xxx to 628xxx
  if (cleaned.startsWith('0')) {
    return '62' + cleaned.substring(1);
  }

  // Already in 62xxx format
  if (cleaned.startsWith('62')) {
    return cleaned;
  }

  // Assume Indonesian number without prefix
  return '62' + cleaned;
}

/**
 * Validate Indonesian WhatsApp number
 */
export function isValidWhatsApp(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');

  // Check if starts with 08 or 628 and has proper length (10-13 digits for 08xxx, 11-14 for 628xxx)
  if (cleaned.startsWith('08')) {
    return cleaned.length >= 10 && cleaned.length <= 13;
  }
  if (cleaned.startsWith('628')) {
    return cleaned.length >= 11 && cleaned.length <= 14;
  }

  return false;
}

/**
 * Generate random kode unik (100-999)
 */
export function generateKodeUnik(): number {
  return Math.floor(Math.random() * 900) + 100; // 100-999
}

/**
 * Get current Hijri year (approximate)
 */
export function getCurrentHijriYear(): string {
  return '1447'; // Current Hijri year for Ramadan 2026
}
