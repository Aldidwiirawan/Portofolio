# 📌 RINGKASAN PROYEK PORTOFOLIO & ADMIN CMS

> **Dokumen ini dibuat sebagai konteks lengkap (Context Handover)** untuk melanjutkan pengembangan proyek dengan AI Agent / Gemini Pro. Dokumen ini merangkum seluruh arsitektur, fitur yang sudah selesai, skema database, aturan keamanan, serta langkah berikutnya.

---

## 1. Ringkasan Eksekutif & Tech Stack

Proyek ini adalah **Website Portofolio Pribadi + Admin CMS** untuk **Aldi Dwi Irawan**.
- **Frontend**: React 19 + Vite
- **Styling**: Vanilla CSS (CSS Variables, Desain Modern, Glassmorphism, Responsive Mobile-first)
- **Routing**: `react-router-dom` v7
- **Backend / BaaS**: Supabase (PostgreSQL, Supabase Auth, Supabase Storage, Row Level Security / RLS)
- **Linting & Build**: `oxlint` (0 errors, 0 warnings), `vite build` (Clean production bundle)

---

## 2. Struktur Rute & Arsitektur Halaman

Aplikasi menggunakan arsitektur pemisahan antara area publik dan area admin yang diproteksi:

### A. Public Portfolio (`/`)
- **Single Page Application (SPA)** dengan navigasi anchor scroll yang mulus:
  - `#hero` (Headline, Status badge, CTA)
  - `#about` (Profil singkat, bio, detail kontak)
  - `#skills` (Daftar keahlian teknis terorganisir per kategori)
  - `#projects` (Daftar proyek portofolio publik)
  - `#experience` (Riwayat pengalaman / kerja)
  - `#education` (Riwayat pendidikan)
  - `#contact` (Form kontak pengiriman pesan)
  - `Footer` (Hak cipta dan tautan sosial media)
- **Keamanan Publik**: Tidak ada tombol atau link admin yang ditampilkan di UI publik (*Hidden Admin Entry*). Akses admin hanya melalui URL manual `/admin`.

### B. Admin Area (`/admin/*`)
- **`/admin/login`** (`AdminLoginPage.jsx`):
  - Form login menggunakan Supabase Auth (Email + Password).
  - Validasi kredensial dan penanganan error responsif.
  - Jika sudah login dan terverifikasi admin, otomatis redirect ke `/admin`.
- **`AdminRoute.jsx`** (Proteksi Rute Admin 2 Lapis):
  - **Lapis 1**: Memeriksa sesi aktif Supabase Auth via `supabase.auth.getUser()`.
  - **Lapis 2**: Memverifikasi `auth.uid()` terdaftar di tabel `public.profiles` (`verifyIsAdmin(userId)`). Jika user login tapi bukan admin/owner, akses ditolak.
- **`/admin`** (`AdminDashboardPage.jsx`):
  - Dashboard CMS ringkasan modul portofolio.
  - Modul: Profile, Projects, Skills, Experiences, Educations, Messages.
  - Tombol / Card "Projects" dapat diklik dan mengarah ke `/admin/projects`.
- **`/admin/projects`** (`AdminProjectsPage.jsx`):
  - Manajemen portofolio proyek (READ, CREATE, UPDATE selesai).

---

## 3. Modul Projects (`public.projects`) yang Sudah Selesai

### A. READ Projects
- Custom Hook: `src/hooks/useProjects.js`
- Mengambil data dari tabel `public.projects` dengan query:
  - Urutan: `is_featured DESC`, `sort_order ASC`, `created_at DESC`.
- UI State: Loading (shimmer skeleton), Error state dengan tombol coba lagi, Empty state (jika database kosong), dan tombol *Segarkan Data*.

### B. CREATE Project
- Komponen: `src/components/admin/ProjectForm.jsx` (mode create)
- Kolom yang diisi: `title`, `slug` (auto-generate dengan manual override), `description`, `content`, `demo_url`, `github_url`, `tech_stack` (array `TEXT[]`), `is_featured`, `sort_order`, `thumbnail_url`.
- Validasi form client-side: judul wajib, slug regex, deskripsi wajib, format URL `http(s)://`, format angka sort_order.
- Penanganan duplikasi slug di database (Postgres error `23505`).

