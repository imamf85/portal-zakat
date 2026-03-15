import { supabase, getCurrentHijriYear, Penerimaan, Penyaluran, Dokumentasi, RekapTahunan, StatistikDashboard } from './supabase';

// =============================================
// PENERIMAAN (Muzakki)
// =============================================

export async function getPenerimaan(tahunHijriah?: string): Promise<Penerimaan[]> {
  const tahun = tahunHijriah || getCurrentHijriYear();

  const { data, error } = await supabase
    .from('penerimaan')
    .select('*')
    .eq('tahun_hijriah', tahun)
    .order('tanggal_transaksi', { ascending: false });

  if (error) {
    console.error('Error fetching penerimaan:', error);
    return [];
  }

  return data || [];
}

export async function createPenerimaan(penerimaan: Omit<Penerimaan, 'id' | 'created_at'>): Promise<Penerimaan | null> {
  const { data, error } = await supabase
    .from('penerimaan')
    .insert(penerimaan)
    .select()
    .single();

  if (error) {
    console.error('Error creating penerimaan:', error);
    throw error;
  }

  return data;
}

// =============================================
// PENYALURAN (Mustahik)
// =============================================

export async function getPenyaluran(tahunHijriah?: string): Promise<Penyaluran[]> {
  const tahun = tahunHijriah || getCurrentHijriYear();

  const { data, error } = await supabase
    .from('penyaluran')
    .select('*')
    .eq('tahun_hijriah', tahun)
    .order('tanggal_penyaluran', { ascending: false });

  if (error) {
    console.error('Error fetching penyaluran:', error);
    return [];
  }

  return data || [];
}

export async function createPenyaluran(penyaluran: Omit<Penyaluran, 'id' | 'created_at'>): Promise<Penyaluran | null> {
  const { data, error } = await supabase
    .from('penyaluran')
    .insert(penyaluran)
    .select()
    .single();

  if (error) {
    console.error('Error creating penyaluran:', error);
    throw error;
  }

  return data;
}

// =============================================
// DOKUMENTASI
// =============================================

export async function getDokumentasi(tahunHijriah?: string): Promise<Dokumentasi[]> {
  let query = supabase
    .from('dokumentasi')
    .select('*')
    .order('created_at', { ascending: false });

  if (tahunHijriah) {
    query = query.eq('tahun_hijriah', tahunHijriah);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching dokumentasi:', error);
    return [];
  }

  return data || [];
}

// =============================================
// REKAP TAHUNAN
// =============================================

export async function getRekapTahunan(tahunHijriah: string): Promise<RekapTahunan | null> {
  const { data, error } = await supabase
    .from('rekap_tahunan')
    .select('*')
    .eq('tahun_hijriah', tahunHijriah)
    .single();

  if (error) {
    if (error.code !== 'PGRST116') { // Not found is ok
      console.error('Error fetching rekap_tahunan:', error);
    }
    return null;
  }

  return data;
}

// =============================================
// STATISTIK DASHBOARD
// =============================================

export async function getStatistikDashboard(): Promise<StatistikDashboard> {
  const tahunIni = getCurrentHijriYear();
  const tahunLaluHijriah = String(parseInt(tahunIni) - 1);

  // Fetch penerimaan tahun ini
  const penerimaan = await getPenerimaan(tahunIni);

  // Fetch penyaluran tahun ini
  const penyaluran = await getPenyaluran(tahunIni);

  // Fetch rekap tahun lalu
  const tahunLalu = await getRekapTahunan(tahunLaluHijriah);

  // Hitung statistik penerimaan
  const totalMuzakki = penerimaan.length;
  const totalJiwa = penerimaan.reduce((acc, p) => acc + (p.jumlah_jiwa || 0), 0);
  const zakatUang = penerimaan
    .filter(p => p.jenis_fitrah === 'uang')
    .reduce((acc, p) => acc + (p.nominal_fitrah || 0), 0);
  const zakatBeras = penerimaan
    .filter(p => p.jenis_fitrah === 'beras')
    .reduce((acc, p) => acc + (p.nominal_fitrah || 0), 0);
  const zakatMaal = penerimaan.reduce((acc, p) => acc + (p.nominal_maal || 0), 0);
  const infaq = penerimaan.reduce((acc, p) => acc + (p.nominal_infaq || 0), 0);

  // Hitung statistik penyaluran
  const totalMustahik = penyaluran.length;
  const penyaluranUang = penyaluran.reduce((acc, p) => acc + (p.nominal_uang || 0), 0);
  const penyaluranBeras = penyaluran.reduce((acc, p) => acc + (p.jumlah_beras_kg || 0), 0);

  return {
    penerimaan: {
      totalMuzakki,
      totalJiwa,
      zakatUang,
      zakatBeras,
      zakatMaal,
      infaq,
    },
    penyaluran: {
      totalMustahik,
      uang: penyaluranUang,
      beras: penyaluranBeras,
    },
    tahunLalu,
  };
}

// =============================================
// STATISTIK PER KATEGORI MUSTAHIK
// =============================================

export async function getStatistikKategori(tahunHijriah?: string) {
  const penyaluran = await getPenyaluran(tahunHijriah);

  const kategoris = ['Fakir/Miskin', 'Amil', 'Fisabilillah'];

  return kategoris.map(kategori => {
    const filtered = penyaluran.filter(p => p.kategori === kategori);
    return {
      nama: kategori,
      jumlah: filtered.length,
      totalUang: filtered.reduce((acc, p) => acc + (p.nominal_uang || 0), 0),
      totalBeras: filtered.reduce((acc, p) => acc + (p.jumlah_beras_kg || 0), 0),
    };
  });
}
