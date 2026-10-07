-- ==============================================================================
-- Migration: CV Builder Schema Extensions (Tahap 1 & Tahap 2)
-- Date: 2026-10-08
-- Description:
-- 1. Modifikasi tabel profiles & experiences (kolom baru).
-- 2. Pembuatan tabel baru: certifications, achievements, languages, organizations.
-- 3. Konfigurasi Row Level Security (RLS) lengkap (Public READ, Admin MANAGE).
-- ==============================================================================

-- ==============================================================================
-- TAHAP 1: MODIFIKASI SKEMA TABEL YANG SUDAH ADA
-- ==============================================================================

-- 1.1 Tabel profiles: Tambah biodata & sosial media lanjutan
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone_number TEXT,
  ADD COLUMN IF NOT EXISTS full_address TEXT,
  ADD COLUMN IF NOT EXISTS instagram_url TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS github_url TEXT,
  ADD COLUMN IF NOT EXISTS resume_link TEXT,
  ADD COLUMN IF NOT EXISTS hobbies TEXT[] DEFAULT '{}'::TEXT[];

-- 1.2 Tabel experiences: Tambah kolom experience_type dengan default 'Kerja'
ALTER TABLE public.experiences
  ADD COLUMN IF NOT EXISTS experience_type TEXT NOT NULL DEFAULT 'Kerja';

-- Pastikan data lama (jika ada yang NULL) terisi default 'Kerja'
UPDATE public.experiences
SET experience_type = 'Kerja'
WHERE experience_type IS NULL;


-- ==============================================================================
-- TAHAP 2: PEMBUATAN TABEL BARU BESERTA RLS-NYA
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 2.1 TABEL: certifications (Sertifikasi, Pelatihan & Kursus)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.certifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  issuer TEXT NOT NULL,
  issue_date DATE,
  credential_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.certifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "Public can view certifications" ON public.certifications;
DROP POLICY IF EXISTS "Admin can insert certifications" ON public.certifications;
DROP POLICY IF EXISTS "Admin can update certifications" ON public.certifications;
DROP POLICY IF EXISTS "Admin can delete certifications" ON public.certifications;

-- Policies for certifications
CREATE POLICY "Public can view certifications"
  ON public.certifications
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert certifications"
  ON public.certifications
  FOR INSERT
  TO authenticated
  WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admin can update certifications"
  ON public.certifications
  FOR UPDATE
  TO authenticated
  USING ((select private.is_admin()))
  WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admin can delete certifications"
  ON public.certifications
  FOR DELETE
  TO authenticated
  USING ((select private.is_admin()));


-- ------------------------------------------------------------------------------
-- 2.2 TABEL: achievements (Pencapaian & Prestasi)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  event_name TEXT NOT NULL,
  year INTEGER NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "Public can view achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admin can insert achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admin can update achievements" ON public.achievements;
DROP POLICY IF EXISTS "Admin can delete achievements" ON public.achievements;

-- Policies for achievements
CREATE POLICY "Public can view achievements"
  ON public.achievements
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert achievements"
  ON public.achievements
  FOR INSERT
  TO authenticated
  WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admin can update achievements"
  ON public.achievements
  FOR UPDATE
  TO authenticated
  USING ((select private.is_admin()))
  WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admin can delete achievements"
  ON public.achievements
  FOR DELETE
  TO authenticated
  USING ((select private.is_admin()));


-- ------------------------------------------------------------------------------
-- 2.3 TABEL: languages (Kemampuan Bahasa)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_name TEXT NOT NULL,
  proficiency_level TEXT NOT NULL, -- 'Pemula', 'Menengah', 'Mahir', 'Penutur Asli'
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "Public can view languages" ON public.languages;
DROP POLICY IF EXISTS "Admin can insert languages" ON public.languages;
DROP POLICY IF EXISTS "Admin can update languages" ON public.languages;
DROP POLICY IF EXISTS "Admin can delete languages" ON public.languages;

-- Policies for languages
CREATE POLICY "Public can view languages"
  ON public.languages
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert languages"
  ON public.languages
  FOR INSERT
  TO authenticated
  WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admin can update languages"
  ON public.languages
  FOR UPDATE
  TO authenticated
  USING ((select private.is_admin()))
  WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admin can delete languages"
  ON public.languages
  FOR DELETE
  TO authenticated
  USING ((select private.is_admin()));


-- ------------------------------------------------------------------------------
-- 2.4 TABEL: organizations (Pengalaman Organisasi & Ekstrakurikuler)
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  start_date DATE,
  end_date DATE,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any (idempotent)
DROP POLICY IF EXISTS "Public can view organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admin can insert organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admin can update organizations" ON public.organizations;
DROP POLICY IF EXISTS "Admin can delete organizations" ON public.organizations;

-- Policies for organizations
CREATE POLICY "Public can view organizations"
  ON public.organizations
  FOR SELECT
  TO anon, authenticated
  USING (true);

CREATE POLICY "Admin can insert organizations"
  ON public.organizations
  FOR INSERT
  TO authenticated
  WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admin can update organizations"
  ON public.organizations
  FOR UPDATE
  TO authenticated
  USING ((select private.is_admin()))
  WITH CHECK ((select private.is_admin()));

CREATE POLICY "Admin can delete organizations"
  ON public.organizations
  FOR DELETE
  TO authenticated
  USING ((select private.is_admin()));
