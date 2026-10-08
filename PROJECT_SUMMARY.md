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
│       ├── 20260928000000_storage_portfolio_assets.sql # Migration bucket & Storage RLS
│       └── 20261008000000_cv_builder_extensions.sql    # Migration CV Builder schemas & RLS
└── src/
    ├── main.jsx                 # React root entry point
    ├── App.jsx                  # Router setup (Public + 10 Admin lazy routes)
    ├── App.css                  # App styles
    ├── index.css                # Design system & CSS Variables
    ├── lib/
    │   ├── supabaseClient.js    # Inisialisasi createClient Supabase
    │   ├── authService.js       # signIn, signOut, getCurrentUser, verifyIsAdmin
    │   └── storageUtils.js      # Utility extractStoragePath untuk Supabase Storage
    ├── hooks/
    │   ├── useProjects.js       # Hook READ data public.projects
    │   ├── useSkills.js         # Hook READ data public.skills
    │   ├── useExperiences.js    # Hook READ data public.experiences (+ experience_type)
    │   ├── useEducations.js     # Hook READ data public.educations
    │   ├── useProfile.js        # Hook READ & UPDATE data public.profiles (+ phone, address, hobbies, resume)
    │   ├── useMessages.js       # Hook READ, TOGGLE READ & DELETE data public.messages
    │   ├── useCertifications.js # Hook READ data public.certifications
    │   ├── useAchievements.js   # Hook READ data public.achievements
    │   ├── useLanguages.js      # Hook READ data public.languages
    │   └── useOrganizations.js  # Hook READ data public.organizations
    ├── data/
    │   └── portfolioData.js     # Data portofolio statis bawaan (fallback lengkap)
    ├── components/
    │   ├── Navbar.jsx / .css
    │   ├── HeroSection.jsx / .css
    │   ├── AboutSection.jsx / .css        # Bio, phone, address, resume link, hobbies, languages
    │   ├── SkillsSection.jsx / .css
    │   ├── ProjectsSection.jsx / .css
    │   ├── ExperienceSection.jsx / .css   # Timeline dengan badge tipe pengalaman
    │   ├── EducationSection.jsx / .css
    │   ├── CertificationsSection.jsx / .css # Lisensi sertifikasi & prestasi
    │   ├── OrganizationsSection.jsx / .css  # Pengalaman organisasi & komunitas
    │   ├── ContactSection.jsx / .css
    │   ├── ContactForm.jsx / .css
    │   ├── Footer.jsx / .css
    │   ├── TechBadge.jsx / .css
    │   ├── SectionTitle.jsx
    │   └── admin/
    │       ├── AdminRoute.jsx              # Guard autentikasi & verifikasi admin
    │       ├── ProjectForm.jsx / .css      # Shared form CREATE & UPDATE + Storage Upload
    │       ├── SkillForm.jsx / .css        # Form CREATE & UPDATE Skills
    │       ├── ExperienceForm.jsx / .css   # Form CREATE & UPDATE Experiences (+ experience_type pills)
    │       ├── EducationForm.jsx / .css    # Form CREATE & UPDATE Educations
    │       ├── CertificationForm.jsx / .css# Form CREATE & UPDATE Certifications
    │       ├── AchievementForm.jsx / .css  # Form CREATE & UPDATE Achievements
    │       ├── LanguageForm.jsx / .css     # Form CREATE & UPDATE Languages
    │       └── OrganizationForm.jsx / .css # Form CREATE & UPDATE Organizations
    └── pages/
        ├── PublicPortfolioPage.jsx         # Halaman utama portofolio publik terintegrasi penuh
        └── admin/
            ├── AdminLoginPage.jsx / .css          # Halaman login admin
            ├── AdminDashboardPage.jsx / .css      # Dashboard ringkasan 10 modul CMS
            ├── AdminProjectsPage.jsx / .css       # Manajemen proyek (Full CRUD + Storage)
            ├── AdminSkillsPage.jsx / .css         # Manajemen keahlian (Full CRUD + Filter)
            ├── AdminExperiencesPage.jsx / .css    # Manajemen pengalaman (Full CRUD + Type badge)
            ├── AdminEducationsPage.jsx / .css     # Manajemen pendidikan (Full CRUD + Timeline)
            ├── AdminProfilePage.jsx / .css        # Manajemen profil lengkap (+ No HP, Alamat, Hobi, Resume)
            ├── AdminMessagesPage.jsx / .css       # Manajemen inbox pesan (Filter, Read/Unread, Delete)
            ├── AdminCertificationsPage.jsx / .css # Manajemen sertifikasi (Full CRUD + Link Kredensial)
            ├── AdminAchievementsPage.jsx / .css   # Manajemen pencapaian & prestasi (Full CRUD)
            ├── AdminLanguagesPage.jsx / .css      # Manajemen kemampuan bahasa (Full CRUD)
            └── AdminOrganizationsPage.jsx / .css  # Manajemen pengalaman organisasi (Full CRUD)
