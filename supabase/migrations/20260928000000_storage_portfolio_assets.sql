-- ============================================================
-- Migration: Supabase Storage Configuration & Security Policies
-- Bucket: portfolio-assets
-- Date: 2026-09-28
-- ============================================================

-- 1. Create or update storage bucket 'portfolio-assets'
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'portfolio-assets',
  'portfolio-assets',
  true,
  2097152,
  ARRAY['image/*']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Drop existing policies if already created (idempotent migration)
DROP POLICY IF EXISTS "Admin select on portfolio-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin insert on portfolio-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin update on portfolio-assets" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete on portfolio-assets" ON storage.objects;

-- 3. Policy: Admin select on portfolio-assets
--    Allows Storage API metadata access for authenticated owner/admin within projects/
CREATE POLICY "Admin select on portfolio-assets"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'portfolio-assets'
  AND (storage.foldername(name))[1] = 'projects'
  AND (select private.is_admin())
);

-- 4. Policy: Admin insert on portfolio-assets
--    Allows uploading new files only for authenticated owner/admin within projects/
CREATE POLICY "Admin insert on portfolio-assets"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'portfolio-assets'
  AND (storage.foldername(name))[1] = 'projects'
  AND (select private.is_admin())
);

-- 5. Policy: Admin update on portfolio-assets
--    Allows replacing/updating existing files only for authenticated owner/admin within projects/
CREATE POLICY "Admin update on portfolio-assets"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'portfolio-assets'
  AND (storage.foldername(name))[1] = 'projects'
  AND (select private.is_admin())
)
WITH CHECK (
  bucket_id = 'portfolio-assets'
  AND (storage.foldername(name))[1] = 'projects'
  AND (select private.is_admin())
);

-- 6. Policy: Admin delete on portfolio-assets
--    Allows deleting files only for authenticated owner/admin within projects/
CREATE POLICY "Admin delete on portfolio-assets"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'portfolio-assets'
  AND (storage.foldername(name))[1] = 'projects'
  AND (select private.is_admin())
);
