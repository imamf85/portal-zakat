-- =============================================
-- PORTAL ZAKAT MUSHOLLA AL-HIKMAH
-- Database Schema untuk Supabase
-- =============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- TABEL PENERIMAAN ZAKAT
-- Menyimpan data zakat dari muzakki
-- =============================================
CREATE TABLE IF NOT EXISTS penerimaan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number VARCHAR(50),
  tanggal_transaksi DATE NOT NULL,
  nama_muzakki VARCHAR(255) NOT NULL,
  no_hp VARCHAR(20),
  metode_bayar VARCHAR(20) DEFAULT 'Cash',

  -- Zakat Fitrah
  jenis_fitrah VARCHAR(10),          -- 'uang', 'beras', atau NULL
  jumlah_jiwa INTEGER DEFAULT 0,
  nominal_fitrah DECIMAL(12,2),       -- Rp untuk uang, Kg untuk beras

  -- Zakat Maal
  nominal_maal DECIMAL(15,2),

  -- Infaq
  nominal_infaq DECIMAL(12,2),

  petugas VARCHAR(100),
  tahun_hijriah VARCHAR(10) DEFAULT '1447',
  tahun_masehi INTEGER DEFAULT 2026,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index untuk query yang sering digunakan
CREATE INDEX idx_penerimaan_tahun ON penerimaan(tahun_hijriah);
CREATE INDEX idx_penerimaan_tanggal ON penerimaan(tanggal_transaksi);
CREATE INDEX idx_penerimaan_jenis ON penerimaan(jenis_fitrah);