```

---

## 6. Prinsip Desain & Batasan Penting (Rules & Constraints)

1. **Keamanan Tanpa Bypass**:
   - Sumber otorisasi utama selalu berasal dari **Database RLS** dan **Storage RLS** menggunakan `(select private.is_admin())`.
   - Tidak pernah mengekspos `service_role` key di frontend.
   - Tidak menggunakan password rahasia hardcoded di client.
2. **Kualitas Kode**:
   - Selalu lolos `npm run lint` (`oxlint`) dengan 0 warnings dan 0 errors.
   - Selalu lolos `npm run build` (`vite build`) sebelum task dianggap selesai.
   - Menghindari memory leak dengan selalu membersihkan object URL via `URL.revokeObjectURL()`.

---

## 7. Status Pekerjaan (Roadmap Awal & CV Builder Selesai 100%)

### A. 6 Modul Fondasi Utama:
- [x] **Fondasi & Projects CMS** (`public.projects`): Full CRUD + Storage upload & automatic orphan cleanup.
- [x] **Skills CMS** (`public.skills`): Full CRUD + Kategori pills + Filter + Public UI sync.
- [x] **Experiences CMS** (`public.experiences`): Full CRUD + Date picker + Current status + Public UI sync.
- [x] **Educations CMS** (`public.educations`): Full CRUD + Degree presets + Public UI sync.
- [x] **Profile CMS** (`public.profiles`): Full settings + Live preview + Availability toggle + Public UI sync.
- [x] **Messages CMS** (`public.messages`): Inbox filter + Read/unread toggle + Delete + ContactForm sync.

### B. Ekstensi CV Builder Lanjutan (Tahap 1 - 4):
- [x] **Tahap 1 — Modifikasi Skema Database**:
  - `public.profiles`: ditambah kolom `phone_number`, `full_address`, `instagram_url`, `linkedin_url`, `github_url`, `resume_link`, `hobbies` (`TEXT[]`).
  - `public.experiences`: ditambah kolom `experience_type` ('Kerja', 'Magang', 'PKL') default 'Kerja'.
- [x] **Tahap 2 — Skema Tabel Baru & RLS Supabase**:
  - `public.certifications` (RLS: Public SELECT, Admin INSERT/UPDATE/DELETE).
  - `public.achievements` (RLS: Public SELECT, Admin INSERT/UPDATE/DELETE).
  - `public.languages` (RLS: Public SELECT, Admin INSERT/UPDATE/DELETE).
  - `public.organizations` (RLS: Public SELECT, Admin INSERT/UPDATE/DELETE).
- [x] **Tahap 3 — Custom Hooks & Komponen Admin (CRUD)**:
  - Hooks: `useCertifications.js`, `useAchievements.js`, `useLanguages.js`, `useOrganizations.js`.
  - Admin Forms & Pages untuk seluruh 4 modul baru dengan konfirmasi modal hapus.
  - Form & Page `AdminProfilePage.jsx` mendukung No HP, Alamat, Hobi, dan Link Resume.
  - Form & Page `AdminExperiencesPage.jsx` mendukung pilihan pill `experience_type` (Kerja/Magang/PKL).
  - Pendaftaran rute di `App.jsx` terproteksi `AdminRoute` dan penambahan kartu di `AdminDashboardPage.jsx`.
- [x] **Tahap 4 — Sinkronisasi ke UI Publik**:
  - `AboutSection.jsx` menampilkan No HP, Alamat, Tombol Download Dokumen CV (PDF), Pill Minat & Hobi, serta Kemampuan Bahasa.
  - `ExperienceSection.jsx` menampilkan badge jenis pengalaman ('Kerja' / 'Magang' / 'PKL').
  - `CertificationsSection.jsx` menampilkan daftar sertifikasi dengan link kredensial dan prestasi kompetisi.
  - `OrganizationsSection.jsx` menampilkan linimasa kepengurusan organisasi dan komunitas.
  - Navigasi anchor di `Navbar.jsx` diperbarui.

### C. Modern UI Revamp & Public Guestbook (Fusion Styfen + Irfan):
- [x] **Hero Section — Luxury Tech & Giant Statement Typography**:
  - Technical blueprint dot-matrix grid with mouse-tracking radial ambient glow spotlight.
  - Floating tech pill capsules (Neo-brutalist bounce: Junior Programmer, MikroTik MTCNA, Web Developer, D3 Polinema).
  - Giant statement headline typography: `ALDI DWI IRAWAN`.
  - Interactive 3D Holographic ID Card with mouse tilt, glossy sheen reflection, ADI monogram, and 3 verified credential badges.
  - Modular bottom status ticker bar (4-kolom): `Open to Work`, `Based in Kediri`, `Real-time Today Date`, `Scroll to Explore`.
- [x] **JourneySection (Rekam Jejak Terpadu)**:
  - Segmented interactive tab controls `[ 💼 Pengalaman | 🎓 Pendidikan | 📜 Sertifikasi & Prestasi | 👥 Organisasi ]` dengan live counter badges.
- [x] **Public Guestbook Slide-Over Drawer (`~/guestbook.log`)**:
  - Slide drawer panel dari sisi kanan dengan glassmorphism, terminal header, dan keyboard `ESC` listener.
  - Form kirim pesan publik real-time (nama & pesan max 240 karakter).
  - Tampilan gelembung pesan chat dengan thread balasan resmi terverifikasi `[DEV ALDI]`.
  - Hook `useGuestbook.js` dengan optimistic update & fallback mock data.
  - Skema database Supabase & RLS di `supabase/migrations/20261008010000_guestbook_schema.sql`.
  - Modul CMS `AdminGuestbookPage.jsx` di `/admin/guestbook` untuk moderasi & membalas pesan tamu.
  - Tombol pemicu di `Navbar.jsx` dan floating pill di pojok kanan bawah.
- [x] **Custom Animated Tech Cursor (`CustomCursor.jsx`)**:
  - Kursor cincin rotor target ala Irfan Sabrian dengan titik tengah presisi dan 60fps lerp animation.
  - Efek expand & glow magnetik saat hover elemen interaktif (hanya aktif pada perangkat desktop mouse).

---

## 8. Verifikasi Kualitas Terakhir

- **Linter**: `oxlint` &rarr; **0 warnings, 0 errors** pada seluruh 61 files.
- **Production Build**: `vite build` &rarr; **162 modules transformed, build sukses 100% dalam 559ms**.

