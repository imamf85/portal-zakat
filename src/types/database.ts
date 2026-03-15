// Types untuk Portal Zakat Musholla Al-Hikmah

export type JenisFitrah = 'uang' | 'beras' | null;
export type KategoriMustahik = 'Fakir/Miskin' | 'Amil' | 'Fisabilillah';
export type MetodeBayar = 'Cash' | 'Transfer';

export interface Penerimaan {
  id: string;
  invoice_number: string | null;
  tanggal_transaksi: string;
  nama_muzakki: string;
  no_hp: string | null;
  metode_bayar: MetodeBayar;

  // Zakat Fitrah
  jenis_fitrah: JenisFitrah;
  jumlah_jiwa: number;
  nominal_fitrah: number | null;

  // Zakat Maal
  nominal_maal: number | null;

  // Infaq
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
  kategori: KategoriMustahik;
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

// Statistik untuk dashboard
export interface StatistikZakat {
  totalZakatUang: number;
  totalZakatBeras: number;
  totalZakatMaal: number;
  totalInfaq: number;
  totalMuzakki: number;
  totalJiwa: number;
  totalPenyaluranUang: number;
  totalPenyaluranBeras: number;
  totalMustahik: number;
}

export interface PerbandinganTahunan {
  tahunIni: StatistikZakat;
  tahunLalu: StatistikZakat;
  persentaseZakatUang: number;
  persentaseZakatBeras: number;
  persentaseMuzakki: number;
}

// Form input types
export interface PenerimaanFormData {
  tanggal_transaksi: string;
  nama_muzakki: string;
  no_hp?: string;
  metode_bayar: MetodeBayar;
  jenis_fitrah?: JenisFitrah;
  jumlah_jiwa: number;
  nominal_fitrah?: number;
  nominal_maal?: number;
  nominal_infaq?: number;
  petugas?: string;
}

export interface PenyaluranFormData {
  tanggal_penyaluran: string;
  nama_mustahik: string;
  alamat?: string;
  no_hp?: string;
  kategori: KategoriMustahik;
  nominal_uang?: number;
  jumlah_beras_kg?: number;
  keterangan?: string;
}
