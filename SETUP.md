# Setup Portal Zakat Musholla Al-Hikmah

## Prasyarat

- Node.js 18+ (disarankan 20 atau 22)
- Akun Supabase (gratis di https://supabase.com)
- Akun Vercel (gratis di https://vercel.com) untuk deployment
- Domain di Cloudflare (musholla-alhikmah.org)

## Langkah Setup

### 1. Setup Supabase

1. Buat project baru di [Supabase Dashboard](https://supabase.com/dashboard)
2. Buka **SQL Editor** dan jalankan script dari `supabase/schema.sql`
3. Buka **Settings > API** dan copy:
   - Project URL
   - anon/public key

### 2. Konfigurasi Environment

1. Copy file environment:
   ```bash
   cp .env.local.example .env.local
   ```

2. Isi dengan credentials Supabase:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
   ```

### 3. Jalankan Development Server

```bash
npm install
npm run dev
```

Buka http://localhost:3000

### 4. Enable Realtime (Opsional)

Untuk fitur real-time update, jalankan di SQL Editor Supabase:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE penerimaan;
ALTER PUBLICATION supabase_realtime ADD TABLE penyaluran;
```

### 5. Setup Storage untuk Dokumentasi

1. Buka **Storage** di Supabase Dashboard
2. Buat bucket baru bernama `dokumentasi`
3. Set sebagai **Public bucket**

### 6. Setup Authentication

1. Buka **Authentication > Providers**
2. Enable **Email** provider
3. Buat user admin:
   - Buka **Authentication > Users**
   - Klik **Add User**
   - Masukkan email dan password admin

## Deployment ke Vercel

### 1. Push ke GitHub

```bash
git add .
git commit -m "Initial commit - Portal Zakat"
git remote add origin https://github.com/username/alhikmah.git
git push -u origin main
```

### 2. Import di Vercel

1. Buka https://vercel.com/new
2. Import repository dari GitHub
3. Tambahkan Environment Variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### 3. Setup Custom Domain

1. Di Vercel, buka **Settings > Domains**
2. Tambahkan `zakat.musholla-alhikmah.org`
3. Di Cloudflare:
   - Tambahkan CNAME record:
     - Name: `zakat`
     - Target: `cname.vercel-dns.com`
   - Proxy status: DNS only (untuk SSL Vercel)

## Struktur Folder

```
alhikmah/
├── src/
│   ├── app/
│   │   ├── admin/           # Halaman admin
│   │   ├── penerimaan/      # Halaman publik penerimaan
│   │   ├── penyaluran/      # Halaman publik penyaluran
│   │   ├── dokumentasi/     # Galeri foto
│   │   ├── laporan/         # Download laporan
│   │   ├── layout.tsx       # Root layout
│   │   └── page.tsx         # Dashboard utama
│   ├── components/
│   │   ├── layout/          # Header, Footer
│   │   └── ui/              # Komponen UI
│   ├── lib/
│   │   ├── supabase.ts      # Supabase client
│   │   └── utils.ts         # Utility functions
│   └── types/
│       └── database.ts      # TypeScript types
├── supabase/
│   └── schema.sql           # Database schema
└── public/                  # Static assets
```

## Fitur

- [x] Dashboard publik dengan statistik real-time
- [x] Daftar muzakki (nama disensor)
- [x] Daftar penyaluran ke mustahik
- [x] Galeri dokumentasi
- [x] Download laporan per tahun
- [x] Admin panel
- [x] Form input penerimaan
- [x] Form input penyaluran
- [x] Upload dokumentasi
- [x] Import data dari JSON

## TODO

- [ ] Integrasi Supabase real-time
- [ ] Export laporan ke PDF
- [ ] Export laporan ke Excel
- [ ] Login admin dengan Supabase Auth
- [ ] Halaman edit/delete data
- [ ] Notifikasi real-time

## Kontak

Untuk bantuan teknis, hubungi developer.
