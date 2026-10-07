/**
 * Static Portfolio Data
 * Data profil, keahlian, proyek, pengalaman, dan pendidikan resmi
 * Aldi Dwi Irawan — Lulusan D3 Manajemen Informatika (IPK 3,54)
 */

export const profileData = {
  full_name: 'Aldi Dwi Irawan',
  title: 'Web Developer & IT Specialist',
  tagline: 'Lulusan D3 Manajemen Informatika (IPK 3,54) berfokus pada Web Development, IT Support, & Jaringan Komputer.',
  bio: 'Saya adalah lulusan D3 Manajemen Informatika Politeknik Negeri Malang (IPK 3,54) dengan fondasi kuat di bidang IT, tersertifikasi MikroTik (MTCNA) dan Kompetensi Pemrograman Software. Berpengalaman praktis membangun solusi IT, di antaranya Sistem Informasi Pengelolaan Data Produk Berbasis Website di Dinas Kominfo Kab. Kediri dan Sistem Monitoring Pengiriman Barang berbasis Barcode di CV. Adisatya IT Consultant. Menguasai manajemen basis data, desain antarmuka responsif, dan operasional jaringan komputer. Siap berkontribusi nyata pada posisi IT Support, Junior Programmer, maupun Staff IT Administrasi.',
  location: 'Kediri, Jawa Timur, Indonesia',
  address: 'Bandar Lor Gg. IX No. 69, Kab. Kediri, Jawa Timur',
  phone: '082331318598',
  status: 'Terbuka untuk Peluang Kerja (IT Support / Junior Programmer / Web Developer)',
  social_links: {
    github: 'https://github.com/Aldidwiirawan',
    linkedin: 'https://linkedin.com',
    email: 'aldidwiirawan2004@gmail.com',
  },
}

export const skillsData = [
  // Frontend
  {
    id: 'skill-1',
    name: 'HTML5 & CSS3',
    category: 'Frontend',
    proficiency: 'Mahir',
    sort_order: 1,
  },
  {
    id: 'skill-2',
    name: 'JavaScript (ES6+)',
    category: 'Frontend',
    proficiency: 'Menengah',
    sort_order: 2,
  },
  {
    id: 'skill-3',
    name: 'React.js',
    category: 'Frontend',
    proficiency: 'Menengah',
    sort_order: 3,
  },
  {
    id: 'skill-4',
    name: 'Desain Antarmuka (UI/UX Responsif)',
    category: 'Frontend',
    proficiency: 'Mahir',
    sort_order: 4,
  },

  // Backend & Mobile
  {
    id: 'skill-5',
    name: 'Python',
    category: 'Backend',
    proficiency: 'Menengah',
    sort_order: 5,
  },
  {
    id: 'skill-6',
    name: 'RESTful API & Web Services',
    category: 'Backend',
    proficiency: 'Menengah',
    sort_order: 6,
  },
  {
    id: 'skill-7',
    name: 'Pengembangan Mobile (Flutter)',
    category: 'Backend',
    proficiency: 'Menengah',
    sort_order: 7,
  },

  // Database
  {
    id: 'skill-8',
    name: 'SQL & Database Relasional',
    category: 'Database',
    proficiency: 'Mahir',
    sort_order: 8,
  },
  {
    id: 'skill-9',
    name: 'PostgreSQL & Supabase (BaaS)',
    category: 'Database',
    proficiency: 'Menengah',
    sort_order: 9,
  },

  // Tools & Jaringan
  {
    id: 'skill-10',
    name: 'Jaringan Komputer (MikroTik MTCNA)',
    category: 'Tools',
    proficiency: 'Mahir',
    sort_order: 10,
  },
  {
    id: 'skill-11',
    name: 'Git & GitHub',
    category: 'Tools',
    proficiency: 'Menengah',
    sort_order: 11,
  },
  {
    id: 'skill-12',
    name: 'Integrasi Pemindai Barcode',
    category: 'Tools',
    proficiency: 'Menengah',
    sort_order: 12,
  },
  {
    id: 'skill-13',
    name: 'IT Support & Troubleshooting OS',
    category: 'Tools',
    proficiency: 'Mahir',
    sort_order: 13,
  },
]

export const projectsData = [
  {
    id: 'proj-1',
    title: 'Sistem Monitoring Pengiriman Barang Berbasis Pemindaian Barcode',
    slug: 'sistem-monitoring-pengiriman-barang-barcode',
    description:
      'Sistem monitoring pengiriman barang real-time dengan integrasi pemindai barcode yang diimplementasikan untuk klien perusahaan (AyamBebek Pakan dan Ternak).',
    content:
      'Dirancang dan dikembangkan saat magang di CV. Adisatya IT Consultant. Bertanggung jawab mengintegrasikan perangkat scanner barcode dengan basis data untuk memastikan akurasi pelacakan distribusi logistik barang secara real-time serta mencegah kesalahan pencatatan manual.',
    thumbnail_url: null,
    demo_url: '#',
    github_url: 'https://github.com/Aldidwiirawan',
    tech_stack: ['JavaScript', 'SQL & Database', 'Barcode Scanner', 'REST API', 'Web System'],
    is_featured: true,
    sort_order: 1,
  },
  {
    id: 'proj-2',
    title: 'Sistem Informasi Pengelolaan Data Produk Madura Mart Berbasis Website',
    slug: 'sistem-informasi-pengelolaan-data-madura-mart',
    description:
      'Aplikasi web pengelolaan data produk digital terpusat dengan sistem otorisasi khusus Role Admin untuk Dinas Komunikasi dan Informatika Kabupaten Kediri.',
    content:
      'Dirancang dan dikembangkan saat PKL di Dinas Kominfo Kabupaten Kediri untuk memfasilitasi pendataan digital. Membangun sistem otorisasi Role Admin agar pengelolaan database aman dan terstruktur, serta menerapkan antarmuka UI/UX yang responsif guna memudahkan data entry dan pemantauan informasi.',
    thumbnail_url: null,
    demo_url: '#',
    github_url: 'https://github.com/Aldidwiirawan',
    tech_stack: ['Web Development', 'JavaScript', 'Database Management', 'UI/UX Responsif', 'Role Auth'],
    is_featured: true,
    sort_order: 2,
  },
  {
    id: 'proj-3',
    title: 'Personal Portfolio & Admin CMS Web App',
    slug: 'personal-portfolio-admin-cms-web-app',
    description:
      'Aplikasi portofolio web modern dengan arsitektur single-page React, desain modern dark theme, dan panel Admin CMS lengkap bertenaga Supabase BaaS.',
    content:
      'Showcase profesional untuk menyajikan profil, keterampilan, pengalaman kerja, pendidikan, dan proyek secara interaktif. Dilengkapi manajemen data CRUD terproteksi autentikasi 2-lapis, Supabase Storage dengan auto orphan cleanup, serta integrasi formulir kontak langsung ke database.',
    thumbnail_url: null,
    demo_url: '#',
    github_url: 'https://github.com/Aldidwiirawan/Portofolio',
    tech_stack: ['React', 'JavaScript', 'Supabase', 'PostgreSQL', 'CSS Variables', 'Vite'],
    is_featured: true,
    sort_order: 3,
  },
]

