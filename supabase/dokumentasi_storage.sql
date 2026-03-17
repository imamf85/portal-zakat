-- Dokumentasi Storage Setup
-- Portal Zakat Musholla Al-Hikmah

-- Create storage bucket for dokumentasi
INSERT INTO storage.buckets (id, name, public)
VALUES ('dokumentasi', 'dokumentasi', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy: Allow public read
CREATE POLICY "Public read dokumentasi" ON storage.objects
  FOR SELECT
  USING (bucket_id = 'dokumentasi');

-- Storage policy: Allow authenticated upload
CREATE POLICY "Authenticated upload dokumentasi" ON storage.objects
  FOR INSERT
  WITH CHECK (bucket_id = 'dokumentasi' AND auth.role() = 'authenticated');

-- Storage policy: Allow authenticated delete
CREATE POLICY "Authenticated delete dokumentasi" ON storage.objects
  FOR DELETE
  USING (bucket_id = 'dokumentasi' AND auth.role() = 'authenticated');
