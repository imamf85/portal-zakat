'use server';

// Server Actions for Zakat Online
// These run on the server and can access server-side env vars

import { supabase, supabaseAdmin, getCurrentHijriYear, getCurrentMasehiYear } from '@/lib/supabase';
import { generateInvoiceToken, formatWhatsAppNumber } from '@/lib/utils';
import type { ZakatOnline } from '@/types/zakat-online';
import { formatRupiah } from '@/lib/utils';

const WAHA_API_URL = process.env.NEXT_PUBLIC_WAHA_API_URL || '';
const WAHA_API_KEY = process.env.WAHA_API_KEY || '';
const WAHA_SESSION = process.env.NEXT_PUBLIC_WAHA_SESSION || 'default';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || '';
const ADMIN_WHATSAPP = process.env.ADMIN_WHATSAPP || ''; // Nomor WA admin untuk notifikasi

/**
 * Send WhatsApp message via Waha API (server-side)
 */
async function sendWhatsApp(phone: string, message: string): Promise<boolean> {
  if (!WAHA_API_URL) {
    console.warn('WAHA_API_URL not configured, skipping WhatsApp notification');
    return false;
  }

  try {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

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

    console.log('WhatsApp sent successfully to:', phone);
    return true;
  } catch (error) {
    console.error('Error sending WhatsApp:', error);
    return false;
  }
}

/**
 * Verify zakat online and sync to penerimaan table
 */