### C. UPDATE (EDIT) Project
- Komponen: `src/components/admin/ProjectForm.jsx` (mode edit)
- Tombol **"Edit"** pada setiap kartu proyek di `/admin/projects` membuka form dalam mode edit.
- Form otomatis terpopulasi (*pre-filled*) dengan data proyek yang dipilih.
- Mendukung perubahan seluruh field teks dan status featured.
- Header dan tombol berubah dinamis: *"Edit Project"* & *"Simpan Perubahan"*.

### D. Fitur Upload Thumbnail Image
- Menggantikan input teks URL lama dengan **Upload File Gambar**.
- **Validasi File**: Wajib MIME type `image/*`, ukuran maksimum **2 MB** (2.097.152 bytes).
- **Live Preview**: Pratinjau instan menggunakan `URL.createObjectURL(file)` dengan pembersihan memori otomatis (`URL.revokeObjectURL()`).
- **Path Storage Unik**: `projects/${crypto.randomUUID()}.${fileExt}` dengan `upsert: false`.
- **Skenario Update Thumbnail**:
  - **Skenario A (Tidak ganti thumbnail)**: Thumbnail lama tetap dipertahankan, tidak ada upload ke storage, tidak ada file yang dihapus.
  - **Skenario B (Ganti thumbnail baru)**: User memilih file baru, upload ke Storage saat form disimpan, update `thumbnail_url` di database.
  - **Best-Effort Old File Cleanup**: Setelah database berhasil di-update, thumbnail lama dihapus dari Storage (helper `extractStoragePath()`).
  - **Orphan File Cleanup**: Jika upload ke Storage berhasil tetapi database `INSERT`/`UPDATE` gagal, file baru otomatis dihapus dari Storage untuk mencegah sampah file. Error storage dicatat dan ditampilkan sebagai peringatan.

