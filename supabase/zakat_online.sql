-- Zakat Online Schema
-- Portal Zakat Musholla Al-Hikmah

-- Create zakat_online table
CREATE TABLE zakat_online (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  kode_transaksi VARCHAR(20) UNIQUE NOT NULL,
  kode_unik INTEGER NOT NULL,
  nama_muzakki VARCHAR(255) NOT NULL,
  no_whatsapp VARCHAR(20) NOT NULL,
  jenis_zakat VARCHAR(20) NOT NULL,
  jumlah_jiwa INTEGER DEFAULT 0,
  daftar_nama TEXT[],
  nominal_per_jiwa DECIMAL(12,2),
  nominal_zakat DECIMAL(15,2) NOT NULL,
  nominal_infaq DECIMAL(12,2) DEFAULT 0,
  total_bayar DECIMAL(15,2) NOT NULL,
  metode_bayar VARCHAR(20),
  bukti_transfer_url VARCHAR(500),
  status VARCHAR(20) DEFAULT 'pending',
  catatan_admin TEXT,
  invoice_token VARCHAR(100) UNIQUE,
  invoice_generated_at TIMESTAMP,
  tahun_hijriah VARCHAR(10) DEFAULT '1447',
  tahun_masehi INTEGER DEFAULT 2026,
  created_at TIMESTAMP DEFAULT NOW(),
  confirmed_at TIMESTAMP,
  confirmed_by UUID
);

-- Indexes for faster queries
CREATE INDEX idx_zakat_online_status ON zakat_online(status);
CREATE INDEX idx_zakat_online_kode ON zakat_online(kode_transaksi);
CREATE INDEX idx_zakat_online_token ON zakat_online(invoice_token);
CREATE INDEX idx_zakat_online_tahun ON zakat_online(tahun_hijriah);
CREATE INDEX idx_zakat_online_created ON zakat_online(created_at DESC);

-- Enable Row Level Security
ALTER TABLE zakat_online ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Public can read all records
CREATE POLICY "Public read" ON zakat_online
  FOR SELECT
  USING (true);

-- Public can insert new records
CREATE POLICY "Public insert" ON zakat_online
  FOR INSERT
  WITH CHECK (true);

-- Public can update records that are pending or uploaded (for uploading bukti)
CREATE POLICY "Public update bukti" ON zakat_online
  FOR UPDATE
  USING (status IN ('pending', 'uploaded'))
  WITH CHECK (status IN ('pending', 'uploaded'));

-- Admins can update any record (for verification)
-- Note: This requires authenticated users with admin role
CREATE POLICY "Admin update all" ON zakat_online
  FOR UPDATE
  USING (auth.role() = 'authenticated')
  WITH CHECK (auth.role() = 'authenticated');

-- Create storage bucket for bukti transfer
INSERT INTO storage.buckets (id, name, public)
VALUES ('bukti-transfer', 'bukti-transfer', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow public uploads
CREATE POLICY "Public upload bukti" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'bukti-transfer');

-- Storage policy: Allow public read
CREATE POLICY "Public read bukti" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'bukti-transfer');