export const experiencesData = [
  {
    id: 'exp-1',
    company: 'CV. Adisatya IT Consultant',
    role: 'Programmer Intern / IT Intern',
    position: 'Programmer Intern / IT Intern',
    location: 'Kab. Kediri, Jawa Timur, Indonesia',
    start_date: '2026-01-01',
    end_date: '2026-07-31',
    is_current: false,
    description:
      'Merancang dan mengembangkan "Sistem Monitoring Pengiriman Barang Berbasis Pemindaian Barcode" yang diimplementasikan untuk klien perusahaan (AyamBebek Pakan dan Ternak). Bertanggung jawab mengintegrasikan perangkat scanner barcode dengan basis data untuk memastikan akurasi pelacakan distribusi barang secara real-time dalam lingkungan konsultan IT.',
    sort_order: 1,
  },
  {
    id: 'exp-2',
    company: 'Dinas Komunikasi dan Informatika Kab. Kediri',
    role: 'Web Developer Intern',
    position: 'Web Developer Intern',
    location: 'Kab. Kediri, Jawa Timur, Indonesia',
    start_date: '2025-06-01',
    end_date: '2025-08-31',
    is_current: false,
    description:
      'Merancang dan mengembangkan "Sistem Informasi Pengelolaan Data Produk Madura Mart Berbasis Website" untuk memfasilitasi pendataan digital. Membangun sistem otorisasi khusus untuk Role Admin agar pengelolaan basis data produk berjalan aman dan terstruktur, serta menerapkan desain antarmuka (UI/UX) yang responsif.',
    sort_order: 2,
  },
  {
    id: 'exp-3',
    company: 'JF Interior',
    role: 'Interior Project Staff / Intern',
    position: 'Interior Project Staff / Intern',
    location: 'Kab. Sidoarjo, Jawa Timur, Indonesia',
    start_date: '2023-02-01',
    end_date: '2023-05-31',
    is_current: false,
    description:
      'Mendukung operasional teknis dan administrasi proyek interior, koordinasi jadwal pengerjaan, pencatatan kebutuhan material, serta dokumentasi progres lapangan.',
    sort_order: 3,
  },
]

export const educationsData = [
  {
    id: 'edu-1',
    institution: 'Politeknik Negeri Malang',
    degree: 'Diploma III (D3)',
    field_of_study: 'Manajemen Informatika',
    start_year: 2023,
    end_year: 2026,
    start_date: '2023',
    end_date: '2026',
    grade: 'IPK 3,54 / 4,00',
    is_current: false,
    description:
      'Lulusan D3 Manajemen Informatika dengan IPK 3,54. Mempelajari rekayasa perangkat lunak, pemrograman web dan mobile (JavaScript, React, Flutter, Python), manajemen basis data relasional, analisis sistem, serta operasional jaringan komputer.',
    sort_order: 1,
  },
]

export const certificationsData = [
  {
    id: 'cert-1',
    title: 'Sertifikat Kompetensi Bahasa Inggris TOEIC',
    issuer: 'PT International Test Center',
    issue_year: '2026',
    valid_until: 'Mei 2026 - Mei 2028',
    sort_order: 1,
  },
  {
    id: 'cert-2',
    title: 'Sertifikat Kompetensi Pemrograman Software Komputer',
    issuer: 'Lembaga Sertifikasi Profesi Politeknik Negeri Malang',
    issue_year: '2025',
    valid_until: 'Oktober 2025 - Oktober 2028',
    sort_order: 2,
  },
  {
    id: 'cert-3',
    title: 'MikroTik Certified Network Associate (MTCNA)',
    issuer: 'MikroTik',
    issue_year: '2024',
    valid_until: 'Oktober 2024 - Oktober 2027',
    sort_order: 3,
  },
]

export const trainingsData = [
  {
    id: 'train-1',
    title: 'Teknologi Informasi Dan Komunikasi - Python Essentials',
    provider: 'Cisco Networking Academy',
    period: 'Agustus 2024',
    sort_order: 1,
  },
  {
    id: 'train-2',
    title: 'Teknologi Informasi Dan Komunikasi - Operating Systems Basics',
    provider: 'Cisco Networking Academy',
    period: 'Mei 2024',
    sort_order: 2,
  },
]