export async function verifyZakatOnlineAction(
  id: string,
  adminId: string
): Promise<{ success: boolean; data?: ZakatOnline; error?: string }> {
  try {
    const invoiceToken = generateInvoiceToken();
    const now = new Date().toISOString();

    // 1. Update zakat_online status
    const { data: zakatData, error: updateError } = await supabase
      .from('zakat_online')
      .update({
        status: 'verified',
        invoice_token: invoiceToken,
        invoice_generated_at: now,
        confirmed_at: now,
        confirmed_by: adminId,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error verifying zakat online:', updateError);
      return { success: false, error: `Gagal memverifikasi: ${updateError.message}` };
    }

    // 2. Insert into penerimaan table
    const penerimaanData = {
      invoice_number: zakatData.kode_transaksi,
      tanggal_transaksi: now.split('T')[0],
      nama_muzakki: zakatData.nama_muzakki,
      no_hp: zakatData.no_whatsapp,
      metode_bayar: zakatData.metode_bayar === 'transfer' ? 'Transfer' : 'Transfer', // QRIS juga via transfer
      jenis_fitrah: zakatData.jenis_zakat === 'fitrah' ? 'uang' : null,
      jumlah_jiwa: zakatData.jumlah_jiwa || 0,
      nominal_fitrah: zakatData.jenis_zakat === 'fitrah' ? zakatData.nominal_zakat : null,
      nominal_maal: zakatData.jenis_zakat === 'maal' ? zakatData.nominal_zakat : null,
      nominal_infaq: (zakatData.nominal_infaq || 0) + (zakatData.kode_unik || 0) +
                     (zakatData.jenis_zakat === 'infaq' ? zakatData.nominal_zakat : 0),
      petugas: 'Zakat Online',
      tahun_hijriah: zakatData.tahun_hijriah || getCurrentHijriYear(),
      tahun_masehi: zakatData.tahun_masehi || getCurrentMasehiYear(),
    };

    // Use supabaseAdmin to bypass RLS for server-side insert
    const { error: penerimaanError } = await supabaseAdmin
      .from('penerimaan')
      .insert(penerimaanData);

    if (penerimaanError) {
      console.error('Error inserting penerimaan:', penerimaanError);
      // Return error so user knows data didn't sync
      return {
        success: true,
        data: zakatData,
        error: `Verifikasi berhasil, tapi gagal sinkronisasi ke penerimaan: ${penerimaanError.message}`
      };
    }

    // 3. Send WhatsApp to user
    const invoiceUrl = `${BASE_URL}/zakat-online/invoice/${invoiceToken}`;
    const jenisZakat = zakatData.jenis_zakat === 'fitrah'
      ? 'Zakat Fitrah'
      : zakatData.jenis_zakat === 'maal'
      ? 'Zakat Maal'
      : 'Infaq';

    let userMessage = `*Assalamu'alaikum Wr. Wb.*\n\n`;
    userMessage += `Pembayaran ${jenisZakat} Anda telah *TERVERIFIKASI*.\n\n`;
    userMessage += `*Detail Transaksi:*\n`;
    userMessage += `Kode: ${zakatData.kode_transaksi}\n`;
    userMessage += `Nama: ${zakatData.nama_muzakki}\n`;
    userMessage += `Jenis: ${jenisZakat}\n`;
    if (zakatData.jenis_zakat === 'fitrah' && zakatData.jumlah_jiwa > 0) {
      userMessage += `Jumlah Jiwa: ${zakatData.jumlah_jiwa}\n`;
    }
    userMessage += `Total: ${formatRupiah(zakatData.total_bayar)}\n\n`;
    userMessage += `*Invoice:*\n${invoiceUrl}\n\n`;
    userMessage += `Semoga Allah SWT menerima zakat dan amal ibadah Anda.\n\n`;
    userMessage += `*Musholla Al-Hikmah*\n`;
    userMessage += `_Portal Zakat Online_`;

    const userPhone = formatWhatsAppNumber(zakatData.no_whatsapp);
    await sendWhatsApp(userPhone, userMessage);

    return { success: true, data: zakatData };
  } catch (error) {
    console.error('Error in verifyZakatOnlineAction:', error);
    return { success: false, error: 'Terjadi kesalahan' };
  }
}

/**
 * Reject zakat online
 */
export async function rejectZakatOnlineAction(
  id: string,
  adminId: string,
  catatan: string
): Promise<{ success: boolean; data?: ZakatOnline; error?: string }> {
  try {
    const now = new Date().toISOString();

    const { data: zakatData, error: updateError } = await supabase
      .from('zakat_online')
      .update({
        status: 'rejected',
        catatan_admin: catatan,
        confirmed_at: now,
        confirmed_by: adminId,
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      console.error('Error rejecting zakat online:', updateError);
      return { success: false, error: 'Gagal menolak transaksi' };
    }

    // Send WhatsApp to user
    const jenisZakat = zakatData.jenis_zakat === 'fitrah'
      ? 'Zakat Fitrah'
      : zakatData.jenis_zakat === 'maal'
      ? 'Zakat Maal'
      : 'Infaq';

    let userMessage = `*Assalamu'alaikum Wr. Wb.*\n\n`;
    userMessage += `Mohon maaf, pembayaran ${jenisZakat} Anda *BELUM DAPAT DIVERIFIKASI*.\n\n`;
    userMessage += `*Detail Transaksi:*\n`;
    userMessage += `Kode: ${zakatData.kode_transaksi}\n`;
    userMessage += `Nama: ${zakatData.nama_muzakki}\n`;
    userMessage += `Total: ${formatRupiah(zakatData.total_bayar)}\n\n`;
    userMessage += `*Catatan Admin:*\n${catatan}\n\n`;
    userMessage += `Silakan upload ulang bukti transfer yang benar di:\n`;
    userMessage += `${BASE_URL}/zakat-online/status\n\n`;
    userMessage += `Jika ada pertanyaan, silakan hubungi pengurus.\n\n`;
    userMessage += `*Musholla Al-Hikmah*\n`;
    userMessage += `_Portal Zakat Online_`;

    const userPhone = formatWhatsAppNumber(zakatData.no_whatsapp);
    await sendWhatsApp(userPhone, userMessage);

    return { success: true, data: zakatData };
  } catch (error) {
    console.error('Error in rejectZakatOnlineAction:', error);
    return { success: false, error: 'Terjadi kesalahan' };
  }
}

/**
 * Notify admin when user uploads bukti transfer
 */
export async function notifyAdminNewUpload(
  zakatData: ZakatOnline
): Promise<boolean> {
  if (!ADMIN_WHATSAPP) {
    console.warn('ADMIN_WHATSAPP not configured, skipping admin notification');
    return false;
  }

  const jenisZakat = zakatData.jenis_zakat === 'fitrah'
    ? 'Zakat Fitrah'
    : zakatData.jenis_zakat === 'maal'
    ? 'Zakat Maal'
    : 'Infaq';

  let message = `*[NOTIFIKASI ZAKAT ONLINE]*\n\n`;
  message += `Ada pembayaran baru yang perlu diverifikasi:\n\n`;
  message += `Kode: ${zakatData.kode_transaksi}\n`;
  message += `Nama: ${zakatData.nama_muzakki}\n`;
  message += `Jenis: ${jenisZakat}\n`;
  message += `Total: ${formatRupiah(zakatData.total_bayar)}\n\n`;
  message += `Verifikasi di:\n`;
  message += `${BASE_URL}/admin/zakat-online/${zakatData.id}`;

  const adminPhone = formatWhatsAppNumber(ADMIN_WHATSAPP);
  return await sendWhatsApp(adminPhone, message);
}

/**
 * Upload bukti and notify admin
 */
export async function uploadBuktiAndNotify(
  id: string,
  buktiUrl: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update status to uploaded
    const { data, error } = await supabase
      .from('zakat_online')
      .update({
        bukti_transfer_url: buktiUrl,
        status: 'uploaded',
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating bukti:', error);
      return { success: false, error: 'Gagal menyimpan bukti transfer' };
    }

    // Notify admin
    await notifyAdminNewUpload(data);

    return { success: true };
  } catch (error) {
    console.error('Error in uploadBuktiAndNotify:', error);
    return { success: false, error: 'Terjadi kesalahan' };
  }
}
