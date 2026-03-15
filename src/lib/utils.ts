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
