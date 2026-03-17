import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

// Public client (anon key) - for client-side and public operations
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Admin client (service role key) - for server-side operations that bypass RLS
// Only use this in Server Actions or API routes!
export const supabaseAdmin = supabaseServiceKey
  ? createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : supabase; // Fallback to public client if service key not configured

// Helper untuk mendapatkan tahun Hijriah saat ini
export function getCurrentHijriYear(): string {
  return '1447';
}

export function getCurrentMasehiYear(): number {
  return 2026;
}

// Types
export interface Penerimaan {
  id: string;
  invoice_number: string | null;
  tanggal_transaksi: string;
  nama_muzakki: string;
  no_hp: string | null;
  metode_bayar: string;
  jenis_fitrah: 'uang' | 'beras' | null;
  jumlah_jiwa: number;
  nominal_fitrah: number | null;
  nominal_maal: number | null;
  nominal_infaq: number | null;
  petugas: string | null;
  tahun_hijriah: string;
  tahun_masehi: number;
  created_at: string;
}

export interface Penyaluran {
  id: string;
  tanggal_penyaluran: string;
  nama_mustahik: string;
  alamat: string | null;
  no_hp: string | null;
  kategori: string;
  nominal_uang: number | null;
  jumlah_beras_kg: number | null;
  keterangan: string | null;
  tahun_hijriah: string;
  tahun_masehi: number;
  created_at: string;
}

export interface Dokumentasi {
  id: string;
  judul: string;
  deskripsi: string | null;
  url_foto: string;
  tahun_hijriah: string;
  tahun_masehi: number;
  created_at: string;
}

export interface RekapTahunan {
  id: string;
  tahun_hijriah: string;
  tahun_masehi: number;
  total_zakat_uang: number;
  total_zakat_beras_kg: number;
  total_zakat_maal: number;
  total_infaq: number;
  total_muzakki: number;
  total_jiwa: number;
  total_penyaluran_uang: number;
  total_penyaluran_beras_kg: number;
  total_mustahik: number;
}

export interface StatistikDashboard {
  penerimaan: {
    totalMuzakki: number;
    totalJiwa: number;
    zakatUang: number;
    zakatBeras: number;
    zakatMaal: number;
    infaq: number;
  };
  penyaluran: {
    totalMustahik: number;
    uang: number;
    beras: number;
  };
  tahunLalu: RekapTahunan | null;
  lastUpdate: string | null;
}
