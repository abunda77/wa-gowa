# WhatsApp Bulk Messenger

Aplikasi web untuk mengirim pesan WhatsApp secara massal melalui Gowa API dengan fitur-fitur canggih untuk personalisasi dan pengiriman yang efisien.

## Deskripsi Proyek

WhatsApp Bulk Messenger adalah aplikasi web yang memungkinkan pengguna mengirim pesan WhatsApp secara massal dengan dukungan spintax, personalisasi, dan integrasi CSV. Aplikasi ini dirancang untuk tim marketing, layanan pelanggan, dan bisnis yang perlu mengirim pesan yang dipersonalisasi dalam skala besar.

## Fitur Utama

- **Pengiriman Massal**: Kirim pesan yang dipersonalisasi ke beberapa penerima sekaligus
- **Dukungan Spintax**: Buat variasi pesan menggunakan sintaks `{opsi1|opsi2}` untuk menghindari deteksi spam
- **Personalisasi**: Gunakan variabel seperti `[[nama]]` untuk konten spesifik penerima
- **Import CSV**: Unggah daftar kontak dengan nama dan nomor telepon
- **Input Manual**: Tambahkan penerima secara manual untuk kampanye cepat
- **Pelacakan Progress**: Pemantauan progress pengiriman secara real-time dengan fungsi pause/resume
- **Logging Detail**: Jejak audit lengkap dari semua upaya pengiriman pesan
- **Antarmuka Wizard Multi-Langkah**: (Penerima → Pesan → API → Kirim)
- **Pratinjau Real-Time**: Pratinjau variasi spintax secara langsung
- **Testing Koneksi API**: Validasi dan pengujian koneksi API
- **Penanganan Error Komprehensif**: Logika retry dan penanganan error yang kuat
- **Laporan Pengiriman**: Laporan siap ekspor

## Teknologi Stack

### Framework & Runtime
- **Next.js 14.2.16** - Framework React dengan App Router
- **React 18** - Library UI dengan hooks dan komponen fungsional
- **TypeScript 5** - JavaScript dengan type safety dan strict mode
- **Node.js** - Environment runtime

### UI & Styling
- **Tailwind CSS 4.1.9** - Framework CSS utility-first
- **shadcn/ui** - Library komponen berbasis Radix UI primitives
- **Radix UI** - Komponen UI headless untuk aksesibilitas
- **Lucide React** - Library ikon
- **next-themes** - Dukungan tema gelap/terang
- **Geist Font** - Tipografi (varian Sans & Mono)

### State Management & Forms
- **React Hook Form 7.60.0** - Penanganan form dengan validasi
- **Zod 3.25.67** - Validasi schema
- **@hookform/resolvers** - Integrasi validasi form

### Library Utama
- **class-variance-authority** - Manajemen varian komponen
- **clsx & tailwind-merge** - Penanganan CSS class kondisional
- **date-fns** - Manipulasi tanggal
- **sonner** - Notifikasi toast

### Build System & Development
- **pnpm** - Package manager cepat dan efisien ruang disk

## Instalasi

1. **Clone repository**:
   ```bash
   git clone <repository-url>
   cd wa-gowa
   ```

2. **Install dependencies**:
   ```bash
   pnpm install
   ```

3. **Jalankan development server**:
   ```bash
   pnpm dev
   ```

   Aplikasi akan berjalan di `http://localhost:3000`

## Script Yang Tersedia

```bash
# Development
pnpm dev          # Jalankan development server (localhost:3000)

# Production
pnpm build        # Build untuk production
pnpm start        # Jalankan production server

# Code Quality
pnpm lint         # Jalankan ESLint (saat ini dinonaktifkan selama build)
```

