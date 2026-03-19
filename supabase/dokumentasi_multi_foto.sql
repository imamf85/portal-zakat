-- Migration: Dokumentasi dengan Multiple Foto
-- Menambahkan kolom foto_urls (JSONB array) untuk menyimpan banyak foto per dokumentasi

-- 1. Tambah kolom baru untuk multiple foto
ALTER TABLE dokumentasi
ADD COLUMN IF NOT EXISTS foto_urls JSONB DEFAULT '[]'::jsonb;

-- 2. Migrasi data lama: pindahkan url_foto ke foto_urls
UPDATE dokumentasi
SET foto_urls = jsonb_build_array(url_foto)
WHERE url_foto IS NOT NULL
  AND (foto_urls IS NULL OR foto_urls = '[]'::jsonb);

-- 3. (Optional) Setelah migrasi berhasil, bisa drop kolom url_foto
-- ALTER TABLE dokumentasi DROP COLUMN url_foto;

-- Note: Jalankan query ini di Supabase SQL Editor
