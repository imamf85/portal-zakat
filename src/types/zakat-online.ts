// Zakat Online Types
// Portal Zakat Musholla Al-Hikmah

export type JenisZakat = 'fitrah' | 'maal' | 'infaq';
export type MetodeBayar = 'transfer' | 'qris';
export type StatusZakat = 'pending' | 'uploaded' | 'verified' | 'rejected';

export interface ZakatOnline {
  id: string;
  kode_transaksi: string;
  kode_unik: number;
  nama_muzakki: string;
  no_whatsapp: string;
  jenis_zakat: JenisZakat;
  jumlah_jiwa: number;
  daftar_nama: string[];
  nominal_per_jiwa: number | null;
  nominal_zakat: number;
  nominal_infaq: number;
  total_bayar: number;
  metode_bayar: MetodeBayar | null;
  bukti_transfer_url: string | null;
  status: StatusZakat;
  catatan_admin: string | null;
  invoice_token: string | null;
  invoice_generated_at: string | null;
  tahun_hijriah: string;
  tahun_masehi: number;
  created_at: string;
  confirmed_at: string | null;
  confirmed_by: string | null;
}

export interface ZakatFormData {
  nama_muzakki: string;
  no_whatsapp: string;
  jenis_zakat: JenisZakat;
  jumlah_jiwa: number;
  daftar_nama: string[];
  nominal_zakat: number;
  nominal_infaq: number;
  kode_unik: number;
  total_bayar: number;
  metode_bayar: MetodeBayar;
  setuju_niat: boolean;
}

export interface CreateZakatPayload {
  nama_muzakki: string;
  no_whatsapp: string;
  jenis_zakat: JenisZakat;
  jumlah_jiwa: number;
  daftar_nama: string[];
  nominal_per_jiwa: number | null;
  nominal_zakat: number;
  nominal_infaq: number;
  kode_unik: number;
  total_bayar: number;
  metode_bayar: MetodeBayar;
  kode_transaksi: string;
  tahun_hijriah: string;
  tahun_masehi: number;
}

// Niat zakat content
export const NIAT_ZAKAT = {
  fitrah_satu: {
    arab: 'نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنْ نَفْسِيْ فَرْضًا لِلّٰهِ تَعَالَى',
    latin: "Nawaitu an ukhrija zakaatal fitri 'an nafsii fardhan lillahi ta'aalaa",
    indonesia: 'Aku niat mengeluarkan zakat fitrah untuk diriku sendiri, fardhu karena Allah Ta\'ala',
  },
  fitrah_keluarga: {
    arab: 'نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ الْفِطْرِ عَنِّيْ وَعَنْ جَمِيْعِ مَا يَلْزَمُنِيْ نَفَقَاتُهُمْ شَرْعًا فَرْضًا لِلّٰهِ تَعَالَى',
    latin: "Nawaitu an ukhrija zakaatal fitri 'annii wa 'an jamii'i maa yalzamunii nafaqaatuhum syar'an fardhan lillahi ta'aalaa",
    indonesia: 'Aku niat mengeluarkan zakat fitrah untuk diriku dan semua yang wajib aku nafkahi, fardhu karena Allah Ta\'ala',
  },
  maal: {
    arab: 'نَوَيْتُ أَنْ أُخْرِجَ زَكَاةَ مَالِيْ فَرْضًا لِلّٰهِ تَعَالَى',
    latin: "Nawaitu an ukhrija zakaata maalii fardhan lillahi ta'aalaa",
    indonesia: 'Aku niat mengeluarkan zakat hartaku, fardhu karena Allah Ta\'ala',
  },
  infaq: {
    arab: 'نَوَيْتُ أَنْ أَتَصَدَّقَ لِوَجْهِ اللّٰهِ تَعَالَى',
    latin: "Nawaitu an atashoddaqa liwajhillahi ta'aalaa",
    indonesia: 'Aku niat bersedekah karena Allah Ta\'ala',
  },
};

// Constants
export const NOMINAL_FITRAH_PER_JIWA = 50000;
export const KODE_UNIK_MIN = 100;
export const KODE_UNIK_MAX = 999;

// Bank info
export const BANK_INFO = {
  nama_bank: 'CIMB Niaga',
  nomor_rekening: '762216331000',
  atas_nama: 'DKM Al Hikmah',
};