## Struktur Proyek

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global styles dan Tailwind imports
│   ├── layout.tsx         # Root layout dengan fonts dan analytics
│   └── page.tsx           # Halaman aplikasi utama (WhatsApp Bulk Messenger)
├── components/            # Komponen React
│   ├── ui/               # Komponen shadcn/ui (folder tertutup)
│   ├── api-config.tsx    # Form konfigurasi API
│   ├── bulk-sender.tsx   # Interface pengiriman massal
│   ├── csv-upload.tsx    # Upload dan parsing file CSV
│   ├── manual-input.tsx  # Input penerima manual
│   ├── message-composer.tsx # Editor pesan dengan dukungan spintax
│   ├── spintax-preview.tsx  # Pratinjau spintax real-time
│   └── theme-provider.tsx   # Provider konteks tema
├── hooks/                # Custom React hooks
│   ├── use-mobile.ts     # Deteksi perangkat mobile
│   └── use-toast.ts      # Hook notifikasi toast
├── lib/                  # Library utility dan business logic
│   ├── gowa-api.ts       # Integrasi Gowa WhatsApp API
│   ├── spintax.ts        # Engine pemrosesan spintax
│   └── utils.ts          # Fungsi utility (helper cn)
├── public/               # Static assets
│   └── placeholder-*     # Gambar dan logo placeholder
└── styles/               # Stylesheet tambahan
    └── globals.css       # Global styles legacy
```

## Pola Arsitektur

### Organisasi Komponen
- **Komponen berbasis fitur**: Setiap fitur utama memiliki file komponen sendiri
- **Komponen UI**: Primitive UI yang dapat digunakan ulang di `components/ui/`
- **Pemisahan business logic**: Panggilan API dan pemrosesan data di `lib/`
- **Custom hooks**: Logic stateful yang dapat digunakan ulang di `hooks/`

### Konvensi Penamaan File
- **kebab-case**: Semua nama file dan folder menggunakan kebab-case
- **File komponen**: Ekstensi `.tsx` untuk komponen React
- **File utility**: Ekstensi `.ts` untuk TypeScript murni
- **Nama deskriptif**: Nama file jelas menunjukkan tujuannya

### Pola Import
- **Path aliases**: Gunakan prefix `@/` untuk semua import internal
- **Absolute imports**: Lebih suka `@/components/ui/button` daripada path relatif
- **Type imports**: Gunakan keyword `type` untuk import TypeScript khusus type

### Manajemen State
- **Local state**: useState untuk state spesifik komponen
- **Prop drilling**: Pass state ke bawah melalui props komponen
- **No global state**: Aplikasi menggunakan manajemen state lokal saja

### Integrasi API
- **Logic API terpusat**: Semua panggilan Gowa API di `lib/gowa-api.ts`
- **Interface type-safe**: Typing kuat untuk semua request/response API
- **Penanganan error**: Penanganan error komprehensif dengan pesan user-friendly

### Struktur Komponen
- **Single responsibility**: Setiap komponen menangani satu fitur spesifik
- **Composition over inheritance**: Bangun UI kompleks dengan menggabungkan komponen sederhana
- **Props interface**: Interface TypeScript yang jelas untuk semua props komponen

## Konfigurasi

- `components.json` - Konfigurasi shadcn/ui
- `tsconfig.json` - Konfigurasi TypeScript dengan strict mode
- `next.config.mjs` - Konfigurasi Next.js (ESLint/TS errors diabaikan)
- `postcss.config.mjs` - Konfigurasi PostCSS untuk Tailwind
- `package.json` - Dependencies dan scripts

## Catatan Konfigurasi

- Error ESLint dan TypeScript diabaikan selama build (setup fokus development)
- Gambar tidak dioptimalkan untuk fleksibilitas deployment
- Konfigurasi TypeScript strict dengan path aliases (`@/*`)

## Penggunaan

1. **Konfigurasi API**: Masukkan kredensial Gowa API Anda
2. **Tambah Penerima**: Import dari CSV atau input manual
3. **Buat Pesan**: Gunakan spintax dan variabel personalisasi
4. **Kirim**: Pantau progress dan lihat laporan detail

## Target Pengguna

Tim marketing, departemen layanan pelanggan, dan bisnis yang perlu mengirim pesan WhatsApp yang dipersonalisasi dalam skala besar.

## Lisensi

[Masukkan lisensi yang sesuai]