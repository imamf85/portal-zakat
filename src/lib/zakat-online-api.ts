// Zakat Online API Functions
// Portal Zakat Musholla Al-Hikmah

import { supabase, getCurrentHijriYear, getCurrentMasehiYear } from './supabase';
import { generateKodeTransaksi, generateInvoiceToken, generateKodeUnik } from './utils';
import type {
  ZakatOnline,
  CreateZakatPayload,
  StatusZakat,
} from '@/types/zakat-online';

/**
 * Create new zakat online transaction
 */
export async function createZakatOnline(
  payload: Omit<CreateZakatPayload, 'kode_transaksi' | 'kode_unik' | 'tahun_hijriah' | 'tahun_masehi'>
): Promise<ZakatOnline | null> {
  const kode_transaksi = generateKodeTransaksi();
  const kode_unik = await getNextKodeUnik();

  const { data, error } = await supabase
    .from('zakat_online')
    .insert({
      ...payload,
      kode_transaksi,
      kode_unik,
      tahun_hijriah: getCurrentHijriYear(),
      tahun_masehi: getCurrentMasehiYear(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating zakat online:', error);
    throw error;
  }

  return data;
}

/**
 * Get zakat online by kode transaksi
 */
export async function getZakatOnlineByKode(kode: string): Promise<ZakatOnline | null> {
  const { data, error } = await supabase
    .from('zakat_online')
    .select('*')
    .eq('kode_transaksi', kode.toUpperCase())
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching zakat online by kode:', error);
    return null;
  }

  return data;
}

/**
 * Get zakat online by invoice token
 */
export async function getZakatOnlineByToken(token: string): Promise<ZakatOnline | null> {
  const { data, error } = await supabase
    .from('zakat_online')
    .select('*')
    .eq('invoice_token', token)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching zakat online by token:', error);
    return null;
  }

  return data;
}

/**
 * Get zakat online by ID
 */
export async function getZakatOnlineById(id: string): Promise<ZakatOnline | null> {
  const { data, error } = await supabase
    .from('zakat_online')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error fetching zakat online by id:', error);
    return null;
  }

  return data;
}

/**
 * Upload bukti transfer
 */
export async function uploadBuktiTransfer(
  id: string,
  file: File
): Promise<string | null> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${id}-${Date.now()}.${fileExt}`;
  const filePath = `bukti/${fileName}`;

  // Upload file to storage
  const { error: uploadError } = await supabase.storage
    .from('bukti-transfer')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading bukti transfer:', uploadError);
    throw uploadError;
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('bukti-transfer')
    .getPublicUrl(filePath);

  const publicUrl = urlData.publicUrl;

  // Update record with bukti URL and status
  const { error: updateError } = await supabase
    .from('zakat_online')
    .update({
      bukti_transfer_url: publicUrl,
      status: 'uploaded',
    })
    .eq('id', id);

  if (updateError) {
    console.error('Error updating bukti transfer URL:', updateError);
    throw updateError;
  }

  return publicUrl;
}

/**
 * Get list of zakat online transactions (admin)
 */
export async function getZakatOnlineList(
  status?: StatusZakat,
  tahun?: string
): Promise<ZakatOnline[]> {
  let query = supabase
    .from('zakat_online')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  if (tahun) {
    query = query.eq('tahun_hijriah', tahun);
  } else {
    query = query.eq('tahun_hijriah', getCurrentHijriYear());
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching zakat online list:', error);
    return [];
  }

  return data || [];
}

/**
 * Verify zakat online (admin)
 */
export async function verifyZakatOnline(
  id: string,
  adminId: string
): Promise<ZakatOnline | null> {
  const invoiceToken = generateInvoiceToken();

  const { data, error } = await supabase
    .from('zakat_online')
    .update({
      status: 'verified',
      invoice_token: invoiceToken,
      invoice_generated_at: new Date().toISOString(),
      confirmed_at: new Date().toISOString(),
      confirmed_by: adminId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error verifying zakat online:', error);
    throw error;
  }

  return data;
}

/**
 * Reject zakat online (admin)
 */
export async function rejectZakatOnline(
  id: string,
  adminId: string,
  catatan: string
): Promise<ZakatOnline | null> {
  const { data, error } = await supabase
    .from('zakat_online')
    .update({
      status: 'rejected',
      catatan_admin: catatan,
      confirmed_at: new Date().toISOString(),
      confirmed_by: adminId,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error rejecting zakat online:', error);
    throw error;
  }

  return data;
}

/**
 * Get next unique kode_unik that hasn't been used today
 */
export async function getNextKodeUnik(): Promise<number> {
  const today = new Date().toISOString().split('T')[0];

  // Get all kode_unik used today
  const { data, error } = await supabase
    .from('zakat_online')
    .select('kode_unik')
    .gte('created_at', `${today}T00:00:00`)
    .lt('created_at', `${today}T23:59:59`);

  if (error) {
    console.error('Error fetching used kode_unik:', error);
    return generateKodeUnik(); // Fallback to random
  }

  const usedKodes = new Set((data || []).map((d) => d.kode_unik));

  // Find an unused kode between 100-999
  let attempts = 0;
  let kode = generateKodeUnik();

  while (usedKodes.has(kode) && attempts < 100) {
    kode = generateKodeUnik();
    attempts++;
  }

  return kode;
}

/**
 * Get statistics for admin dashboard
 */
export async function getZakatOnlineStats(tahun?: string): Promise<{
  total: number;
  pending: number;
  uploaded: number;
  verified: number;
  rejected: number;
  totalNominal: number;
}> {
  const tahunFilter = tahun || getCurrentHijriYear();

  const { data, error } = await supabase
    .from('zakat_online')
    .select('status, total_bayar')
    .eq('tahun_hijriah', tahunFilter);

  if (error) {
    console.error('Error fetching zakat online stats:', error);
    return {
      total: 0,
      pending: 0,
      uploaded: 0,
      verified: 0,
      rejected: 0,
      totalNominal: 0,
    };
  }

  const stats = {
    total: data?.length || 0,
    pending: 0,
    uploaded: 0,
    verified: 0,
    rejected: 0,
    totalNominal: 0,
  };

  (data || []).forEach((item) => {
    if (item.status === 'pending') stats.pending++;
    if (item.status === 'uploaded') stats.uploaded++;
    if (item.status === 'verified') {
      stats.verified++;
      stats.totalNominal += item.total_bayar || 0;
    }
    if (item.status === 'rejected') stats.rejected++;
  });

  return stats;
}

/**
 * Search zakat online by name or kode
 */
export async function searchZakatOnline(
  query: string,
  tahun?: string
): Promise<ZakatOnline[]> {
  const tahunFilter = tahun || getCurrentHijriYear();

  const { data, error } = await supabase
    .from('zakat_online')
    .select('*')
    .eq('tahun_hijriah', tahunFilter)
    .or(`nama_muzakki.ilike.%${query}%,kode_transaksi.ilike.%${query}%`)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error searching zakat online:', error);
    return [];
  }

  return data || [];
}
