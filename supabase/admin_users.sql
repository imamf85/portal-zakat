-- Tabel untuk daftar admin yang diizinkan
CREATE TABLE IF NOT EXISTS admin_users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  nama TEXT,
  role TEXT DEFAULT 'admin',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE admin_users ENABLE ROW LEVEL SECURITY;

-- Policy: Semua orang bisa baca (untuk cek apakah email terdaftar)
CREATE POLICY "Allow read for authenticated users"
  ON admin_users FOR SELECT
  TO authenticated
  USING (true);

-- Policy: Hanya admin yang bisa insert/update/delete
CREATE POLICY "Allow all for admins"
  ON admin_users FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE email = auth.jwt() ->> 'email'
    )
  );

-- Insert admin pertama (GANTI dengan email Anda)
-- INSERT INTO admin_users (email, nama, role) VALUES
--   ('your-email@gmail.com', 'Nama Admin', 'superadmin');

-- Contoh query untuk menambah admin:
-- INSERT INTO admin_users (email, nama) VALUES ('admin@example.com', 'Nama Admin');