-- =============================================
-- TABEL PENYALURAN ZAKAT
-- Menyimpan data distribusi ke mustahik
-- =============================================
CREATE TABLE IF NOT EXISTS penyaluran (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tanggal_penyaluran DATE NOT NULL,
  nama_mustahik VARCHAR(255) NOT NULL,
  alamat TEXT,
  no_hp VARCHAR(20),
  kategori VARCHAR(50) NOT NULL,      -- 'Fakir/Miskin', 'Amil', 'Fisabilillah'
  nominal_uang DECIMAL(12,2),
  jumlah_beras_kg DECIMAL(6,2),
  keterangan TEXT,
  tahun_hijriah VARCHAR(10) DEFAULT '1447',
  tahun_masehi INTEGER DEFAULT 2026,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index
CREATE INDEX idx_penyaluran_tahun ON penyaluran(tahun_hijriah);
CREATE INDEX idx_penyaluran_kategori ON penyaluran(kategori);

-- =============================================
-- TABEL DOKUMENTASI
-- Menyimpan foto kegiatan
-- =============================================
CREATE TABLE IF NOT EXISTS dokumentasi (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  judul VARCHAR(255) NOT NULL,
  deskripsi TEXT,
  url_foto VARCHAR(500) NOT NULL,
  tahun_hijriah VARCHAR(10) DEFAULT '1447',
  tahun_masehi INTEGER DEFAULT 2026,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- TABEL REKAP TAHUNAN
-- Menyimpan rekapitulasi per tahun untuk perbandingan
-- =============================================
CREATE TABLE IF NOT EXISTS rekap_tahunan (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tahun_hijriah VARCHAR(10) NOT NULL UNIQUE,
  tahun_masehi INTEGER NOT NULL,
  total_zakat_uang DECIMAL(15,2) DEFAULT 0,
  total_zakat_beras_kg DECIMAL(10,2) DEFAULT 0,
  total_zakat_maal DECIMAL(15,2) DEFAULT 0,
  total_infaq DECIMAL(15,2) DEFAULT 0,
  total_muzakki INTEGER DEFAULT 0,
  total_jiwa INTEGER DEFAULT 0,
  total_penyaluran_uang DECIMAL(15,2) DEFAULT 0,
  total_penyaluran_beras_kg DECIMAL(10,2) DEFAULT 0,
  total_mustahik INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert data historis tahun lalu
INSERT INTO rekap_tahunan (tahun_hijriah, tahun_masehi, total_zakat_uang, total_zakat_beras_kg, total_zakat_maal, total_infaq, total_muzakki, total_jiwa, total_penyaluran_uang, total_penyaluran_beras_kg, total_mustahik)
VALUES ('1446', 2025, 10000000, 280, 3000000, 1200000, 65, 220, 8500000, 250, 60)
ON CONFLICT (tahun_hijriah) DO NOTHING;

-- =============================================
-- ROW LEVEL SECURITY (RLS)
-- =============================================

-- Enable RLS
ALTER TABLE penerimaan ENABLE ROW LEVEL SECURITY;
ALTER TABLE penyaluran ENABLE ROW LEVEL SECURITY;
ALTER TABLE dokumentasi ENABLE ROW LEVEL SECURITY;
ALTER TABLE rekap_tahunan ENABLE ROW LEVEL SECURITY;

-- Policy: Semua bisa baca (publik)
CREATE POLICY "Allow public read penerimaan" ON penerimaan FOR SELECT USING (true);
CREATE POLICY "Allow public read penyaluran" ON penyaluran FOR SELECT USING (true);
CREATE POLICY "Allow public read dokumentasi" ON dokumentasi FOR SELECT USING (true);
CREATE POLICY "Allow public read rekap_tahunan" ON rekap_tahunan FOR SELECT USING (true);

-- Policy: Hanya authenticated user bisa insert/update/delete
CREATE POLICY "Allow auth insert penerimaan" ON penerimaan FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update penerimaan" ON penerimaan FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth delete penerimaan" ON penerimaan FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow auth insert penyaluran" ON penyaluran FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update penyaluran" ON penyaluran FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth delete penyaluran" ON penyaluran FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow auth insert dokumentasi" ON dokumentasi FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Allow auth update dokumentasi" ON dokumentasi FOR UPDATE USING (auth.role() = 'authenticated');
CREATE POLICY "Allow auth delete dokumentasi" ON dokumentasi FOR DELETE USING (auth.role() = 'authenticated');

-- =============================================
-- VIEWS untuk statistik
-- =============================================

-- View statistik penerimaan per tahun
CREATE OR REPLACE VIEW v_statistik_penerimaan AS
SELECT
  tahun_hijriah,
  tahun_masehi,
  COUNT(*) as total_muzakki,
  SUM(jumlah_jiwa) as total_jiwa,
  SUM(CASE WHEN jenis_fitrah = 'uang' THEN nominal_fitrah ELSE 0 END) as total_zakat_uang,
  SUM(CASE WHEN jenis_fitrah = 'beras' THEN nominal_fitrah ELSE 0 END) as total_zakat_beras,
  SUM(COALESCE(nominal_maal, 0)) as total_zakat_maal,
  SUM(COALESCE(nominal_infaq, 0)) as total_infaq
FROM penerimaan
GROUP BY tahun_hijriah, tahun_masehi;

-- View statistik penyaluran per tahun
CREATE OR REPLACE VIEW v_statistik_penyaluran AS
SELECT
  tahun_hijriah,
  tahun_masehi,
  COUNT(*) as total_mustahik,
  SUM(COALESCE(nominal_uang, 0)) as total_penyaluran_uang,
  SUM(COALESCE(jumlah_beras_kg, 0)) as total_penyaluran_beras,
  COUNT(CASE WHEN kategori = 'Fakir/Miskin' THEN 1 END) as jumlah_fakir_miskin,
  COUNT(CASE WHEN kategori = 'Amil' THEN 1 END) as jumlah_amil,
  COUNT(CASE WHEN kategori = 'Fisabilillah' THEN 1 END) as jumlah_fisabilillah
FROM penyaluran
GROUP BY tahun_hijriah, tahun_masehi;

-- =============================================
-- FUNCTIONS
-- =============================================

-- Function untuk update timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-update timestamp
CREATE TRIGGER trigger_penerimaan_updated_at
  BEFORE UPDATE ON penerimaan
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trigger_penyaluran_updated_at
  BEFORE UPDATE ON penyaluran
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- =============================================
-- REALTIME
-- Enable realtime untuk tabel yang perlu live update
-- =============================================
-- Jalankan ini di Supabase Dashboard > Database > Replication
-- atau gunakan SQL:
-- ALTER PUBLICATION supabase_realtime ADD TABLE penerimaan;
-- ALTER PUBLICATION supabase_realtime ADD TABLE penyaluran;