### E. DELETE Project
- Tombol **"Hapus"** pada setiap kartu proyek di `/admin/projects`.
- **Custom Confirmation Modal**: Modal dialog konfirmasi yang aman dan aksesibel (backdrop blur, tombol Batal, tombol konfirmasi hapus, penutupan via tombol Escape).
- **Penghapusan Database**: Menghapus data dari tabel `public.projects` via `supabase.from('projects').delete().eq('id', project.id)`.
- **Best-Effort Storage Cleanup**: Helper terpusat `extractStoragePath()` di [`src/lib/storageUtils.js`](file:///c:/Users/acer/portofolio/src/lib/storageUtils.js) mengekstrak relative path dari `thumbnail_url` dan menghapus file dari bucket `portfolio-assets`.
- **Sinkronisasi Form**: Jika proyek yang sedang aktif di-edit dihapus, form otomatis ditutup.
- **Feedback Interaktif**: Loading state tombol ("Menghapus..."), alert error di dalam modal jika gagal, dan success banner notification dengan opsi segarkan data otomatis (`refetch()`).

---

## 4. Konfigurasi & Keamanan Supabase Storage

File migration: [`supabase/migrations/20260928000000_storage_portfolio_assets.sql`](file:///c:/Users/acer/portofolio/supabase/migrations/20260928000000_storage_portfolio_assets.sql)

### A. Konfigurasi Bucket
- **Bucket ID / Name**: `portfolio-assets`
- **Public**: `true` (Pengunjung publik dapat melihat/mengunduh gambar portofolio tanpa login melalui URL CDN publik).
- **File Size Limit**: `2097152` bytes (2 MB).
- **Allowed MIME Types**: `ARRAY['image/*']`.

### B. Storage RLS Policies pada `storage.objects`
Semua operasi API dibatasi **hanya untuk authenticated admin** dan **hanya pada direktori `projects/`**:
1. **SELECT**: `"Admin select on portfolio-assets"` (`TO authenticated`, `bucket_id = 'portfolio-assets'`, folder `projects/`, `(select private.is_admin())`).
2. **INSERT**: `"Admin insert on portfolio-assets"` (`TO authenticated`, `bucket_id = 'portfolio-assets'`, folder `projects/`, `(select private.is_admin())`).
3. **UPDATE**: `"Admin update on portfolio-assets"` (`TO authenticated`, `bucket_id = 'portfolio-assets'`, folder `projects/`, `(select private.is_admin())`).
4. **DELETE**: `"Admin delete on portfolio-assets"` (`TO authenticated`, `bucket_id = 'portfolio-assets'`, folder `projects/`, `(select private.is_admin())`).
*(Catatan: Pengunjung publik membaca gambar melalui mekanisme Public Bucket endpoint, bukan via SELECT policy storage.objects).*

---

## 5. Struktur Direktori Proyek

```text
c:\Users\acer\portofolio\
├── .env.local                   # Kredensial VITE_SUPABASE_URL & VITE_SUPABASE_PUBLISHABLE_KEY
├── index.html                   # HTML entry point, Title: Aldi Dwi Irawan | Portfolio
├── package.json                 # Dependencies (react, react-dom, react-router-dom, @supabase/supabase-js)
├── vite.config.js
├── supabase/
│   └── migrations/
│       └── 20260928000000_storage_portfolio_assets.sql # Migration bucket & Storage RLS
└── src/
    ├── main.jsx                 # React root entry point
    ├── App.jsx                  # Router setup (Public + Admin lazy routes)
    ├── App.css                  # App styles
    ├── index.css                # Design system & CSS Variables
    ├── lib/
    │   ├── supabaseClient.js    # Inisialisasi createClient Supabase
    │   ├── authService.js       # signIn, signOut, getCurrentUser, verifyIsAdmin
    │   └── storageUtils.js      # Utility extractStoragePath untuk Supabase Storage
    ├── hooks/
    │   ├── useProjects.js       # Hook READ data public.projects
    │   ├── useSkills.js         # Hook READ data public.skills
    │   ├── useExperiences.js    # Hook READ data public.experiences
    │   ├── useEducations.js     # Hook READ data public.educations
    │   ├── useProfile.js        # Hook READ & UPDATE data public.profiles
    │   └── useMessages.js       # Hook READ, TOGGLE READ & DELETE data public.messages
    ├── data/
    │   └── portfolioData.js     # Data portofolio statis bawaan (fallback)
    ├── components/
    │   ├── Navbar.jsx / .css
    │   ├── HeroSection.jsx / .css
    │   ├── AboutSection.jsx / .css
    │   ├── SkillsSection.jsx / .css
    │   ├── ProjectsSection.jsx / .css
    │   ├── ExperienceSection.jsx / .css
    │   ├── EducationSection.jsx / .css
    │   ├── ContactSection.jsx / .css
    │   ├── ContactForm.jsx / .css   # Form pesan publik tersambung ke public.messages
    │   ├── Footer.jsx / .css
    │   ├── TechBadge.jsx / .css
    │   ├── SectionTitle.jsx
    │   └── admin/
    │       ├── AdminRoute.jsx           # Guard autentikasi & verifikasi admin
    │       ├── ProjectForm.jsx / .css   # Shared form CREATE & UPDATE + Storage Upload
    │       ├── SkillForm.jsx / .css     # Form CREATE & UPDATE Skills
    │       ├── ExperienceForm.jsx / .css# Form CREATE & UPDATE Experiences
    │       └── EducationForm.jsx / .css # Form CREATE & UPDATE Educations
    └── pages/
        ├── PublicPortfolioPage.jsx      # Halaman utama portofolio publik terintegrasi penuh
        └── admin/
            ├── AdminLoginPage.jsx / .css       # Halaman login admin
            ├── AdminDashboardPage.jsx / .css   # Dashboard ringkasan 6 modul CMS
            ├── AdminProjectsPage.jsx / .css    # Manajemen proyek (Full CRUD + Storage)
            ├── AdminSkillsPage.jsx / .css      # Manajemen keahlian (Full CRUD + Filter)
            ├── AdminExperiencesPage.jsx / .css # Manajemen pengalaman (Full CRUD + Timeline)
            ├── AdminEducationsPage.jsx / .css  # Manajemen pendidikan (Full CRUD + Timeline)
            ├── AdminProfilePage.jsx / .css     # Manajemen profil & preview interaktif
            └── AdminMessagesPage.jsx / .css    # Manajemen inbox pesan (Filter, Detail, Read/Unread, Delete)
```

---

## 6. Prinsip Desain & Batasan Penting (Rules & Constraints)

1. **Keamanan Tanpa Bypass**:
   - Sumber otorisasi utama selalu berasal dari **Database RLS** dan **Storage RLS** menggunakan `(select private.is_admin())`.
   - Tidak pernah mengekspos `service_role` key di frontend.
   - Tidak menggunakan password rahasia hardcoded di client.
2. **Tidak Mengubah Tanpa Izin**:
   - Jangan mengubah skema tabel `public.projects` atau skema tabel lain kecuali diminta.
   - Jangan mengubah helper database `private.is_admin()`.
   - Jangan mengubah konfigurasi `.env.local`.
3. **Kualitas Kode**:
   - Selalu lolos `npm run lint` (`oxlint`) dengan 0 warnings dan 0 errors.
   - Selalu lolos `npm run build` (`vite build`) sebelum task dianggap selesai.
   - Menghindari memory leak dengan selalu membersihkan object URL via `URL.revokeObjectURL()`.

---

## 7. Status Pekerjaan (Roadmap 1 - 5 Selesai 100%)

Seluruh 5 tahap roadmap admin CMS yang direncanakan telah selesai dibangun dan teruji:

- [x] **Fondasi & Projects CMS (Stage 0):**
  - Desain sistem & Layout portofolio publik.
  - Autentikasi admin 2 lapis (`AdminRoute`).
  - Full CRUD Projects (`public.projects`) + Supabase Storage upload thumbnail & automatic cleanup.
- [x] **Tahap 1 — Skills CMS (`public.skills`) Selesai 100%:**
  - Read & Filter by Category (`useSkills` hook).
  - Create & Edit (`SkillForm.jsx` dengan preset kategori & proficiency).
  - Delete dengan Custom Confirmation Modal.
  - Route `/admin/skills` terproteksi `AdminRoute`.
  - Sinkronisasi dinamis ke Public Portfolio (`SkillsSection.jsx`) dengan fallback.
- [x] **Tahap 2 — Experiences CMS (`public.experiences`) Selesai 100%:**
  - Read & Timeline view (`useExperiences` hook).
  - Create & Edit (`ExperienceForm.jsx` dengan date picker, role, company, location, is_current).
  - Delete dengan Custom Confirmation Modal.
  - Route `/admin/experiences` terproteksi `AdminRoute`.
  - Sinkronisasi dinamis ke Public Portfolio (`ExperienceSection.jsx`) dengan fallback.
- [x] **Tahap 3 — Educations CMS (`public.educations`) Selesai 100%:**
  - Read & Timeline view (`useEducations` hook).
  - Create & Edit (`EducationForm.jsx` dengan degree preset, start_year, end_year, is_current).
  - Delete dengan Custom Confirmation Modal.
  - Route `/admin/educations` terproteksi `AdminRoute`.
  - Sinkronisasi dinamis ke Public Portfolio (`EducationSection.jsx`) dengan fallback.
- [x] **Tahap 4 — Profile CMS (`public.profiles`) Selesai 100%:**
  - Read profile data (`useProfile` hook).
  - Update data personal, tagline, biografi, domisili, email, status ketersediaan kerja (`is_available`).
  - Tautan profil sosial (GitHub, LinkedIn, Instagram, Resume URL).
  - Live interactive preview panel.
  - Route `/admin/profile` terproteksi `AdminRoute`.
  - Sinkronisasi dinamis ke Public Portfolio (Hero, About, Contact, dan Footer) dengan fallback.
- [x] **Tahap 5 — Messages / Inbox CMS (`public.messages`) Selesai 100%:**
  - Read messages & unread counter badge (`useMessages` hook).
  - Filter tabs (Semua, Belum Dibaca, Sudah Dibaca).
  - Modal detail pesan dengan metadata pengirim lengkap dan aksi cepat balas via email (`mailto`).
  - Toggle status baca/belum dibaca (`markAsRead` / `markAsUnread`).
  - Hapus pesan dengan Custom Confirmation Modal.
  - Route `/admin/messages` terproteksi `AdminRoute`.
  - Integrasi form publik (`ContactForm.jsx`) langsung mengirim pesan ke tabel `public.messages` dengan feedback status dan penanganan RLS yang aman.

---

## 8. Verifikasi Kualitas Terakhir

- **Linter**: `oxlint` &rarr; **0 warnings, 0 errors** pada seluruh 42 files.
- **Production Build**: `vite build` &rarr; **133 modules transformed, build sukses 100%**.
- **Komitmen Git**: Seluruh perubahan dari Tahap 1 sampai Tahap 5 dikumpulkan sesuai instruksi untuk di-commit bersamaan.
