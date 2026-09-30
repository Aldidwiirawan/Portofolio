/**
 * Static Portfolio Data (Stage 2)
 * Designed to mirror the Supabase PostgreSQL database schema
 * for seamless transition in subsequent stages.
 */

export const profileData = {
  full_name: 'Aldi Dwi Irawan',
  title: 'Web Developer & IT Graduate',
  tagline: 'Membangun solusi web modern, responsif, dan mudah digunakan.',
  bio: 'Lulusan D3 Manajemen Informatika dengan minat mendalam pada pengembangan aplikasi web. Terbiasa membangun antarmuka pengguna interaktif dan mengelola alur data sistem dengan pendekatan kode yang terstruktur.',
  location: 'Indonesia',
  status: 'Terbuka untuk Peluang Kerja & Kolaborasi Proyek',
  social_links: {
    github: 'https://github.com',
    linkedin: 'https://linkedin.com',
    email: 'contact@example.com',
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
    name: 'Responsive Web Design',
    category: 'Frontend',
    proficiency: 'Mahir',
    sort_order: 4,
  },

  // Backend
  {
    id: 'skill-5',
    name: 'Node.js',
    category: 'Backend',
    proficiency: 'Dasar / Menengah',
    sort_order: 5,
  },
  {
    id: 'skill-6',
    name: 'RESTful API Concept',
    category: 'Backend',
    proficiency: 'Menengah',
    sort_order: 6,
  },

  // Database
  {
    id: 'skill-7',
    name: 'PostgreSQL',
    category: 'Database',
    proficiency: 'Dasar / Menengah',
    sort_order: 7,
  },
  {
    id: 'skill-8',
    name: 'SQL Basics & Relasional',
    category: 'Database',
    proficiency: 'Menengah',
    sort_order: 8,
  },
  {
    id: 'skill-9',
    name: 'Supabase (BaaS)',
    category: 'Database',
    proficiency: 'Menengah',
    sort_order: 9,
  },

  // Tools
  {
    id: 'skill-10',
    name: 'Git & GitHub',
    category: 'Tools',
    proficiency: 'Menengah',
    sort_order: 10,
  },
  {
    id: 'skill-11',
    name: 'Vite & Modern Tooling',
    category: 'Tools',
    proficiency: 'Menengah',
    sort_order: 11,
  },
  {
    id: 'skill-12',
    name: 'VS Code & DevTools',
    category: 'Tools',
    proficiency: 'Mahir',
    sort_order: 12,
  },
]

export const projectsData = [
  {
    id: 'proj-1',
    title: 'Personal Portfolio Web App',
    slug: 'personal-portfolio-web-app',
    description:
      'Aplikasi web portofolio pribadi modern dengan arsitektur single-page berbasis React, styling CSS kustom modular, dan integrasi backend Supabase.',
    content:
      'Proyek ini dirancang sebagai wadah showcase profesional untuk menampilkan profil, keahlian, pengalaman, dan karya proyek. Dibangun dengan fokus utama pada performa, aksesibilitas, dan arsitektur database yang aman dengan Row Level Security.',
    thumbnail_url: null, // Menggunakan CSS visual placeholder
    demo_url: '#',
    github_url: 'https://github.com',
    tech_stack: ['React', 'JavaScript', 'CSS3', 'Supabase', 'Vite'],
    is_featured: true,
    sort_order: 1,
  },
  {
    id: 'proj-2',
    title: 'Sistem Informasi Pengelolaan Data',
    slug: 'sistem-informasi-pengelolaan-data',
    description:
      'Aplikasi manajemen data berbasis web dengan antarmuka tabel interaktif, filter pencarian, dan operasi CRUD yang efisien.',
    content:
      'Aplikasi ini memfasilitasi pengguna dalam mengorganisir dan memperbarui arsip data secara terpusat dengan validasi form serta antarmuka yang bersih dan mudah dinavigasi.',
    thumbnail_url: null,
    demo_url: '#',
    github_url: 'https://github.com',
    tech_stack: ['React', 'JavaScript', 'PostgreSQL', 'REST API'],
    is_featured: true,
    sort_order: 2,
  },
  {
    id: 'proj-3',
    title: 'Landing Page & Profil Interaktif',
    slug: 'landing-page-profil-interaktif',
    description:
      'Halaman arahan responsif berkinerja tinggi yang dioptimalkan untuk berbagai ukuran layar mobile dan desktop dengan interaksi dinamis.',
    content:
      'Eksplorasi tata letak visual modern dengan navigasi anchor terpadu, animasi halus, dan komponen desain yang konsisten untuk pengalaman pengguna yang nyaman.',
    thumbnail_url: null,
    demo_url: '#',
    github_url: 'https://github.com',
    tech_stack: ['HTML5', 'CSS3', 'JavaScript', 'Responsive UI'],
    is_featured: false,
    sort_order: 3,
  },
]

export const experiencesData = [
  {
    id: 'exp-1',
    company: 'Proyek Pengembangan Web Mandiri',
    position: 'Web Developer (Proyek Akademik & Latihan)',
    location: 'Indonesia',
    start_date: '2023',
    end_date: null,
    is_current: true,
    description:
      'Merancang antarmuka pengguna web menggunakan teknologi modern (React, JavaScript, CSS). Mengintegrasikan aplikasi dengan database relasional dan menerapkan praktik penulisan kode yang rapi serta terstruktur.',
    sort_order: 1,
  },
  {
    id: 'exp-2',
    company: 'Kegiatan Praktikum & Tugas Akhir',
    position: 'Pengembang Sistem Informasi (Akademik)',
    location: 'Indonesia',
    start_date: '2022',
    end_date: '2023',
    is_current: false,
    description:
      'Menganalisis kebutuhan sistem, memodelkan basis data relasional, dan mengimplementasikan aplikasi manajemen data sederhana untuk pemecahan masalah praktis.',
    sort_order: 2,
  },
]

export const educationsData = [
  {
    id: 'edu-1',
    institution: 'Perguruan Tinggi / Akademi (D3 Manajemen Informatika)',
    degree: 'Diploma III (D3)',
    field_of_study: 'Manajemen Informatika',
    start_date: 'Pendidikan Terdaftar',
    end_date: 'Lulus / Berjalan',
    grade: null,
    description:
      'Menempuh studi dalam bidang Manajemen Informatika dengan fokus pada rekayasa perangkat lunak, basis data relasional, analisis sistem, serta pemrograman web.',
    sort_order: 1,
  },
]
