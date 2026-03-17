// Waha WhatsApp API Integration
// Portal Zakat Musholla Al-Hikmah

import type { ZakatOnline } from '@/types/zakat-online';
import { formatRupiah } from './utils';

const WAHA_API_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || '';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';
const WAHA_SESSION = process.env.NEXT_PUBLIC_WAHA_SESSION || 'default';

/**
 * Send WhatsApp message via Waha API
 */
export async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  if (!WAHA_API_URL) {
    console.warn('WAHA_API_URL not configured, skipping WhatsApp notification');
    return false;
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Add API Key if configured
    if (WAHA_API_KEY) {
      headers['X-Api-Key'] = WAHA_API_KEY;
    }

    const response = await fetch(`${WAHA_API_URL}/api/sendText`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        chatId: `${phone}@c.us`,
        text: message,
        session: WAHA_SESSION,
      }),
    });

    if (!response.ok) {
      const errorData = await response.text();
      console.error('Failed to send WhatsApp:', errorData);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return false;
  }
}

/**
 * Get verification success message
 */
export function getVerificationMessage(data: ZakatOnline, invoiceUrl: string): string {
  const jenisZakat = data.jenis_zakat === 'fitrah'
    ? 'Zakat Fitrah'
    : data.jenis_zakat === 'maal'
    ? 'Zakat Maal'
    : 'Infaq';

  let message = `*Assalamu'alaikum Wr. Wb.*\n\n`;
  message += `Pembayaran ${jenisZakat} Anda telah *TERVERIFIKASI*.\n\n`;
  message += `*Detail Transaksi:*\n`;
  message += `Kode: ${data.kode_transaksi}\n`;
  message += `Nama: ${data.nama_muzakki}\n`;
  message += `Jenis: ${jenisZakat}\n`;

  if (data.jenis_zakat === 'fitrah' && data.jumlah_jiwa > 0) {
    message += `Jumlah Jiwa: ${data.jumlah_jiwa}\n`;
  }

  message += `Total: ${formatRupiah(data.total_bayar)}\n\n`;

  message += `*Invoice:*\n${invoiceUrl}\n\n`;

  message += `Semoga Allah SWT menerima zakat dan amal ibadah Anda.\n\n`;
  message += `*Musholla Al-Hikmah*\n`;
  message += `_Portal Zakat Online_`;

  return message;
}

/**
 * Get rejection message
 */
export function getRejectionMessage(data: ZakatOnline, catatan: string): string {
  const jenisZakat = data.jenis_zakat === 'fitrah'
    ? 'Zakat Fitrah'
    : data.jenis_zakat === 'maal'
    ? 'Zakat Maal'
    : 'Infaq';

  let message = `*Assalamu'alaikum Wr. Wb.*\n\n`;
  message += `Mohon maaf, pembayaran ${jenisZakat} Anda *BELUM DAPAT DIVERIFIKASI*.\n\n`;
  message += `*Detail Transaksi:*\n`;
  message += `Kode: ${data.kode_transaksi}\n`;
  message += `Nama: ${data.nama_muzakki}\n`;
  message += `Total: ${formatRupiah(data.total_bayar)}\n\n`;

  message += `*Catatan Admin:*\n${catatan}\n\n`;

  message += `Silakan upload ulang bukti transfer yang benar di:\n`;
  message += `${process.env.NEXT_PUBLIC_BASE_URL || ''}/zakat-online/status\n\n`;

  message += `Jika ada pertanyaan, silakan hubungi pengurus.\n\n`;
  message += `*Musholla Al-Hikmah*\n`;
  message += `_Portal Zakat Online_`;

  return message;
}

/**
 * Get new transaction notification for admin
 */
export function getAdminNotificationMessage(data: ZakatOnline): string {
  const jenisZakat = data.jenis_zakat === 'fitrah'
    ? 'Zakat Fitrah'
    : data.jenis_zakat === 'maal'
    ? 'Zakat Maal'
    : 'Infaq';

  let message = `*[NOTIFIKASI ZAKAT ONLINE]*\n\n`;
  message += `Ada pembayaran baru yang perlu diverifikasi:\n\n`;
  message += `Kode: ${data.kode_transaksi}\n`;
  message += `Nama: ${data.nama_muzakki}\n`;
  message += `Jenis: ${jenisZakat}\n`;
  message += `Total: ${formatRupiah(data.total_bayar)}\n\n`;
  message += `Verifikasi di:\n`;
  message += `${process.env.NEXT_PUBLIC_BASE_URL || ''}/admin/zakat-online/${data.id}`;

  return message;
}
